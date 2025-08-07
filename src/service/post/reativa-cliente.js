import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const reativarCliente = async (id) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.post(
      `/clientes/${id}/reativar`,
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
      error.response?.data?.message || "Erro ao reativar prestador";
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
