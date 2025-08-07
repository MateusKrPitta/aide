import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/login/index.js";
import Dashboard from "../pages/dashboard/index.js";
import Cadastro from "../pages/cadastro/index.js";
import Usuario from "../pages/cadastro/usuario/index.js";
import Servicos from "../pages/cadastro/servicos/index.js";
import Clientes from "../pages/cadastro/clientes/index.js";
import Servico from "../pages/servico/index.js";
import PalestrasCursos from "../pages/palestra-cursos/index.js";
import Financeiro from "../pages/financeiro/index.js";
import Prestadores from "../pages/cadastro/prestadores/index.js";
import RelatorioPalestrasCursos from "../pages/financeiro/palestras-cursos/index.js";
import RelatorioPrestadores from "../pages/financeiro/prestadores/index.js";
import FluxoCaixa from "../pages/financeiro/fluxo-caixa/index.js";
import Categoria from "../pages/cadastro/categoria/index.js";
import TipoPalestra from "../pages/cadastro/tipo-palestra/index.js";
import ContasPagar from "../pages/financeiro/contas-pagar/index.js";
import ContasReceber from "../pages/financeiro/contas-receber/index.js";
import PrivateRoute from "../components/private-route/index.js";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/servico"
        element={
          <PrivateRoute>
            <Servico />
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastro"
        element={
          <PrivateRoute>
            <Cadastro />
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastro/usuario"
        element={
          <PrivateRoute>
            <Usuario />
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastro/prestadores"
        element={
          <PrivateRoute>
            <Prestadores />
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastro/servicos"
        element={
          <PrivateRoute>
            <Servicos />
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastro/clientes"
        element={
          <PrivateRoute>
            <Clientes />
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastro/categoria"
        element={
          <PrivateRoute>
            <Categoria />
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastro/tipo-palestra"
        element={
          <PrivateRoute>
            <TipoPalestra />
          </PrivateRoute>
        }
      />
      <Route
        path="/palestras-cursos"
        element={
          <PrivateRoute>
            <PalestrasCursos />
          </PrivateRoute>
        }
      />
      <Route
        path="/financeiro"
        element={
          <PrivateRoute>
            <Financeiro />
          </PrivateRoute>
        }
      />
      <Route
        path="/financeiro/contas-pagar"
        element={
          <PrivateRoute>
            <ContasPagar />
          </PrivateRoute>
        }
      />
      <Route
        path="/financeiro/contas-receber"
        element={
          <PrivateRoute>
            <ContasReceber />
          </PrivateRoute>
        }
      />
      <Route
        path="/financeiro/palestras-cursos"
        element={
          <PrivateRoute>
            <RelatorioPalestrasCursos />
          </PrivateRoute>
        }
      />
      <Route
        path="/financeiro/prestadores"
        element={
          <PrivateRoute>
            <RelatorioPrestadores />
          </PrivateRoute>
        }
      />
      <Route
        path="/financeiro/fluxo-caixa"
        element={
          <PrivateRoute>
            <FluxoCaixa />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
