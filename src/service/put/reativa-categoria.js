import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const reativarCategoria = async (id) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.put(`/categorias/${id}/reativar`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.errors?.nome;
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
