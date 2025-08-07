export const relatoriosContasReceber = (recebers) => {
  return recebers.map((receber) => ({
    id: receber.id,
    nome: receber.nome,
    data: receber.data,
    categoria: receber.categoria,
  }));
};
