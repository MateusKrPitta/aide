import axios from "axios";
const API_URL = `${process.env.REACT_APP_BASE_API}`;
const httpsInstance = () => {
  const httpsAuthenticated = axios.create({
    baseURL: API_URL,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });

  httpsAuthenticated.interceptors.request.use(
    (config) => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const { token } = JSON.parse(storedUser);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return httpsAuthenticated;
};

export default httpsInstance;
