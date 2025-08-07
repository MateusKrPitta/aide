import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarServico = async (id, nome, categoria_id, descricao) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.put(
      `/servicos/${id}`,
      { nome, descricao, categoria_id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.errors?.nome;
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
