import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const buscarContasReceber = async (
  pagina = 1,
  limite = 10,
  filtros = {},
) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const params = {
      page: pagina,
      perPage: limite,
    };

    if (filtros.nome) params.search = filtros.nome;
    if (filtros.dataInicio) params.data_inicio = filtros.dataInicio;
    if (filtros.dataFim) params.data_fim = filtros.dataFim;
    if (filtros.categoria) params.categoria = filtros.categoria;
    if (filtros.status) params.status = filtros.status;
    if (filtros.custo_fixo !== undefined) params.custo_fixo = filtros.custo_fixo;
    if (filtros.custo_variavel !== undefined) params.custo_variavel = filtros.custo_variavel;

    const response = await https.get("/contas-receber", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    if (!response.data) {
      console.error("A API retornou dados vazios:", response);
      CustomToast({
        type: "warning",
        message: "Nenhum dado recebido da API",
      });
      return {
        data: [],
        total: 0,
        page: 1,
        perPage: limite,
        lastPage: 1,
      };
    }

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

    return {
      data: [],
      total: 0,
      page: 1,
      perPage: limite,
      lastPage: 1,
    };
  }
};

export const buscarContasReceberImprimir = async (filtros = {}) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const params = {};

    if (filtros.nome) params.search = filtros.nome;
    if (filtros.dataInicio || filtros.data_inicio) params.data_inicio = filtros.dataInicio || filtros.data_inicio;
    if (filtros.dataFim || filtros.data_fim) params.data_fim = filtros.dataFim || filtros.data_fim;
    if (filtros.categoria) params.categoria = filtros.categoria;
    if (filtros.status) params.status = filtros.status;
    if (filtros.custo_fixo !== undefined) params.custo_fixo = filtros.custo_fixo;
    if (filtros.custo_variavel !== undefined) params.custo_variavel = filtros.custo_variavel;

    const response = await https.get("/contas-receber/imprimir", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados para impressão:", error);
    throw error;
  }
};
