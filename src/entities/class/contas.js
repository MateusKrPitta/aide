export const contasPagarem = (contas) => {
  return contas.map((conta) => ({
    _id: conta.id,
    id: conta.id,
    nome: conta.nome || "Sem nome",
    data: conta.data ? new Date(conta.data).toLocaleDateString("pt-BR") : "",
    categoria: conta.categoria || "Não categorizado",
    valor: `R$ ${parseFloat(conta.valor || 0)
      .toFixed(2)
      .replace(".", ",")}`,
    status_pagamento: conta.status_pagamento || "Pendente",
    tipo: "Conta",
    originalData: conta,
  }));
};
