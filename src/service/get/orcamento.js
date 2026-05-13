import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const buscarOrcamento = async (page = 1, limit = 10, search = "", filters = {}) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.get("/orcamentos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        limit,
        search: search || undefined,
        data_inicio: filters.data_inicio || undefined,
        data_fim: filters.data_fim || undefined,
        cliente_id: filters.cliente_id || undefined,
        prestador_id: filters.prestador_id || undefined,
        servico_id: filters.servico_id || undefined,
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
