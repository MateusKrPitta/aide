import React, { useState } from "react";
import Navbar from "../../../components/navbars/header";
import HeaderPerfil from "../../../components/navbars/perfil";
import ButtonComponent from "../../../components/button";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CentralModal from "../../../components/modal-central";
import TransformIcon from "@mui/icons-material/Transform";
import MenuMobile from "../../../components/menu-mobile";
import ModalLateral from "../../../components/modal-lateral";
import {
  AddCircleOutline,
  Article,
  Category,
  DateRange,
  FilterAlt,
  InfoRounded,
  MonetizationOn,
  Money,
  Person,
  Person2,
  Print,
} from "@mui/icons-material";
import { IconButton, InputAdornment, MenuItem, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";
import TableLoading from "../../../components/loading/loading-table/loading";
import TableComponent from "../../../components/table";
import HeaderFinanceiro from "../../../components/navbars/financeiro";
import { headerAide } from "../../../entities/header/financeiro/aide";

const FluxoCaixa = () => {
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState(false);
  const [informacoes, setInformacoes] = useState(false);
  const [listaUsuarios, setListaUsuarios] = useState([
    {
      tipo: "Entrada",
      data: "01/02/2025",
      assunto: "Pagamento Cliente",
      valor: "R$ 200,00",
      categoria: "Marketing",
    },
    {
      tipo: "Saída",
      data: "01/02/2025",
      assunto: "Conta Luz",
      valor: "R$ 200,00",
      categoria: "Contas",
    },
  ]);

  const FecharFiltro = () => setFiltro(false);

  const Informacoes = () => {
    setInformacoes(true);
  };

  const FecharCadastroUsuario = () => {
    setCadastroUsuario(false);
  };

  const handleClosInformacoes = () => {
    setInformacoes(false);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <div className="flex w-full ">
      <Navbar />
      <div className="flex ml-0 flex-col gap-3 w-full items-end md:ml-0 ">
        <MenuMobile />
        <motion.div
          style={{ width: "100%" }}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.9 }}
        >
          <HeaderPerfil pageTitle="Fluxo de Caixa" />

          <div className=" items-center justify-center lg:justify-start w-full flex mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="hidden md:block md:w-[60%] lg:w-[14%]">
              <HeaderFinanceiro />
            </div>
            <div className="w-[100%] itens-center mt-2 ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[80%]">
              <div className="flex gap-2 flex-wrap w-full items-center justify-center md:justify-start">
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
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <ButtonComponent
                  startIcon={<AddCircleOutline fontSize="small" />}
                  title={"Cadastrar"}
                  subtitle={"Cadastrar"}
                  buttonSize="large"
                  onClick={() => setCadastroUsuario(true)}
                />
                <IconButton
                  title="Filtro"
                  onClick={() => setFiltro(true)}
                  className="view-button w-10 h-10 "
                  sx={{
                    color: "black",
                    border: "1px solid black",
                    "&:hover": {
                      color: "#fff",
                      backgroundColor: "#9D4B5B",
                      border: "1px solid black",
                    },
                  }}
                >
                  <FilterAlt fontSize={"small"} />
                </IconButton>
                <IconButton
                  title="Imprimir"
                  className="view-button w-10 h-10 "
                  sx={{
                    color: "black",
                    border: "1px solid black",
                    "&:hover": {
                      color: "#fff",
                      backgroundColor: "#9D4B5B",
                      border: "1px solid black",
                    },
                  }}
                >
                  <Print fontSize={"small"} />
                </IconButton>
              </div>
              <div className="w-full flex">
                {loading ? (
                  <TableLoading />
                ) : listaUsuarios.length > 0 ? (
                  <TableComponent
                    headers={headerAide}
                    rows={listaUsuarios}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      view: Informacoes,
                    }}
                  />
                ) : (
                  <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                    <TableLoading />
                    <label className="text-sm">
                      Cliente ou Prestador não encontrado!
                    </label>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-end mt-4 mr-9 w-full">
                <label
                  className="flex w-[60%] md:w-[33%] items-center justify-center text-xs gap-4 font-bold"
                  style={{
                    backgroundColor: "white",
                    color: "#9D4B5B",
                    border: "1px solid #9D4B5B",
                    borderRadius: "10px",
                    padding: "10px",
                  }}
                >
                  <MonetizationOnIcon /> Total Entradas: R$ 200,00
                </label>
              </div>
              <div className="flex items-center justify-center md:justify-end mt-4 mr-9 w-full">
                <label
                  className="flex w-[60%] md:w-[33%] items-center justify-center text-xs gap-4 font-bold"
                  style={{
                    backgroundColor: "white",
                    color: "#9D4B5B",
                    border: "1px solid #9D4B5B",
                    borderRadius: "10px",
                    padding: "10px",
                  }}
                >
                  <MonetizationOnIcon /> Total Saídas: R$ 200,00
                </label>
              </div>
              <div className="flex items-center justify-center md:justify-end mt-4 mr-9 w-full">
                <label
                  className="flex w-[60%] md:w-[33%] items-center justify-center text-xs gap-4 font-bold"
                  style={{
                    backgroundColor: "#9D4B5B",
                    color: "white",
                    borderRadius: "10px",
                    padding: "10px",
                  }}
                >
                  <MonetizationOnIcon /> Total: R$ 200,00
                </label>
              </div>
              <CentralModal
                tamanhoTitulo={"81%"}
                maxHeight={"90vh"}
                top={"20%"}
                left={"28%"}
                width={"500px"}
                icon={<AddCircleOutline fontSize="small" />}
                open={cadastroUsuario}
                onClose={FecharCadastroUsuario}
                title="Cadastrar Entrada/Saída"
              >
                <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
                  <div className="mt-4 flex gap-3 flex-wrap">
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Tipo"
                      defaultValue="entrada"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "40%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TransformIcon />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="entrada">Entrada</MenuItem>
                      <MenuItem value="saida">Saída</MenuItem>
                    </TextField>

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Assunto "
                      name="Assunto"
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "50%" },
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
                      label="Observação "
                      name="Observação"
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "93%" },
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
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Categoria"
                      defaultValue="entrada"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "45%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Category />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="entrada">Categoria 01</MenuItem>
                      <MenuItem value="saida">Categoria 02</MenuItem>
                    </TextField>

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Valor "
                      name="Valor"
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "40%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Money />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="flex w-[96%] items-end justify-end mt-2 ">
                    <ButtonComponent
                      startIcon={<AddCircleOutline fontSize="small" />}
                      title={"Cadastrar"}
                      subtitle={"Cadastrar"}
                      // onClick={CadastrarUsuario}
                      buttonSize="large"
                    />
                  </div>
                </div>
              </CentralModal>
              <CentralModal
                tamanhoTitulo={"81%"}
                maxHeight={"90vh"}
                top={"20%"}
                left={"28%"}
                width={"450px"}
                icon={<FilterAlt fontSize="small" />}
                open={filtro}
                onClose={FecharFiltro}
                title="Filtro"
              >
                <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
                  <div className="flex items-center flex-wrap w-[95%] gap-3 mt-2">
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="date"
                      label="Data Início"
                      autoComplete="off"
                      sx={{
                        width: { xs: "47%", sm: "50%", md: "40%", lg: "47%" },
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
                      label="Data Fim"
                      autoComplete="off"
                      sx={{
                        width: { xs: "48%", sm: "50%", md: "40%", lg: "49%" },
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
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Tipo"
                      defaultValue="entrada"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "40%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TransformIcon />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="entrada">Entrada</MenuItem>
                      <MenuItem value="saida">Saída</MenuItem>
                    </TextField>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Categoria"
                      defaultValue="entrada"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "50%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Category />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="entrada">Categoria 01</MenuItem>
                      <MenuItem value="saida">Categoria 01</MenuItem>
                    </TextField>
                    <div className="flex items-end justify-end w-full">
                      <ButtonComponent
                        startIcon={<SearchIcon fontSize="small" />}
                        title={"Pesquisar"}
                        subtitle={"Pesquisar"}
                        buttonSize="large"
                      />
                    </div>
                  </div>
                </div>
              </CentralModal>

              <ModalLateral
                open={informacoes}
                handleClose={handleClosInformacoes}
                tituloModal="Informações"
                icon={<InfoRounded />}
                tamanhoTitulo="75%"
                conteudo={
                  <div className="flex flex-wrap w-full items-center gap-4">
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Tipo"
                      defaultValue="entrada"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "40%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TransformIcon />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="entrada">Entrada</MenuItem>
                      <MenuItem value="saida">Saída</MenuItem>
                    </TextField>

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Assunto "
                      name="Assunto"
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "50%" },
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
                      label="Observação "
                      name="Observação"
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "93%" },
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
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Categoria"
                      defaultValue="entrada"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "45%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Category />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="entrada">Categoria 01</MenuItem>
                      <MenuItem value="saida">Categoria 02</MenuItem>
                    </TextField>

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Valor "
                      name="Valor"
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "40%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Money />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                }
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FluxoCaixa;
