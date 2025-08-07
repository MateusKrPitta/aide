import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarCategoria = async (id, nome) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.put(
      `/categorias/${id}`,
      { nome },
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
