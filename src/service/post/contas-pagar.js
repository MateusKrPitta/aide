import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const criarContasPagar = async (dados) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const response = await https.post("/contas", dados, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        setor: sessionStorage.getItem("setor_id"),
      },
    });

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.errors ||
      error.response?.data?.message ||
      "Erro ao cadastrar conta";
    throw new Error(errorMessage);
  }
};
