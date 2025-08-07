import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const criarCliente = async (
  nome,
  telefone,
  cpf_cnpj,
  email,
  estado,
  cidade,
  endereco,
  numero,
  complemento
) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const response = await https.post(
      "/clientes",
      {
        nome,
        telefone,
        cpf_cnpj,
        email,
        estado,
        cidade,
        endereco,
        numero,
        complemento,
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
