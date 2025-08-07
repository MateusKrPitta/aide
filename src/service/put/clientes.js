import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarClientes = async (
  id,
  nome,
  telefone,
  email,
  estado,
  cidade,
  endereco,
  cpf_cnpj,
  complemento
) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.put(
      `/clientes/${id}`,
      {
        nome,
        telefone,
        email,
        estado,
        cidade,
        endereco,
        cpf_cnpj,
        complemento,
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
    const errorMessage = error.response?.data?.errors?.nome;
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
