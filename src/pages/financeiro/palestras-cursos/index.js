import React, { useState, useEffect } from "react";
import Navbar from "../../../components/navbars/header";
import HeaderPerfil from "../../../components/navbars/perfil";
import ButtonComponent from "../../../components/button";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CentralModal from "../../../components/modal-central";
import TransformIcon from "@mui/icons-material/Transform";
import MenuMobile from "../../../components/menu-mobile";
import ModalLateral from "../../../components/modal-lateral";
import {
  DateRange,
  FilterAlt,
  InfoRounded,
  MonetizationOn,
  Person,
  Person2,
  Print,
  Save,
} from "@mui/icons-material";
import { IconButton, InputAdornment, MenuItem, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";
import TableLoading from "../../../components/loading/loading-table/loading";
import TableComponent from "../../../components/table";
import HeaderFinanceiro from "../../../components/navbars/financeiro";
import { headerPalestras } from "../../../entities/header/financeiro/palestras";

const RelatorioPalestrasCursos = () => {
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState(false);
  const [informacoes, setInformacoes] = useState(false);
  const [listaUsuarios, setListaUsuarios] = useState([
    {
      nome: "Treinamento de Lideres",
      data: "01/02/2025",
      cliente: "Maria Oliveira",
      valor: "R$ 200,00",
      status: "Pago",
    },
    {
      nome: "Como ter Engajamento?",
      data: "02/02/2025",
      valor: "R$ 200,00",
      cliente: "Ricardo Oliveira",
      status: "Pendente",
    },
  ]);

  const FecharFiltro = () => setFiltro(false);

  const Informacoes = () => {
    setInformacoes(true);
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
          <HeaderPerfil pageTitle="Relatorio de Palestras e Cursos" />

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
                    headers={headerPalestras}
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
                      Palestra ou Curso não encontrado!
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
                  <MonetizationOnIcon /> Total Pago: R$ 200,00
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
                  <MonetizationOnIcon /> Total Pendente: R$ 200,00
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
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Palestra/Curso"
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "100%" },
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
                      label="Cliente"
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "100%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person2 />
                          </InputAdornment>
                        ),
                      }}
                    />
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
                    <label className="text-sm w-full font-bold">
                      Serviços:
                    </label>
                    <div
                      className="w-full flex items-center"
                      style={{
                        backgroundColor: "#CCCCCC",
                        borderRadius: "10px",
                        padding: "10px",
                      }}
                    >
                      <label className="text-xs font-semibold w-[70%]">
                        Treinamento
                      </label>
                      <label
                        className="p-1 text-xs w-[30%] flex items-center justify-center"
                        style={{
                          backgroundColor: "white",
                          borderRadius: "10px",
                        }}
                      >
                        R$ 200,00
                      </label>
                    </div>
                    <div className="flex items-end justify-end w-full">
                      <label
                        className="w-[70%] text-sm font-bold flex items-center justify-center gap-3"
                        style={{
                          backgroundColor: "#9D4B5B",
                          color: "white",
                          borderRadius: "10px",
                          padding: "10px",
                        }}
                      >
                        <MonetizationOn fontSize="small" /> Total: R$ 200,00
                      </label>
                    </div>
                    <div className="flex items-end justify-end gap-2 w-full">
                      <TextField
                        select
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Status Pagamento"
                        defaultValue="entrada"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "50%",
                            md: "40%",
                            lg: "45%",
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MonetizationOn />
                            </InputAdornment>
                          ),
                        }}
                      >
                        <MenuItem value="entrada">Pendente</MenuItem>
                        <MenuItem value="saida">Pago</MenuItem>
                      </TextField>
                    </div>
                    <div className="flex items-end justify-end w-full">
                      <ButtonComponent
                        startIcon={<Save fontSize="small" />}
                        title={"Salvar"}
                        subtitle={"Salvar"}
                        buttonSize="large"
                      />
                    </div>
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

export default RelatorioPalestrasCursos;
