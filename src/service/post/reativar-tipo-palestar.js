import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const reativarTipoPalestra = async (id) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.post(
      `/tipo-palestras/${id}/reativar`,
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
      error.response?.data?.message || "Erro ao reativar tipo de palestra";
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
