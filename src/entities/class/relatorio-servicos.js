import { mascaraValor } from "../../utils/mascaras/formatValor";

export const relatoriosServicoPagar = (servicosPagar) => {
  return servicosPagar.map((servicosPaga) => ({
    id: servicosPaga.id,
    servico_nome: servicosPaga.servico_nome,
    orcamento_nome: servicosPaga.orcamento_nome,
    cliente_nome: servicosPaga.cliente_nome,
    prestador_nome: servicosPaga.prestador_nome,
    data_inicio: servicosPaga.data_inicio,
    status_comissao: servicosPaga.status_comissao_texto,
    data_entrega: servicosPaga.data_entrega,
    valor_total: servicosPaga.valor_total,
    comissao: mascaraValor(servicosPaga.comissao),
    valor_prestador: mascaraValor(servicosPaga.valor_prestador),
    status_texto: servicosPaga.status_texto,
  }));
};
