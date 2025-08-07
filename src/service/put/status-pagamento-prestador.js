import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarStatusPagamento = async (id, tipo, status) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.put(
      `/orcamentos/parcelas/${id}/status`,
      { tipo, status },
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
