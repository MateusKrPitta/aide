import CustomToast from "../../components/toast";
import httpsInstance from "../url";

export const login = async (email, password) => {
  const https = httpsInstance();
  try {
    const response = await https.post("/login", {
      email,
      password,
    });

    if (response.data?.message) {
      CustomToast({
        type: "success",
        message: response.data.message,
        duration: 3000,
      });
    }

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.errors
      ? typeof error.response.data.errors === "string"
        ? error.response.data.errors
        : Object.values(error.response.data.errors).join(", ")
      : error.response?.data?.message || "Erro desconhecido";

    CustomToast({
      type: "error",
      message: errorMessage,
      duration: 5000,
    });
    throw error;
  }
};
