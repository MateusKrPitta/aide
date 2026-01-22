import httpsInstance from "../url";

export const buscarContasPagar = async (
  page = 1,
  perPage = 10,
  filters = {},
) => {
  const https = httpsInstance();
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    throw new Error("Token não encontrado");
  }

  try {
    const params = {
      page,
      perPage,
      ...filters,
    };

    Object.keys(params).forEach((key) => {
      if (
        params[key] === "" ||
        params[key] === null ||
        params[key] === undefined
      ) {
        delete params[key];
      }
    });

    const response = await https.get("/contas", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "max-age=300",
      },
      params,
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.message;
      if (errorMessage === "Credenciais inválidas") {
        window.location.href = "/";
      }
      throw new Error(errorMessage);
    }
    throw error;
  }
};
