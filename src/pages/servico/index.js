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
  DateRange,
  Edit,
  Person,
  Person2,
  Search,
  Work,
  WorkHistory,
} from "@mui/icons-material";
import ButtonComponent from "../../components/button";
import CentralModal from "../../components/modal-central";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import TableLoading from "../../components/loading/loading-table/loading";
import TableComponent from "../../components/table";
import { atendimentosCadastrados } from "../../entities/header/atendimentos";
import ModalLateral from "../../components/modal-lateral";
import Acordion from "../../components/accordion";
import ClienteAtendimento from "./cadastro/cliente";
import PrestadorAtendimento from "./cadastro/prestador";
import TrabalhoAtendimento from "./cadastro/trabalho";
import DocumentosAtendimento from "./cadastro/documentos";
import ClienteEditar from "./editar/cliente";
import ServicoEditar from "./editar/servico";
import DocumentosEditar from "./editar/documentos";

const Servico = () => {
  const [editando, setEditando] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [efeito, setEfeito] = useState(false);

  const [cadastro, setCadastro] = useState(false);
  const [listaUsuarios, setListaUsuarios] = useState([
    {
      id: 1,
      cliente: "Lojas ACME",
      prestadores: "Agência Growth Tech",
      data_inicio: "10/05/2023",
      data_entrega: "10/06/2023",
      servicos: ["Desenvolvimento de Website", "SEO"],
      valor_total: "R$ 8.500,00",
      comissao: "R$ 1.275,00",
      status: "Entregue",
    },
    {
      id: 2,
      cliente: "Clinica Vital",
      prestadores: "MK Digital",
      data_inicio: "15/05/2023",
      data_entrega: "15/08/2023",
      servicos: ["Gestão de Redes Sociais", "E-mail Marketing"],
      valor_total: "R$ 6.200,00/mês",
      comissao: "R$ 930,00/mês",
      status: "Em andamento",
    },
    {
      id: 3,
      cliente: "Indústria Têxtil LTDA",
      prestadores: "SysTech Solutions",
      data_inicio: "01/04/2023",
      data_entrega: "01/07/2023",
      servicos: ["Sistema ERP Personalizado"],
      valor_total: "R$ 45.000,00",
      comissao: "R$ 6.750,00",
      status: "Desenvolvimento",
    },
    {
      id: 4,
      cliente: "Restaurante Sabor & Arte",
      prestadores: "Performance Digital",
      data_inicio: "22/05/2023",
      data_entrega: "22/06/2023",
      servicos: ["Campanhas de Google Ads"],
      valor_total: "R$ 3.500,00 + R$ 5.000,00 (mídia)",
      comissao: "R$ 525,00",
      status: "Ativo",
    },
  ]);

  const handleCloseEdicao = () => {
    setEditando(false);
  };

  const EditarOpcao = () => {
    setEditando(true);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const FecharCadastro = () => {
    setCadastro(false);
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
          <HeaderPerfil pageTitle="Serviço" />

          <div className=" items-center justify-center lg:justify-start w-full mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="w-[100%] itens-center mt-2 ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[95%]">
              <div className="flex gap-2 flex-wrap w-full justify-center md:justify-start">
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Buscar Serviço"
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
                ) : listaUsuarios.length > 0 ? (
                  <TableComponent
                    headers={atendimentosCadastrados}
                    rows={listaUsuarios}
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
            width={"700px"}
            icon={<AddCircleOutline fontSize="small" />}
            open={cadastro}
            onClose={FecharCadastro}
            title="Cadastrar Serviço"
          >
            <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
              <div className="mt-4 flex gap-3 flex-wrap">
                <Box className="flex w-full items-center justify-start">
                  <BottomNavigation
                    showLabels
                    className="w-[95%] flex-wrap"
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
                      { label: "Prestador", icon: <Person2 /> },
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
                    >
                      <ClienteAtendimento />
                    </motion.div>
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
                    >
                      <PrestadorAtendimento />
                    </motion.div>
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
                    >
                      <TrabalhoAtendimento />
                    </motion.div>
                  </div>
                )}
                {activeStep === 3 && (
                  <div className="flex w-full flex-wrap gap-3 font-bold mt-4">
                    <motion.div
                      style={{ width: "100%" }}
                      initial="hidden"
                      animate="visible"
                      variants={fadeIn}
                      transition={{ duration: 0.9 }}
                    >
                      <DocumentosAtendimento />
                    </motion.div>
                  </div>
                )}
              </div>

              <div className="flex w-[96%] items-end justify-between mt-4 ">
                {activeStep > 0 && (
                  <ButtonComponent
                    startIcon={
                      <ArrowForwardIosIcon
                        fontSize="small"
                        style={{ transform: "rotate(180deg)" }}
                      />
                    }
                    title={"Voltar"}
                    subtitle={"Voltar"}
                    buttonSize="large"
                    onClick={() => handleStepChange(activeStep - 1)}
                  />
                )}

                <ButtonComponent
                  endIcon={<ArrowForwardIosIcon fontSize="small" />}
                  title={activeStep === 3 ? "Finalizar" : "Avançar"}
                  subtitle={activeStep === 3 ? "Finalizar" : "Avançar"}
                  buttonSize="large"
                  onClick={() => {
                    if (activeStep < 3) {
                      handleStepChange(activeStep + 1);
                    } else {
                      // Lógica para finalizar o cadastro
                      FecharCadastro();
                    }
                  }}
                />
              </div>
            </div>
          </CentralModal>

          <ModalLateral
            open={editando}
            width={{
              xs: "400px",
              lg: "800px",
            }}
            handleClose={handleCloseEdicao}
            tituloModal="Editar Serviço"
            icon={<Edit />}
            tamanhoTitulo="75%"
            conteudo={
              <div
                className="w-full flex items-start gap-3 flex-wrap"
                style={{ maxHeight: "500px", overflow: "auto" }}
              >
                <div
                  className="flex flex-col items-center justify-center w-full md:w-[20%] p-5"
                  style={{ border: "1px solid #9D4B5B", borderRadius: "10px" }}
                >
                  <Person />
                  <label className="text-xs font-bold">Prestador</label>
                </div>
                <div
                  className="flex flex-col gap-2 items-center justify-center w-full md:w-[80%] p-5"
                  style={{ border: "1px solid #9D4B5B", borderRadius: "10px" }}
                >
                  <Acordion
                    icone={<Work />}
                    titulo={"Informações do Serviço"}
                    informacoes={
                      <div className="flex items-center gap-4 w-full flex-wrap">
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          type="date"
                          label="Data de Início"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "30%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DateRange />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          type="date"
                          label="Previsão de Entrega"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "30%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DateRange />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </div>
                    }
                  ></Acordion>

                  <Acordion
                    icone={<WorkHistory />}
                    titulo={"Serviço"}
                    informacoes={<ServicoEditar />}
                  >
                    <ServicoEditar />
                  </Acordion>

                  <Acordion
                    icone={<Person />}
                    titulo={"Cliente"}
                    informacoes={<ClienteEditar />}
                  ></Acordion>

                  <Acordion
                    icone={<Article />}
                    titulo={"Documentos"}
                    informacoes={<DocumentosEditar />}
                  >
                    <ServicoEditar />
                  </Acordion>
                </div>
              </div>
            }
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Servico;
