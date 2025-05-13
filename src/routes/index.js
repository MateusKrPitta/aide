import { Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/login/index.js';
import Dashboard from '../pages/dashboard/index.js';
import Cadastro from '../pages/cadastro/index.js';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cadastro" element={<Cadastro />} />

        </Routes>
    );
};

export default AppRoutes;