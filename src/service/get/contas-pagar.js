import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const buscarContasPagar = async () => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    throw new Error("Token não encontrado");
  }

  try {
    const response = await https.get("/contas", {
      headers: {
        Authorization: `Bearer ${token}`,

        "Cache-Control": "max-age=300",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.message;
      if (errorMessage === "Credenciais inválidas") {
        window.location.href = "/";
      }
      throw new Error(errorMessage);
    }
    throw error;
  }
};
