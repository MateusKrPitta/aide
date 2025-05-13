import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ClearIcon from '@mui/icons-material/Clear';
import { Modal, Box, Menu, MenuItem, Typography } from "@mui/material";
import Title from "../../title";
import ButtonComponent from "../../button";
import LogoutIcon from '@mui/icons-material/Logout';
import CustomToast from "../../toast";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 3,
  p: 4,
};

const HeaderPerfil = ({ pageTitle = "Dashboard" }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);

  const userData = JSON.parse(localStorage.getItem('user'));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenLogoutConfirm = () => setOpenLogoutConfirm(true);
  const handleCloseLogoutConfirm = () => setOpenLogoutConfirm(false);

  const confirmLogout = async () => {
    handleCloseLogoutConfirm();
    localStorage.clear();
    navigate("/");
    CustomToast({ type: "success", message: "Logout realizado com sucesso!" });
  };

  return (
    <>
      <div className="hidden lg:flex justify-end w-full h-8">
        <div
          className="flex items-center justify-between pl-3 pr-4 w-[100%] h-20 bg-cover bg-no-repeat rounded-bl-lg"
          style={{ backgroundColor: '#9D4B5B' }}
        >
          <div className="w-[100%] items-star flex itens-center flex-wrap gap-4 p-2">
            <h1 className='flex items-start text-2xl font-bold text-white w-[80%]'>
              {pageTitle}
            </h1>

            <div className="w-[15%] flex items-center justify-start text-white gap-2" style={{ backgroundColor: 'white', borderRadius:'10px', padding:3 }}>
              <a className="cursor-pointer p-1" style={{ color: "#9D4B5B" }}>
                <AccountCircleIcon />
              </a>
              <span className="text-xs text-primary font-bold ">
                {userData?.fullName || "Usuário"}
              </span>
            </div>
          </div>
          <div className="w-[3%] flex justify-center items-center" style={{ backgroundColor: 'white', borderRadius: '50px' }}>
            <a onClick={handleMenuOpen} className="cursor-pointer p-1">
              <LogoutIcon fontSize="small" />
            </a>
          </div>
        </div>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        className="p-4"
      >
        <MenuItem onClick={handleOpenLogoutConfirm} title="Sair do sistema" className="flex items-center gap-2">
          <LogoutIcon fontSize="small" className="text-red" /> Sair
        </MenuItem>
      </Menu>

      <Modal
        open={openLogoutConfirm}
        aria-labelledby="logout-modal-title"
        aria-describedby="logout-modal-description"
      >
        <Box sx={style}>
          <div className='flex justify-between'>
            <Typography id="logout-modal-title" variant="h6" component="h2">
              <Title
                conteudo={"Confirmação de Logout"}
                fontSize={"18px"}
                fontWeight={"700"}
                color={"black"}
              />
            </Typography>
            <button className='text-red' title="Fechar" onClick={handleCloseLogoutConfirm}><ClearIcon /></button>
          </div>
          <Typography id="logout-modal-description" sx={{ mt: 2 }}>
            <Title
              conteudo={"Tem certeza de que deseja sair?"}
              fontSize={"15px"}
              fontWeight={"500"}
            />
          </Typography>
          <div className="flex gap-2 justify-end mt-4">
            <ButtonComponent
              subtitle={"Confirmar Logout"}
              title={"SIM"}
              onClick={confirmLogout}
            />
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default HeaderPerfil;