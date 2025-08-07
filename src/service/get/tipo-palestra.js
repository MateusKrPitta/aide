import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const listarTiposPalestra = async (filtroAtivos = null) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const params = {};
    if (filtroAtivos !== null) {
      params.ativos = filtroAtivos;
    }

    const response = await https.get("/tipo-palestras", {
      params,
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
        errorDetails ===
        "Usuário não possui permissão para listar tipos de palestra."
      ) {
        CustomToast({
          type: "warning",
          message: errorDetails,
        });
      } else {
        CustomToast({ type: "error", message: errorMessage });
      }
    } else {
      CustomToast({
        type: "error",
        message: "Erro na conexão com o servidor",
      });
    }
    throw error;
  }
};
