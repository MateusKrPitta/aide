import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/login/index.js";
import Dashboard from "../pages/dashboard/index.js";
import Cadastro from "../pages/cadastro/index.js";
import Usuario from "../pages/cadastro/usuario/index.js";
import Servicos from "../pages/cadastro/servicos/index.js";
import Clientes from "../pages/cadastro/clientes/index.js";
import Atendimentos from "../pages/atendimentos/index.js";
import PalestrasCursos from "../pages/palestra-cursos/index.js";
import Financeiro from "../pages/financeiro/index.js";
import Prestadores from "../pages/cadastro/prestadores/index.js";
import RelatorioPalestrasCursos from "../pages/financeiro/palestras-cursos/index.js";
import RelatorioPrestadores from "../pages/financeiro/prestadores/index.js";
import RelatorioAide from "../pages/financeiro/aide/index.js";
import Categoria from "../pages/cadastro/categoria/index.js";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/atendimentos" element={<Atendimentos />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/cadastro/usuario" element={<Usuario />} />
      <Route path="/cadastro/prestadores" element={<Prestadores />} />
      <Route path="/cadastro/servicos" element={<Servicos />} />
      <Route path="/cadastro/clientes" element={<Clientes />} />
      <Route path="/cadastro/categoria" element={<Categoria />} />

      <Route path="/palestras-cursos" element={<PalestrasCursos />} />
      <Route path="/financeiro" element={<Financeiro />} />
      <Route
        path="/financeiro/palestras-cursos"
        element={<RelatorioPalestrasCursos />}
      />
      <Route
        path="/financeiro/prestadores"
        element={<RelatorioPrestadores />}
      />
      <Route path="/financeiro/aide" element={<RelatorioAide />} />
    </Routes>
  );
};

export default AppRoutes;
