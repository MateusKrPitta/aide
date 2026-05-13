import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const buscarPalestraCurso = async (
  page = 1,
  perPage = 10,
  search = "",
  filters = {},
) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.get("/palestra_cursos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        perPage,
        search: search || undefined,
        tipo_palestra_id: filters.tipo_palestra_id || undefined,
        status_pagamento: filters.status_pagamento || undefined,
        data_inicio: filters.data_inicio || undefined,
        data_fim: filters.data_fim || undefined,
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
      } else if (errorDetails === "Usuário não possui permissão para listar.") {
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
