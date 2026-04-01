import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const buscarRelatorioTotalPalestras = async (filtros = {}) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const params = new URLSearchParams();

    if (filtros.page) params.append("page", filtros.page);
    if (filtros.perPage) params.append("perPage", filtros.perPage);
    if (filtros.cliente_id) params.append("cliente_id", filtros.cliente_id);
    if (filtros.tipo_palestra_id)
      params.append("tipo_palestra_id", filtros.tipo_palestra_id);
    if (filtros.data_inicio) params.append("data_inicio", filtros.data_inicio);
    if (filtros.data_fim) params.append("data_fim", filtros.data_fim);
    if (filtros.status_pagamento)
      params.append("status_pagamento", filtros.status_pagamento);

    const response = await https.get("/relatorio-palestras/total", {
      params: Object.fromEntries(params),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.message;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar relatório total",
      });
    }
    throw error;
  }
};
