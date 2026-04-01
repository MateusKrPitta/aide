export const contasPagarem = (contas) => {
  const formatarValor = (valor) => {
    if (valor === undefined || valor === null) return "R$ 0,00";

    const numero = Number(valor);
    if (isNaN(numero)) return "R$ 0,00";

    const valorFormatado = numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    });

    return `R$ ${valorFormatado}`;
  };

  return contas.map((conta) => ({
    _id: conta.id,
    id: conta.id,
    nome: conta.nome || "Sem nome",
    data: conta.data ? new Date(conta.data).toLocaleDateString("pt-BR") : "",
    categoria: conta.categoria || "Não categorizado",
    valor: formatarValor(conta.valor),
    status_pagamento: conta.status_pagamento || "Pendente",
    tipo: "Conta",
    originalData: conta,
  }));
};
