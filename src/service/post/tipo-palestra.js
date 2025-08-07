import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const criarTipoPalestra = async (nome) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const response = await https.post(
      "/tipo-palestras",
      {
        nome,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          setor: sessionStorage.getItem("setor_id"),
        },
      }
    );

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.errors || error.response?.data?.success;
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
