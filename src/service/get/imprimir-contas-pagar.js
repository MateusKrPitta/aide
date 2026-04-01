import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const buscarContasImprimir = async (filters = {}) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `/contas-pagar/imprimir?${queryString}`
      : "/contas-pagar/imprimir";

    const response = await https.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro detalhado na requisição:", error);

    if (error.response) {
      const errorMessage = error.response.data.message || "Erro desconhecido";
      const errorDetails = error.response.data.data;

      if (errorMessage === "Credenciais inválidas") {
        CustomToast({
          type: "error",
          message: "Sessão expirada, redirecionando...",
        });
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
        CustomToast({
          type: "error",
          message: errorMessage,
        });
      }
    } else {
      CustomToast({
        type: "error",
        message: "Sem resposta do servidor",
      });
    }

    throw error;
  }
};
