import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const criarFluxoCaixa = async (
  tipo,
  assunto,
  observacao,
  categoria_id,
  valor
) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const response = await https.post(
      "/movimentacoes",
      {
        tipo,
        assunto,
        observacao,
        categoria_id,
        valor,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          setor: sessionStorage.getItem("setor_id"),
        },
      }
    );

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.errors || error.response?.data?.success;
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
