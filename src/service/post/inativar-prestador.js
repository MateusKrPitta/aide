import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const inativarPrestador = async (id) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.post(
      `/prestadores/${id}/inativar`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Erro ao inativar prestador";
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
