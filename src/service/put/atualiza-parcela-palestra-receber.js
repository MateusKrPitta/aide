import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarStatusParcela = async (id, status_pagamento) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.put(`/parcela-palestra-curso/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Erro ao atualizar parcela";
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
