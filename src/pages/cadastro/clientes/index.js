import React, { useState } from "react";
import Navbar from "../../../components/navbars/header";
import HeaderPerfil from "../../../components/navbars/perfil";
import ButtonComponent from "../../../components/button";
import HeaderCadastro from "../../../components/navbars/cadastro";
import CentralModal from "../../../components/modal-central";
import MenuMobile from "../../../components/menu-mobile";
import ModalLateral from "../../../components/modal-lateral";
import {
  Article,
  Category,
  Edit,
  Mail,
  Numbers,
  Person,
  Phone,
  Work,
} from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import NotesIcon from "@mui/icons-material/Notes";
import { motion } from "framer-motion";
import TableLoading from "../../../components/loading/loading-table/loading";
import TableComponent from "../../../components/table";
import { servicoCadastrados } from "../../../entities/header/cadastro/servico";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const Clientes = () => {
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [listaServicos, setListaServicos] = useState([
    {
      id: 1,
      nome: "Manutenção de Computadores",
      descricao:
        "Serviço completo de manutenção preventiva e corretiva para computadores",
    },
    {
      id: 2,
      nome: "Desenvolvimento Web",
      descricao: "Criação de sites e aplicações web personalizadas",
    },
    {
      id: 3,
      nome: "Consultoria em TI",
      descricao:
        "Análise e recomendação de soluções tecnológicas para empresas",
    },
    {
      id: 4,
      nome: "Redes e Infraestrutura",
      descricao: "Instalação e configuração de redes corporativas",
    },
    {
      id: 5,
      nome: "Suporte Técnico",
      descricao:
        "Atendimento remoto e presencial para resolução de problemas técnicos",
    },
  ]);
  const FecharCadastroUsuario = () => {
    setCadastroUsuario(false);
  };

  const handleCloseEdicao = () => {
    setEditando(false);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const EditarOpcao = () => {
    setEditando(true);
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
          <HeaderPerfil pageTitle="Clientes" />

          <div className=" items-center justify-center lg:justify-start w-full flex mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="hidden md:block md:w-[60%] lg:w-[14%]">
              <HeaderCadastro />
            </div>
            <div className="w-[100%] itens-center mt-2 ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[80%]">
              <div className="flex gap-2 flex-wrap w-full justify-center md:justify-start">
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Buscar usuário"
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
                  startIcon={<AddCircleOutlineIcon fontSize="small" />}
                  title={"Cadastrar"}
                  subtitle={"Cadastrar"}
                  buttonSize="large"
                  onClick={() => setCadastroUsuario(true)}
                />
              </div>

              <div className="w-full">
                {loading ? (
                  <TableLoading />
                ) : listaServicos.length > 0 ? (
                  <TableComponent
                    headers={servicoCadastrados}
                    rows={listaServicos}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      edit: EditarOpcao,
                      inactivate: "",
                    }}
                  />
                ) : (
                  <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                    <TableLoading />
                    <label className="text-sm">Serviço não encontrado!</label>
                  </div>
                )}
              </div>

              <CentralModal
                tamanhoTitulo={"81%"}
                maxHeight={"90vh"}
                top={"20%"}
                left={"28%"}
                width={"600px"}
                icon={<AddCircleOutlineIcon fontSize="small" />}
                open={cadastroUsuario}
                onClose={FecharCadastroUsuario}
                title="Cadastrar Cliente"
              >
                <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
                  <div className="flex w-full mt-4 flex-wrap items-center gap-4">
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
                          xs: "48%",
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
                      label="CPF/CNPJ"
                      name="cpf"
                      autoComplete="off"
                      sx={{
                        width: {
                          xs: "47%",
                          sm: "50%",
                          md: "40%",
                          lg: "44%",
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
                      label="Email"
                      name="telefone"
                      autoComplete="off"
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "50%",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Categoria"
                      name="numero"
                      autoComplete="off"
                      sx={{
                        width: {
                          xs: "47%",
                          sm: "50%",
                          md: "40%",
                          lg: "29%",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Category />
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
                          xs: "48%",
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
                          xs: "47%",
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
                          xs: "48%",
                          sm: "50%",
                          md: "40%",
                          lg: "17%",
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

                  <div className="flex w-[96%] items-end justify-end mt-2 ">
                    <ButtonComponent
                      startIcon={<AddCircleOutlineIcon fontSize="small" />}
                      title={"Cadastrar"}
                      subtitle={"Cadastrar"}
                      // onClick={CadastrarUsuario}
                      buttonSize="large"
                    />
                  </div>
                </div>
              </CentralModal>

              <ModalLateral
                open={editando}
                handleClose={handleCloseEdicao}
                tituloModal="Editar Cliente"
                icon={<Edit />}
                tamanhoTitulo="75%"
                conteudo={
                  <div className="">
                    <div className="flex w-full mt-4 flex-wrap items-center gap-4">
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
                            lg: "100%",
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
                            lg: "100%",
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
                        label="CPF/CNPJ"
                        name="cpf"
                        autoComplete="off"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "50%",
                            md: "40%",
                            lg: "100%",
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
                        label="Email"
                        name="telefone"
                        autoComplete="off"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "50%",
                            md: "40%",
                            lg: "100%",
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Mail />
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
                            lg: "100%",
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
                            lg: "100%",
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
                            lg: "100%",
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
                            lg: "100%",
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
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Categoria"
                        name="numero"
                        autoComplete="off"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "50%",
                            md: "40%",
                            lg: "100%",
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Category />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>

                    <div className="flex w-[100%] items-end justify-end mt-2 ">
                      <ButtonComponent
                        startIcon={<AddCircleOutlineIcon fontSize="small" />}
                        title={"Salvar"}
                        subtitle={"Salvar"}
                        buttonSize="large"
                        //onClick={EditarUsuario}
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

export default Clientes;
