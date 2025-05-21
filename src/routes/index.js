import { Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/login/index.js';
import Dashboard from '../pages/dashboard/index.js';
import Cadastro from '../pages/cadastro/index.js';
import Usuario from '../pages/cadastro/usuario/index.js';
import Servicos from '../pages/cadastro/servicos/index.js';
import Clientes from '../pages/cadastro/clientes/index.js';
import Atendimentos from '../pages/atendimentos/index.js';
import Prestadores from '../pages/cadastro/prestadores/index.js';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/Atendimentos" element={<Atendimentos />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/cadastro/usuario" element={<Usuario />} />
            <Route path="/cadastro/servicos" element={<Servicos />} />
            <Route path="/cadastro/clientes" element={<Clientes />} />
            <Route path="/cadastro/prestadores" element={<Prestadores />} />
        </Routes>
    );
};

export default AppRoutes;