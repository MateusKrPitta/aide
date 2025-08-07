import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const deletarContasReceber = async (id) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.delete(`/contas-receber/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (response.data && response.data.message) {
      CustomToast({ type: "success", message: response.data.message });
    }
    return response.data;
  } catch (error) {
    let errorMessage = "Erro ao deletar estoque!";

    if (error.response?.data) {
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.errors) {
        errorMessage = error.response.data.errors.join(", ") || errorMessage;
      } else if (error.response.data.success) {
        errorMessage = error.response.data.success;
      }
    }

    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
