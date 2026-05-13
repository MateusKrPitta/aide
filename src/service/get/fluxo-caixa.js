import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const buscarFluxoCaixa = async (params = new URLSearchParams()) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const url = `/movimentacoes${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await https.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
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
      } else if (
        errorDetails === "Usuário não possui permissão para listar categorias."
      ) {
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

export const buscarFluxoCaixaImprimir = async (filtros = {}) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const params = new URLSearchParams();
    if (filtros.dataInicio) params.append("data_inicio", filtros.dataInicio);
    if (filtros.dataFim) params.append("data_fim", filtros.dataFim);
    if (filtros.tipoFiltro) params.append("tipo", filtros.tipoFiltro);
    if (filtros.categoriaFiltro) params.append("categoria_id", filtros.categoriaFiltro);
    if (filtros.origemFiltro) params.append("origem", filtros.origemFiltro);
    if (filtros.pesquisa) params.append("search", filtros.pesquisa);

    const response = await https.get(`/movimentacoes/imprimir?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados para impressão do fluxo:", error);
    throw error;
  }
};
