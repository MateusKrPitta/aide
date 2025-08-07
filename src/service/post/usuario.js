import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const criarUsuarios = async (
  nome,
  username,
  email,
  password,
  telefone,
  permissao
) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const response = await https.post(
      "/usuario",
      {
        nome,
        username,
        email,
        password,
        telefone,
        permissao,
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
