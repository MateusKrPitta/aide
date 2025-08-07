// src/service/put/contas-pagar.js
import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarContasPagar = async (dados, id) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const response = await https.put(`/contas-pagar/${id}`, dados, {
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
