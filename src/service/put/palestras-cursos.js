import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarPalestraCurso = async (dados, id) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const response = await https.put(`/palestra_cursos/${id}`, dados, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors ||
      "Erro ao criar prestador";
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
