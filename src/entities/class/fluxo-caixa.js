import { mascaraValor } from "../../utils/mascaras/formatValor";

export const cadastrosFluxoCaixa = (lancamentos) => {
  if (!Array.isArray(lancamentos)) return [];

  return lancamentos.map((item) => ({
    id: item.id,
    tipo: item.tipo,
    data: item.data ? new Date(item.data).toLocaleDateString("pt-BR") : "-",
    descricao: item.descricao || "-",
    observacao: item.observacao || "-",
    categoria: item.categoria_nome || "Sem categoria",
    categoriaId: item.categoria_id || null,
    data_vencimento: item.data_vencimento,
    origem: item.origem,
    status: item.status_texto || "Pendente",
    prestador_nome: item.prestador_nome,
    valor: mascaraValor(item.valor.toString()),
    valorOriginal: item.valor,
    status_texto: item.status_texto,
    is_pago: item.is_pago,
    status_codigo: item.status_codigo,
    podeExcluir: item.origem === "movimentacao",
  }));
};
