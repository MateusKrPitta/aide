import httpsInstance from "../url";

export const atualizarContasPagar = async (dados, id) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const dadosParaEnviar = {
      status_geral: dados.status_geral,
      data_pagamento: dados.data_pagamento || null,
      nome: dados.nome,
      valor_total: dados.valor_total,
      categoria_id: dados.categoria_id,
      prestador_id: dados.prestador_id,
      data_inicio: dados.data_inicio,
    };

    const response = await https.put(`/contas-pagar/${id}`, dadosParaEnviar, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        setor: sessionStorage.getItem("setor_id"),
      },
    });

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.errors ||
      error.response?.data?.message ||
      "Erro ao atualizar conta";
    throw new Error(errorMessage);
  }
};
