export const gerarRelatorioFinanceiro = (contas, orcamentos) => {
  if (
    (!contas || !Array.isArray(contas)) &&
    (!orcamentos || !Array.isArray(orcamentos))
  )
    return [];

  const statusMap = {
    1: "Pendente",
    2: "Pago",
    3: "Em Andamento",
  };

  const formatarData = (dataString) => {
    if (!dataString) return "Data não informada";
    const date = new Date(dataString);
    return date.toLocaleDateString("pt-BR");
  };

  const formatarValor = (valor) => {
    if (!valor) return "R$ 0,00";
    const numero = typeof valor === "string" ? parseFloat(valor) : valor;
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const contasFormatadas = contas.flatMap((conta) => {
    if (!conta.parcelas || !conta.parcelas.length) {
      return {
        tipo: "Despesa",
        nome: conta.nome || "Sem nome",
        data: formatarData(conta.data_inicio),
        categoria: conta.categoria_id
          ? `Categoria ${conta.categoria_id}`
          : "Sem categoria",
        valor: formatarValor(conta.valor_total || conta.valor_mensal),
        status: statusMap[conta.status_geral] || "Status desconhecido",
        parcela: "Única",
        originalData: conta,
      };
    }

    return conta.parcelas.map((parcela) => ({
      tipo: "Despesa",
      nome: conta.nome || "Sem nome",
      data: formatarData(parcela.data_vencimento),
      categoria: conta.categoria_id
        ? `Categoria ${conta.categoria_id}`
        : "Sem categoria",
      valor: formatarValor(parcela.valor),
      status:
        statusMap[parcela.status_pagamento] ||
        statusMap[conta.status_geral] ||
        "Status desconhecido",
      parcela: `${
        parcela.descricao ||
        `Parcela ${parcela.numero_parcela}/${conta.parcelas.length}`
      }`,
      originalData: { ...conta, parcelaEspecifica: parcela },
    }));
  });

  const receitasFormatadas = orcamentos.flatMap((orcamento) => {
    if (!orcamento.servicos || !orcamento.servicos.length) return [];

    return orcamento.servicos.flatMap((servico) => {
      if (!servico.parcelas || !servico.parcelas.length) {
        return {
          tipo: "Receita",
          nome: `${servico.servico.nome} - ${orcamento.orcamento.nome}`,
          data: formatarData(servico.data_pagamento),
          categoria: "Serviço Prestado",
          valor: formatarValor(servico.valor_total),
          status:
            statusMap[orcamento.status_pagamento_prestador] ||
            "Status desconhecido",
          parcela: "Única",
          originalData: { orcamento, servico },
        };
      }

      return servico.parcelas.map((parcela) => ({
        tipo: "Receita",
        nome: `${servico.servico.nome} - ${orcamento.orcamento.nome}`,
        data: formatarData(parcela.data_pagamento),
        categoria: "Serviço Prestado",
        valor: formatarValor(parcela.valor_parcela),
        status:
          statusMap[parcela.status_pagamento_prestador] ||
          statusMap[orcamento.status_pagamento_prestador] ||
          "Status desconhecido",
        parcela: `Parcela ${parcela.numero_parcela}/${servico.parcelas.length}`,
        originalData: { orcamento, servico, parcela },
      }));
    });
  });

  return [...contasFormatadas, ...receitasFormatadas].sort((a, b) => {
    const dateA = new Date(
      a.originalData.parcelaEspecifica?.data_vencimento ||
        a.originalData.data_inicio ||
        a.originalData.parcela?.data_pagamento ||
        a.originalData.servico?.data_pagamento
    );
    const dateB = new Date(
      b.originalData.parcelaEspecifica?.data_vencimento ||
        b.originalData.data_inicio ||
        b.originalData.parcela?.data_pagamento ||
        b.originalData.servico?.data_pagamento
    );
    return dateA - dateB;
  });
};
