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
  MenuItem,
  TextField,
} from "@mui/material";
import {
  AddCircleOutline,
  AddCircleOutlineOutlined,
  AddCircleOutlineRounded,
  Article,
  Assignment,
  Close,
  DateRange,
  Edit,
  Money,
  MoneyOutlined,
  Numbers,
  Person,
  Person2,
  Phone,
  Search,
  Work,
} from "@mui/icons-material";
import ButtonComponent from "../../components/button";
import CentralModal from "../../components/modal-central";
import ButtonClose from "../../components/buttons/button-close";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TableLoading from "../../components/loading/loading-table/loading";
import TableComponent from "../../components/table";
import { atendimentosCadastrados } from "../../entities/header/atendimentos";
import ModalLateral from "../../components/modal-lateral";

const Atendimentos = () => {
  const [editando, setEditando] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [efeito, setEfeito] = useState(false);
  const [cadastro, setCadastro] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([
    "Limpeza Dentária",
    "Clareamento",
    "Restauração",
    "Extração",
    "Ortodontia",
  ]);
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
          <HeaderPerfil pageTitle="Atendimentos" />

          <div className=" items-center justify-center lg:justify-start w-full mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="w-[100%] itens-center mt-2 ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[95%]">
              <div className="flex gap-2 flex-wrap w-full justify-center md:justify-start">
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Buscar Atendimento"
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
            title="Cadastrar Atendimento"
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
                      <div className="flex w-full  flex-wrap items-center gap-4">
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Nome Cliente"
                          name="nome"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "47%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Telefone"
                          name="telefone"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "47%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="CPF"
                          name="cpf"
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
                                <Article />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Estado"
                          name="estado"
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
                                <LocationOnIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Cidade"
                          name="cidade"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "32%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOnIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Endereço"
                          name="endereco"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "47%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOnIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Número"
                          name="numero"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "47%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Numbers />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </div>
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
                      <div className="flex w-full  flex-wrap items-center gap-4">
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Prestadores"
                          name="prestador"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "47%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Work />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <ButtonComponent
                          startIcon={<AddCircleOutline fontSize="small" />}
                          title={"Adicionar"}
                          subtitle={"Adicionar"}
                          buttonSize="large"
                        />
                      </div>
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
                      <div className="flex w-full  flex-wrap items-center gap-4">
                        <label className="text-xs w-full">Prestador:</label>
                        <TextField
                          select
                          fullWidth
                          label="Selecione um serviço"
                          value=""
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "40%",
                            },
                          }}
                          onChange={(event) => {
                            const service = event.target.value;
                            if (
                              service &&
                              !selectedServices.includes(service)
                            ) {
                              setSelectedServices([
                                ...selectedServices,
                                service,
                              ]);
                              setAvailableServices(
                                availableServices.filter((s) => s !== service)
                              );
                            }
                          }}
                          variant="outlined"
                          size="small"
                          s
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Assignment />
                              </InputAdornment>
                            ),
                          }}
                        >
                          {availableServices.map((service) => (
                            <MenuItem key={service} value={service}>
                              {service}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Data de Início"
                          type="date"
                          name="data"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "25%",
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
                          label="Data de Entrega"
                          name="data"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "25%",
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
                        {selectedServices.map((service) => (
                          <div
                            style={{
                              border: "1px solid hsl(348, 35.30%, 45.50%)",
                              borderRadius: "10px",
                              padding: "10px",
                            }}
                            className="flex w-[95%] items-center gap-3 justify-between"
                            key={service}
                          >
                            <label className="text-xs w-[30%] ">
                              {service}
                            </label>
                            <TextField
                              fullWidth
                              variant="outlined"
                              size="small"
                              label="Valor"
                              name="valor"
                              autoComplete="off"
                              sx={{
                                width: {
                                  xs: "100%",
                                  sm: "50%",
                                  md: "40%",
                                  lg: "25%",
                                },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Money />
                                  </InputAdornment>
                                ),
                              }}
                            />
                            <TextField
                              fullWidth
                              variant="outlined"
                              size="small"
                              label="Comissão"
                              name="comissao"
                              autoComplete="off"
                              sx={{
                                width: {
                                  xs: "100%",
                                  sm: "50%",
                                  md: "40%",
                                  lg: "25%",
                                },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <MoneyOutlined />
                                  </InputAdornment>
                                ),
                              }}
                            />
                            <ButtonClose
                              funcao={() => {
                                setSelectedServices(
                                  selectedServices.filter((s) => s !== service)
                                );
                                setAvailableServices([
                                  ...availableServices,
                                  service,
                                ]);
                              }}
                            />
                          </div>
                        ))}
                      </div>
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
                      <div className="flex w-full flex-col gap-4">
                        {/* Input para upload de arquivos */}
                        <input
                          type="file"
                          id="document-upload"
                          accept=".pdf"
                          multiple
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            setSelectedDocuments((prev) => [
                              ...prev,
                              ...files.map((file) => ({
                                name: file.name,
                                file: file,
                              })),
                            ]);
                          }}
                        />
                        <div className="w-[40%]">
                          <ButtonComponent
                            startIcon={
                              <AddCircleOutlineOutlined fontSize="small" />
                            }
                            title={"Adicionar Documentos"}
                            subtitle={"Adicionar Documentos"}
                            buttonSize="large"
                            onClick={() =>
                              document.getElementById("document-upload").click()
                            }
                          />
                        </div>
                        {/* Botão para acionar o input file */}

                        {/* Lista de documentos adicionados */}
                        <div className="flex flex-col w-[95%] gap-2 mt-2">
                          {selectedDocuments.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border border-primary rounded"
                            >
                              <div className="flex items-center gap-2">
                                <Article fontSize="small" />
                                <label className="text-xs">{doc.name}</label>
                              </div>
                              <ButtonClose
                                funcao={() => {
                                  setSelectedDocuments((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  );
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
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
            width={'800px'}
            handleClose={handleCloseEdicao}
            tituloModal="Editar Atendimento"
            icon={<Edit />}
            tamanhoTitulo="83%"
            conteudo={
            <div className="w-full flex gap-3">
               <div className="flex flex-col justify-center ga w-[20%]" style={{border:'1px solid #9D4B5B', borderRadius:"10px"}}>
                <Person fontSize="small"/>
                <label>Prestador</label>
                </div> 
            </div>}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Atendimentos;
