import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const buscarCategoria = async (filtros = {}) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filtros)) {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    }

    const response = await https.get(`/categorias?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.message;
      const errorDetails = error.response.data.data;

      if (errorMessage === "Credenciais inválidas") {
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else if (
        errorDetails === "Usuário não possui permissão para listar categorias."
      ) {
        CustomToast({
          type: "warning",
          message: errorDetails,
        });
      } else {
        CustomToast({ type: "error", message: errorMessage });
      }
    }
    throw error;
  }
};
