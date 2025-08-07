import React, { useState } from "react";
import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import Logo from "../../assets/png/logo.png";
import LoadingLogin from "../../components/loading/loading-login";
import { useNavigate } from "react-router-dom";
import packageJson from "../../../package.json";
import "./login.css";
import { login } from "../../service/post/login";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSenhaChange = (e) => {
    setSenha(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    setLoading(true);

    try {
      const response = await login(email, senha);
      if (response.data?.token) {
        sessionStorage.setItem("token", response.data.token.token);
        sessionStorage.setItem("nome", response.data.user.nome);
        sessionStorage.setItem("permissao", response.data.user.permissao);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      if (error.response) {
        console.error("Detalhes do erro:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-container flex h-screen items-center justify-center ">
        <div
          className="relative p-8 rounded-lg shadow-lg max-w-md w-full z-10"
          style={{ border: "1px solid #9D4B5B", backgroundColor: "white" }}
        >
          <div className="flex justify-center mb-10">
            <img
              src={Logo}
              alt="Logo Pax Verde"
              className="w-22"
              style={{ borderRadius: "10px", width: "30%" }}
            />
          </div>
          <div className="flex iten"></div>
          <input
            type="text"
            value={email}
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
            placeholder="Email"
            autoComplete="off"
            className="cpf-input w-full p-3 mb-4 rounded-md border-2  focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="relative w-full mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={senha}
              onChange={handleSenhaChange}
              onKeyPress={handleKeyPress}
              placeholder="Senha"
              className="password-input w-full p-3 rounded-md border-2  focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer opacity-25"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <VisibilityOffOutlined size={24} />
              ) : (
                <VisibilityOutlined size={24} />
              )}
            </div>
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: "#9D4B5B",
              color: "white",
              fontWeight: "600",
            }}
            className="login-button w-full text-white p-2 rounded-md bg-custom-green"
          >
            {loading ? <LoadingLogin /> : "Entrar"}
          </button>
          <div className="versao-app text-center text-primary font-bold mt-10">
            <p> Versão {packageJson.version}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
