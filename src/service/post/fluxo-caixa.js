import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const criarFluxoCaixa = async (
  tipo,
  assunto,
  observacao,
  categoria_id,
  valor,
  status = 1,
  data_vencimento = null,
) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const dados = {
      tipo,
      assunto,
      observacao,
      categoria_id,
      valor,
      status,
    };

    if (data_vencimento) {
      dados.data_vencimento = data_vencimento;
    }

    const response = await https.post("/movimentacoes", dados, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        setor: sessionStorage.getItem("setor_id"),
      },
    });

    CustomToast({
      type: "success",
      message: "Movimentação cadastrada com sucesso!",
    });

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.errors ||
      error.response?.data?.message ||
      error.response?.data?.success ||
      "Erro ao cadastrar movimentação";

    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
