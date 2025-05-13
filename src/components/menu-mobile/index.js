import React, { useEffect, useState } from "react";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { ExitToApp } from '@mui/icons-material';
import AddToQueueIcon from '@mui/icons-material/AddToQueue';
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import AddchartIcon from '@mui/icons-material/Addchart';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Logo from '../../assets/png/logo.png';
import SelectTextFields from '../select';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import MenuIcon from "@mui/icons-material/Menu";
const MenuMobile = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const tipoUsuario = localStorage.getItem('tipo');
    const userData = JSON.parse(localStorage.getItem('user'));

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNavigate = (route) => {
        navigate(route);
        handleClose();
    };



    return (
        <div className='w-[100%] flex items-center justify-center p-3 gap-10 z-30 lg:hidden' style={{ backgroundColor: '#d2d7db' }}>
            <div className='flex items-start w-[30%] md:mr-8'>
                <img style={{ width: '100%', marginRight: '150px', padding: '10px' }} src={Logo} alt="Total de Produtos" />
            </div>
            <div className="w-[42%] md:w-[25%] sm:mr-0 lg:w-[25%] md:mr-6 justify-center flex p-2 bg-white rounded-md">
                <SelectTextFields
                    width={'150px'}
                    icon={<LocationOnIcon fontSize="small" />}
                    label={'Unidades'}
                    backgroundColor={"#D9D9D9"}
                    borderRadius={'5px'}
                    name={"unidade"}
                    fontWeight={500}
                    
                />
            </div>
            <div className='flex items-start w-[20%] sm:w-[10%] md:w-[15%]'>
                <button
                    id="basic-button"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    style={{ backgroundColor: '#0d2d43', padding:10, color: 'white', borderRadius: '5px', width: '100%' }}
                >
                    <MenuIcon fontSize='small' />
                </button>
            </div>

            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={() => handleNavigate("/dashboard")} style={{ color: 'black', gap: '10px', display: 'flex', alignItems: 'center', fontWeight: '600', fontSize: '15px' }}>
                    <DashboardIcon style={{ color: '#0d2d43' }} />Dashboard
                </MenuItem>
                {tipoUsuario !== "3" && (
                    <MenuItem onClick={() => handleNavigate("/vendas")} style={{ color: 'black', gap: '8px', display: 'flex', alignItems: 'center', fontWeight: '600', fontSize: '15px' }}>
                        <AddchartIcon style={{ color: '#0d2d43' }}  />Vendas
                    </MenuItem>
                )}
                {tipoUsuario !== "3" && (
                    <MenuItem onClick={() => handleNavigate("/saidas")} style={{ color: 'black', gap: '8px', display: 'flex', alignItems: 'center', fontWeight: '600', fontSize: '15px' }}>
                        <AddToQueueIcon style={{ color: '#0d2d43' }}  />Saídas
                    </MenuItem>
                )}
                <MenuItem onClick={() => handleNavigate("/relatorio")} style={{ color: 'black', gap: '8px', display: 'flex', alignItems: 'center', fontWeight: '600', fontSize: '15px' }}>
                    <DataThresholdingIcon style={{ color: '#0d2d43' }} />Relatório
                </MenuItem>

                <MenuItem onClick={() => handleNavigate("/cadastro")} style={{ color: 'black', gap: '8px', display: 'flex', alignItems: 'center', fontWeight: '600', fontSize: '15px' }}>
                    <MiscellaneousServicesIcon style={{ color: '#0d2d43' }}  />Cadastro
                </MenuItem>
                <MenuItem onClick={() => handleNavigate("/")} style={{ color: 'black', gap: '8px', display: 'flex', alignItems: 'center', fontWeight: '600', fontSize: '15px' }}>
                    <ExitToApp style={{ color: '#0d2d43' }}  />Sair
                </MenuItem>
            </Menu>
        </div>
    );
}

export default MenuMobile;