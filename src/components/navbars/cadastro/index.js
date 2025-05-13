import React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ButtonComponent from '../../button';
import { useNavigate } from 'react-router-dom';
import { Person, Work } from '@mui/icons-material';

const HeaderCadastro = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('user'));
    const userType = userData?.tipo;

    const handleNavigation = (section) => {
        switch (section) {
            case 'usuario':
                navigate('/cadastro/usuario');
                break;
            case 'clientes':
                navigate('/cadastro/clientes');
                break;
            case 'servicos':
                navigate('/cadastro/servicos');
                break;

            default:
                console.warn(`Seção desconhecida: ${section}`);
                break;
        }
    };

    return (
        <div className="w-[100%] items-center justify-center flex flex-wrap lg:justify-start gap-2 md:gap-1">

            <ButtonComponent
                startIcon={<AccountCircleIcon fontSize="small" />}
                title="Usuário"
                buttonSize="large"
                onClick={() => handleNavigation('usuario')}
                className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
            />

            <ButtonComponent
                startIcon={<Person fontSize="small" />}
                title="Clientes"
                buttonSize="large"
                onClick={() => handleNavigation('clientes')}
                className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
            />


            <ButtonComponent
                startIcon={<Work fontSize="small" />}
                title="Serviços"
                buttonSize="large"
                onClick={() => handleNavigation('servicos')}
                className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
            />
        </div>
    );
};

export default HeaderCadastro;