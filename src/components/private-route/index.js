import { Navigate } from "react-router-dom";
import CustomToast from "../toast";

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    CustomToast({
      type: "error",
      message: "Você precisa estar logado para acessar essa página.",
    });
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
