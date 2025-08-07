import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarParcelaContasPagar = async (id, dadosParcela) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    if (!id) {
      throw new Error("ID da parcela é obrigatório");
    }

    const formaPagamentoMap = {
      dinheiro: 1,
      pix: 2,
      cartao: 3,
      transferencia: 4,
    };

    const dadosFormatados = {
      ...dadosParcela,
      data_vencimento: dadosParcela.data_vencimento?.split("T")[0],
      data_pagamento: dadosParcela.data_pagamento?.split("T")[0],
      valor: parseFloat(dadosParcela.valor),
      status: parseInt(dadosParcela.status),
      forma_pagamento: formaPagamentoMap[dadosParcela.forma_pagamento] || null,
      status_pagamento: parseInt(dadosParcela.status), // Adicione esta linha
    };

    const response = await https.put(
      `/contas-pagar/parcelas/${id}`,
      dadosFormatados,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    CustomToast({
      type: "error",
      message: errorMessage,
    });
    throw error;
  }
};
