import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarPrestadores = async (
  id,
  nome,
  telefone,
  email,
  estado,
  cidade,
  endereco,
  numero,
  complemento,
  servicos,
  cpf
) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.put(
      `/prestadores/${id}`,
      {
        nome,
        telefone,
        email,
        estado,
        cidade,
        endereco,
        numero,
        complemento,
        servicos,
        cpf,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.response?.data?.errors?.nome;
    CustomToast({
      type: "error",
      message: errorMessage || "Erro ao atualizar prestador",
    });
    throw error;
  }
};
