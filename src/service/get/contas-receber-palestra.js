import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const buscarContasReceberPalestra = async () => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.get("/palestra_cursos-simplificado", {
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
  }
};
