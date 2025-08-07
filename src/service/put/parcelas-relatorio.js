import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarParcelasRelatorio = async (id, dados) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.put(`/parcelas-contas/${id}`, dados, {
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
