import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const atualizarUsuario = async (
  id,
  nome,
  username,
  email,
  password,
  permissao
) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  try {
    const response = await https.put(
      `/users/${id}`,
      { nome, username, email, password, permissao },
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
