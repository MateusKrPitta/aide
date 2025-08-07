import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const inativarServico = async (id) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.delete(`/servicos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Erro ao inativar tipo de palestra";
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
