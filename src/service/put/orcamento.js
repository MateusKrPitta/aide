import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizaOrcamento = async (dados, id) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const response = await https.put(`/orcamentos/${id}`, dados, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    CustomToast({
      type: "success",
      message: "Orçamento atualizado com sucesso!",
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors ||
      "Erro ao atualizar orçamento";
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
