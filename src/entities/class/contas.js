export const contasPagarTabela = (contas, relatorios = []) => {
  const formatarData = (dataString) => {
    if (!dataString) return "Data não informada";
    try {
      const date = new Date(dataString);
      return date.toLocaleDateString("pt-BR");
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return "Data inválida";
    }
  };

  const formatarValor = (valor) => {
    if (!valor) return "R$ 0,00";
    try {
      const numero = typeof valor === "string" ? parseFloat(valor) : valor;
      return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    } catch (e) {
      console.error("Erro ao formatar valor:", e);
      return "Valor inválido";
    }
  };

  const dataAtual = new Date();
  dataAtual.setHours(0, 0, 0, 0);

  const linhasContas = (contas || []).map((conta) => {
    try {
      const primeiraParcela = conta.parcelas?.[0] || {};
      const valorParaMostrar = conta.custo_variavel
        ? conta.valor_total
        : primeiraParcela.valor || conta.valor_mensal;

      const temParcelasVencidas = conta.parcelas?.some((parcela) => {
        if (!parcela) return false;
        const dataVencimento = new Date(parcela.data_vencimento);
        dataVencimento.setHours(0, 0, 0, 0);
        return dataVencimento <= dataAtual && parcela.status !== 2;
      });

      let statusTexto;
      if (temParcelasVencidas) {
        statusTexto = "Pendente";
      } else if (conta.status_geral === 2) {
        statusTexto = "Pago";
      } else {
        statusTexto = "Em Andamento";
      }

      return {
        id: conta.id ? `conta_${conta.id}` : "Sem ID",
        _id: conta.id,
        nome: conta.nome || "Sem nome",
        data: formatarData(
          primeiraParcela.data_vencimento || conta.data_inicio,
        ),
        valor: formatarValor(valorParaMostrar),
        categoria: conta.categoria_id
          ? `Categoria ${conta.categoria_id}`
          : "Sem categoria",
        status: statusTexto,
        tipo: "Conta",
        ativo: true,
        podeEditar: true,
        podeExcluir: true,
        originalData: conta,
        categoriaId: conta.categoria_id || null,
        dataObj: new Date(primeiraParcela.data_vencimento || conta.data_inicio),
      };
    } catch (error) {
      console.error("Erro ao processar conta:", conta, error);
      return {
        id: "Erro",
        nome: "Erro ao carregar",
        data: "Erro",
        valor: "Erro",
        categoria: "Erro",
        status: "Erro",
        tipo: "Conta",
        ativo: false,
        podeEditar: false,
        podeExcluir: false,
      };
    }
  });

  const linhasRelatorios = (relatorios || []).flatMap((relatorio) => {
    return relatorio.servicos.map((servico) => {
      try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        let temPendenteAtrasado = false;
        let temPendenteNaoAtrasado = false;
        let todasPagas = true;

        servico.parcelas?.forEach((parcela) => {
          const dataVencimento = new Date(parcela.data_pagamento);
          dataVencimento.setHours(0, 0, 0, 0);

          if (parcela.status_pagamento_prestador === 2) {
            todasPagas = false;
            if (dataVencimento <= hoje) {
              temPendenteAtrasado = true;
            } else {
              temPendenteNaoAtrasado = true;
            }
          }
        });

        let statusTexto;
        if (temPendenteAtrasado) {
          statusTexto = "Pendente";
        } else if (temPendenteNaoAtrasado) {
          statusTexto = "Em Andamento";
        } else {
          statusTexto = "Pago";
        }

        const valorTotalPrestador = servico.parcelas?.reduce(
          (sum, parcela) => sum + parseFloat(parcela.valor_prestador || 0),
          0,
        );

        const primeiraData = servico.parcelas?.[0]?.data_pagamento;

        return {
          id: `servico_${servico.id}`,
          _id: servico.id,
          nome: relatorio.orcamento?.nome || "Serviço sem nome",
          data: formatarData(primeiraData),
          valor: formatarValor(valorTotalPrestador),
          categoria: servico.servico?.nome || "Serviço",
          status: statusTexto,
          tipo: "Serviço",
          podeEditar: false,
          podeExcluir: false,
          ativo: true,
          originalData: {
            ...relatorio,
            servico,
          },
          categoriaId: servico.servico?.nome || "Serviço",
          dataObj: new Date(primeiraData),
        };
      } catch (error) {
        console.error("Erro ao processar serviço:", servico, error);
        return {
          id: "Erro",
          nome: "Erro ao carregar",
          data: "Erro",
          valor: "Erro",
          categoria: "Erro",
          status: "Erro",
          tipo: "Serviço",
          ativo: false,
          podeEditar: false,
          podeExcluir: false,
        };
      }
    });
  });

  return [...linhasContas, ...linhasRelatorios].sort((a, b) => {
    return b.dataObj - a.dataObj;
  });
};
