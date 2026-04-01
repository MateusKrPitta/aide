export const cadastrosPalestraCurso = (palestras) => {
  const formatarValor = (valor) => {
    if (valor === undefined || valor === null) return "0,00";

    const numero = Number(valor);
    if (isNaN(numero)) return "0,00";

    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return palestras.map((palestra) => ({
    id: palestra.id,
    nome: palestra.nome,
    data: new Date(palestra.data).toLocaleDateString("pt-BR"),
    cliente: palestra.cliente.nome,
    valor: formatarValor(palestra.valor),
    endereco: palestra.endereco,
    tipo_pagamento: palestra.tipo_pagamento,
    forma_pagamento: palestra.forma_pagamento,
    qtd_parcelas: palestra.qtd_parcelas,
    primeira_data_parcela: palestra.primeira_data_parcela,
    secoes: palestra.secoes,
    horário: palestra.horario,
    statusPagamento:
      palestra.status_pagamento === "1"
        ? "Pago"
        : palestra.status_pagamento === "3"
          ? "Pendente"
          : "Outro",
    ativo: palestra.ativo,
  }));
};
