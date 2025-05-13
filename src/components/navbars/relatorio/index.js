import React from 'react';
import ButtonComponent from '../../button';
import { useNavigate } from 'react-router-dom';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { Person } from '@mui/icons-material';

const HeaderRelatorio = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('user'));
    const userType = userData?.tipo;

    const handleNavigation = (section) => {
        switch (section) {
            case 'vendas':
                navigate('/relatorio/vendas');
                break;
            case 'saidas':
                navigate('/relatorio/saidas');
                break;
            case 'lista-fornecedor':
                navigate('/relatorio/lista-fornecedor');
                break;
            case 'lista-compra':
                navigate('/relatorio/lista-compra');
                break;
            default:
                console.warn(`Seção desconhecida: ${section}`);
                break;
        }
    };

    return (
        <div className="w-[100%] items-center justify-center flex flex-wrap lg:justify-start gap-2 md:gap-1">
            {/* Botões visíveis apenas para tipos 1 e 2 (Admin e Gerente) */}
            {[1, 2].includes(userType) && (
                <>
                    <ButtonComponent
                        startIcon={<PointOfSaleIcon fontSize="small" />}
                        title="Vendas"
                        buttonSize="large"
                        onClick={() => handleNavigation('vendas')}
                        className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
                    />

                    <ButtonComponent
                        startIcon={<CurrencyExchangeIcon fontSize="small" />}
                        title="Saídas"
                        buttonSize="large"
                        onClick={() => handleNavigation('saidas')}
                        className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
                    />

                    <ButtonComponent
                        startIcon={<FormatListBulletedIcon fontSize="small" />}
                        title="Lista de Compra"
                        buttonSize="large"
                        onClick={() => handleNavigation('lista-compra')}
                        className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
                    />
                </>
            )}

            {/* Botão Fornecedores visível para todos */}
            <ButtonComponent
                startIcon={<Person fontSize="small" />}
                title="Fornecedores"
                buttonSize="large"
                onClick={() => handleNavigation('lista-fornecedor')}
                className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
            />
        </div>
    );
};

export default HeaderRelatorio;