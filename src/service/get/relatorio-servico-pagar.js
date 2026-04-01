import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const buscarRelatorioServicoPagar = async ({
  page = 1,
  perPage = 10,
  search = "",
  status = "",
  data_inicio = "",
  data_fim = "",
  prestador_id = "",
  cliente_id = "",
}) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const params = {
      page,
      perPage,
    };

    if (search) params.search = search;
    if (status) params.status = status;
    if (data_inicio) params.data_inicio = data_inicio;
    if (data_fim) params.data_fim = data_fim;
    if (prestador_id) params.prestador_id = prestador_id;
    if (cliente_id) params.cliente_id = cliente_id;

    const response = await https.get(
      "/orcamentos/relatorios/servicos-resumido",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      },
    );
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
