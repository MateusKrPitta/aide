export const transformarOrcamentosParaTabela = (orcamentos) => {
  return orcamentos.map((orcamento) => {
    const dataInicio = new Date(
      orcamento.prestadores[0]?.servicos[0]?.data_inicio
    );
    const dataEntrega = new Date(
      orcamento.prestadores[0]?.servicos[0]?.data_entrega
    );

    let valorTotal = 0;
    let comissaoTotal = 0;

    orcamento.prestadores.forEach((prestador) => {
      prestador.servicos.forEach((servico) => {
        valorTotal += parseFloat(servico.valor_total) || 0;
        comissaoTotal += parseFloat(servico.comissao) || 0;
      });
    });

    return {
      id: orcamento.id,
      nome: orcamento.nome,
      cliente: orcamento.cliente.nome,
      prestadores: orcamento.prestadores
        .map((p) => p.prestador.nome)
        .join(", "),
      data_inicio: dataInicio.toLocaleDateString("pt-BR"),
      data_entrega: dataEntrega.toLocaleDateString("pt-BR"),
      valor_total: `R$ ${valorTotal.toFixed(2).replace(".", ",")}`,
      comissao: `R$ ${comissaoTotal.toFixed(2).replace(".", ",")}`,
    };
  });
};
