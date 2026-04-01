import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarParcelaCompleta = async (parcelaId, dados) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.put(
      `/orcamento-relatorios/parcela/${parcelaId}/completa`,
      dados,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Erro ao atualizar parcela";
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
