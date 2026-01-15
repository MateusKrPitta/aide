import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarUsuario = async (
  id,
  nome,
  username,
  email,
  telefone,
  permissao,
  password
) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  // Cria objeto de dados
  const data = {
    nome,
    username,
    email,
    telefone,
    permissao,
  };

  // Só adiciona password se não for vazio
  if (password && password.trim() !== "") {
    data.password = password;
  }

  try {
    const response = await https.put(`/users/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Erro ao atualizar usuário";
    CustomToast({ type: "error", message: errorMessage });
    throw error;
  }
};
