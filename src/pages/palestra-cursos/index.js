import React, { useEffect, useState } from "react";
import MenuMobile from "../../components/menu-mobile";
import HeaderPerfil from "../../components/navbars/perfil";
import Navbar from "../../components/navbars/header";
import { motion } from "framer-motion";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  AddCircleOutline,
  AddCircleOutlineOutlined,
  Article,
  Edit,
  Person,
  Person2,
  Search,
  Work,
} from "@mui/icons-material";
import ButtonComponent from "../../components/button";
import CentralModal from "../../components/modal-central";

import TableLoading from "../../components/loading/loading-table/loading";
import TableComponent from "../../components/table";
import { atendimentosCadastrados } from "../../entities/header/atendimentos";
import ModalLateral from "../../components/modal-lateral";
import { palestraCursosLista } from "../../entities/header/palestra-curso";

const PalestrasCursos = () => {
  const [editando, setEditando] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [efeito, setEfeito] = useState(false);

  const [cadastro, setCadastro] = useState(false);
  const [lista, setLista] = useState([
    {
      id: 1,
      cliente: "Lojas ACME",
      data: "20/05/2025",
      local: "Hotel Nova Andradina",
      horário: "10:00",
    },
    {
      id: 2,
      cliente: "Clinica Vital",
      data: "20/05/2025",
      local: "Hotel Nova Andradina",
      horário: "13:00",
    },
    {
      id: 3,
      cliente: "Indústria Têxtil LTDA",
      data: "20/05/2025",
      local: "Hotel Nova Andradina",
      horário: "11:00",
    },
  ]);

  const handleCloseEdicao = () => {
    setEditando(false);
  };

  const EditarOpcao = () => {
    setEditando(true);
  };

  const FecharCadastro = () => {
    setCadastro(false);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setEfeito(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  return (
    <div className="flex w-full">
      <Navbar />

      <div className="flex ml-0 flex-col gap-3 w-full items-end  just">
        <MenuMobile />
        <motion.div
          style={{ width: "100%" }}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.9 }}
        >
          <HeaderPerfil pageTitle="Palestras e Cursos" />

          <div className=" items-center justify-center lg:justify-start w-full mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="w-[100%] itens-center mt-2 ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[95%]">
              <div className="flex gap-2 flex-wrap w-full justify-center md:justify-start">
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Pesquisar"
                  autoComplete="off"
                  sx={{ width: { xs: "72%", sm: "50%", md: "40%", lg: "40%" } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <ButtonComponent
                  startIcon={<AddCircleOutlineOutlined fontSize="small" />}
                  title={"Cadastrar"}
                  subtitle={"Cadastrar"}
                  buttonSize="large"
                  onClick={() => setCadastro(true)}
                />
              </div>
              <div className="w-full flex">
                {loading ? (
                  <TableLoading />
                ) : lista.length > 0 ? (
                  <TableComponent
                    headers={palestraCursosLista}
                    rows={lista}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      edit: EditarOpcao,
                      delete: "",
                    }}
                  />
                ) : (
                  <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                    <TableLoading />
                    <label className="text-sm">Serviço não encontrado!</label>
                  </div>
                )}
              </div>
            </div>
          </div>
          <CentralModal
            tamanhoTitulo={"81%"}
            maxHeight={"90vh"}
            top={"20%"}
            left={"28%"}
            width={"550px"}
            icon={<AddCircleOutline fontSize="small" />}
            open={cadastro}
            onClose={FecharCadastro}
            title="Cadastrar Palestra ou Curso"
          >
            <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
              <div className="mt-4 flex gap-3 flex-wrap">
                <Box className="flex w-full items-center justify-start">
                  <BottomNavigation
                    showLabels
                    className="w-[95%]"
                    value={activeStep}
                    onChange={(event, newValue) => handleStepChange(newValue)}
                    sx={{
                      width: "fit-content",
                      border: "1px solid #9D4B5B",
                      backgroundColor: "#9D4B5B",
                      height: "100%",
                      borderRadius: 2,
                      paddingX: "24px",
                      paddingY: "12px",
                      gap: "24px",
                    }}
                  >
                    {[
                      { label: "Cliente", icon: <Person /> },
                      { label: "Trabalho", icon: <Work /> },
                      { label: "Documentos", icon: <Article /> },
                    ].map((item, index) => (
                      <BottomNavigationAction
                        key={index}
                        label={item.label}
                        icon={item.icon}
                        sx={{
                          minWidth: activeStep === index ? "180px" : "100px",
                          height: "45px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "8px",
                          color: activeStep === index ? "#9D4B5B" : "#ffffff",
                          backgroundColor:
                            activeStep === index ? "#ffffff" : "#9D4B5B",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor:
                              activeStep === index ? "#ffffff" : "#cf7889",
                          },
                          "&.Mui-selected": {
                            color: "#9D4B5B",
                          },
                        }}
                      />
                    ))}
                  </BottomNavigation>
                </Box>
                {activeStep === 0 && (
                  <div className="flex w-full flex-wrap gap-3 font-bold mt-4">
                    <motion.div
                      style={{ width: "100%" }}
                      initial="hidden"
                      animate="visible"
                      variants={fadeIn}
                      transition={{ duration: 0.9 }}
                    ></motion.div>
                  </div>
                )}
                {activeStep === 1 && (
                  <div className="flex w-full flex-wrap gap-3 font-bold mt-4">
                    <motion.div
                      style={{ width: "100%" }}
                      initial="hidden"
                      animate="visible"
                      variants={fadeIn}
                      transition={{ duration: 0.9 }}
                    ></motion.div>
                  </div>
                )}
                {activeStep === 2 && (
                  <div className="flex w-full flex-wrap gap-3 font-bold mt-4">
                    <motion.div
                      style={{ width: "100%" }}
                      initial="hidden"
                      animate="visible"
                      variants={fadeIn}
                      transition={{ duration: 0.9 }}
                    ></motion.div>
                  </div>
                )}
              </div>
            </div>
          </CentralModal>

          <ModalLateral
            open={editando}
            width={"800px"}
            handleClose={handleCloseEdicao}
            tituloModal="Editar Informações"
            icon={<Edit />}
            tamanhoTitulo="83%"
            conteudo={
              <div
                className="w-full flex items-start gap-3 "
                style={{ maxHeight: "500px", overflow: "auto" }}
              ></div>
            }
          />
        </motion.div>
      </div>
    </div>
  );
};

export default PalestrasCursos;
