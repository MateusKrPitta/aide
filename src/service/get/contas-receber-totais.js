import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const buscarContasReceberTotal = async (filtros = {}) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const params = {};
    if (filtros.dataInicio) params.data_inicio = filtros.dataInicio;
    if (filtros.dataFim) params.data_fim = filtros.dataFim;
    if (filtros.status) params.status = filtros.status;
    if (filtros.custo_fixo !== undefined) params.custo_fixo = filtros.custo_fixo;
    if (filtros.custo_variavel !== undefined) params.custo_variavel = filtros.custo_variavel;

    const response = await https.get("/contas-receber/totais", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
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
