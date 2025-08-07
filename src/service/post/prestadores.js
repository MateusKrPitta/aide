import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const criarPrestador = async (
  nome,
  telefone,
  cpf,
  email,
  estado,
  cidade,
  endereco,
  numero,
  complemento,
  servicos
) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const response = await https.post(
      "/prestadores",
      {
        nome,
        telefone,
        cpf,
        email,
        estado,
        cidade,
        endereco,
        numero,
        complemento,
        servicos,
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
      error.response?.data?.message ||
      error.response?.data?.errors ||
      "Erro ao criar prestador";
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
