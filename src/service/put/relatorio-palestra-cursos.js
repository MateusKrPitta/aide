import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarStatusPagParcela = async (id, status_pagamento) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.put(
      `/parcelas/${id}/status`,
      { status_pagamento: Number(status_pagamento) },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    CustomToast({
      type: "success",
      message: "Status atualizado com sucesso!",
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Erro ao atualizar status";
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
