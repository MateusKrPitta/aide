import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { ExitToApp } from "@mui/icons-material";
import AddToQueueIcon from "@mui/icons-material/AddToQueue";
import DataThresholdingIcon from "@mui/icons-material/DataThresholding";
import AddchartIcon from "@mui/icons-material/Addchart";
import Logo from "../../assets/png/logo.png";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import MenuIcon from "@mui/icons-material/Menu";
const MenuMobile = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
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
    <div
      className="w-[100%] flex items-center justify-center p-3 gap-10 z-30 lg:hidden"
      style={{ backgroundColor: "#d2d7db" }}
    >
      <div className="flex items-start w-[30%] mr-14 md:mr-8">
        <img
          style={{
            width: "100%",
            marginRight: "150px",
            padding: "10px",
            borderRadius: "100px",
          }}
          src={Logo}
          alt="Total de Produtos"
        />
      </div>

      <div className="flex items-start w-[20%] sm:w-[10%] md:w-[15%]">
        <button
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          style={{
            backgroundColor: "#9D4B5B",
            padding: 10,
            color: "white",
            borderRadius: "5px",
            width: "100%",
          }}
        >
          <MenuIcon fontSize="small" />
        </button>
      </div>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem
          onClick={() => handleNavigate("/dashboard")}
          style={{
            color: "black",
            gap: "10px",
            display: "flex",
            alignItems: "center",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          <DashboardIcon style={{ color: "#9D4B5B" }} />
          Dashboard
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigate("/palestras-cursos")}
          style={{
            color: "black",
            gap: "8px",
            display: "flex",
            alignItems: "center",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          <AddchartIcon style={{ color: "#9D4B5B" }} />
          Palestras e Cursos
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigate("/servico")}
          style={{
            color: "black",
            gap: "8px",
            display: "flex",
            alignItems: "center",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          <AddToQueueIcon style={{ color: "#9D4B5B" }} />
          Serviços
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigate("/financeiro")}
          style={{
            color: "black",
            gap: "8px",
            display: "flex",
            alignItems: "center",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          <DataThresholdingIcon style={{ color: "#9D4B5B" }} />
          Financeiro
        </MenuItem>

        <MenuItem
          onClick={() => handleNavigate("/cadastro")}
          style={{
            color: "black",
            gap: "8px",
            display: "flex",
            alignItems: "center",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          <MiscellaneousServicesIcon style={{ color: "#9D4B5B" }} />
          Cadastro
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigate("/")}
          style={{
            color: "black",
            gap: "8px",
            display: "flex",
            alignItems: "center",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          <ExitToApp style={{ color: "#9D4B5B" }} />
          Sair
        </MenuItem>
      </Menu>
    </div>
  );
};

export default MenuMobile;
