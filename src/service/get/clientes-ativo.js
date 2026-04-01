import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const buscarClientesAtivos = async () => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.get("/clientes/ativos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.message;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar clientes",
      });
    }
    throw error;
  }
};
