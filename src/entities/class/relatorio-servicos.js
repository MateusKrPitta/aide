export const relatoriosServicoPagar = (servicosPagar) => {
  const formatarValor = (valor) => {
    if (valor === undefined || valor === null) return "0,00";

    const numero = Number(valor);
    if (isNaN(numero)) return "0,00";

    const partes = numero.toFixed(2).split(".");
    const inteiro = partes[0];
    const decimal = partes[1];

    const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${inteiroFormatado},${decimal}`;
  };

  return servicosPagar.map((servicosPaga) => ({
    id: servicosPaga.id,
    servico_nome: servicosPaga.servico_nome,
    orcamento_nome: servicosPaga.orcamento_nome,
    cliente_nome: servicosPaga.cliente_nome,
    prestador_nome: servicosPaga.prestador_nome,
    data_inicio: servicosPaga.data_inicio,
    status_comissao: servicosPaga.status_comissao_texto,
    data_entrega: servicosPaga.data_entrega,
    valor_total: formatarValor(servicosPaga.valor_total),
    comissao: formatarValor(servicosPaga.comissao),
    valor_prestador: formatarValor(servicosPaga.valor_prestador),
    status_texto: servicosPaga.status_texto,
  }));
};
