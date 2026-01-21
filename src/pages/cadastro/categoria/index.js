import React, { useEffect, useState } from "react";
import Navbar from "../../../components/navbars/header";
import HeaderPerfil from "../../../components/navbars/perfil";
import ButtonComponent from "../../../components/button";
import HeaderCadastro from "../../../components/navbars/cadastro";
import CentralModal from "../../../components/modal-central";
import MenuMobile from "../../../components/menu-mobile";
import ModalLateral from "../../../components/modal-lateral";
import { Category, Edit, Work } from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { motion } from "framer-motion";
import TableLoading from "../../../components/loading/loading-table/loading";
import TableComponent from "../../../components/table";
import { categoriaCadastrados } from "../../../entities/header/cadastro/categoria";
import CustomToast from "../../../components/toast";
import { criarCategoria } from "../../../service/post/categoria";
import { buscarCategoria } from "../../../service/get/categoria";
import { atualizarCategoria } from "../../../service/put/categoria";
import { deletarCategoria } from "../../../service/delete/categoria";
import { reativarCategoria } from "../../../service/put/reativa-categoria";

const Categoria = () => {
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [nome, setNome] = useState("");
  const [categoriasCadastradas, setCategoriasCadastradas] = useState([]);
  const [pesquisar, setPesquisar] = useState("");

  const filteredCategories = categoriasCadastradas.filter((categoria) =>
    categoria.nome.toLowerCase().includes(pesquisar.toLowerCase()),
  );
  const FecharCadastroUsuario = () => {
    setCadastroUsuario(false);
    setNome("");
  };

  const handleCloseEdicao = () => {
    setEditando(false);
    setCategoriaEditando(null);
    setNome("");
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const EditarOpcao = (categoria) => {
    setCategoriaEditando(categoria);
    setNome(categoria.nome);
    setEditando(true);
  };

  const CadastrarCategoria = async () => {
    if (!nome) {
      CustomToast({ type: "error", message: "Preencha o nome da categoria" });
      return;
    }

    setLoading(true);
    try {
      const response = await criarCategoria(nome);

      CustomToast({
        type: "success",
        message: "Categoria cadastrada com sucesso!",
      });
      FecharCadastroUsuario();
      buscarCategoriaCadastradas();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const SalvarEdicao = async () => {
    if (!nome) {
      CustomToast({ type: "error", message: "Preencha o nome da categoria" });
      return;
    }

    setLoading(true);
    try {
      await atualizarCategoria(categoriaEditando.id, nome);

      CustomToast({
        type: "success",
        message: "Categoria atualizada com sucesso!",
      });

      await buscarCategoriaCadastradas();
      handleCloseEdicao();
      buscarCategoria();
    } catch (error) {
      CustomToast({
        type: "error",
        message: error.response?.data?.message || "Erro ao atualizar categoria",
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarCategoriaCadastradas = async () => {
    try {
      setLoading(true);
      const response = await buscarCategoria();
      setCategoriasCadastradas(response.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar categorias",
      });
    } finally {
      setLoading(false);
    }
  };

  const ReativarCategoria = async (categoria) => {
    try {
      await reativarCategoria(categoria.id);
      CustomToast({
        type: "success",
        message: "Categoria reativada com sucesso!",
      });
      buscarCategoriaCadastradas();
    } catch (error) {
      CustomToast({
        type: "error",
        message: error.response?.data?.message || "Erro ao reativar categoria",
      });
    }
  };

  const InativarCategoria = async (categoria) => {
    try {
      await deletarCategoria(categoria.id);

      buscarCategoriaCadastradas();
    } catch (error) {
      CustomToast({
        type: "error",
        message: error.response?.data?.message || "Erro ao inativar categoria",
      });
    }
  };

  const validarCamposCadastro = () => {
    return nome.trim() !== "";
  };

  const validarCamposEdicao = () => {
    return nome.trim() !== "";
  };

  useEffect(() => {
    buscarCategoriaCadastradas();
  }, []);
  return (
    <div className="flex w-full flex-">
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
          <HeaderPerfil pageTitle="Categoria" />

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
                  label="Pesquisar"
                  autoComplete="off"
                  value={pesquisar}
                  onChange={(e) => setPesquisar(e.target.value)}
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

              <div className="w-full items-center justify-center">
                {loading ? (
                  <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
                    <TableLoading />
                    <label className="text-xs text-primary">
                      Carregando Informações !
                    </label>
                  </div>
                ) : filteredCategories.length > 0 ? (
                  <TableComponent
                    headers={categoriaCadastrados}
                    rows={filteredCategories}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      edit: EditarOpcao,
                      inactivate: (categoria) => {
                        if (categoria.ativo) {
                          InativarCategoria(categoria);
                        } else {
                          ReativarCategoria(categoria);
                        }
                      },
                    }}
                  />
                ) : (
                  <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                    <TableLoading />
                    <label className="text-sm">
                      {pesquisar
                        ? "Nenhuma categoria encontrada para sua pesquisa!"
                        : "Nenhuma categoria encontrada!"}
                    </label>
                  </div>
                )}
              </div>

              <CentralModal
                tamanhoTitulo={"81%"}
                maxHeight={"90vh"}
                top={"20%"}
                left={"28%"}
                width={"400px"}
                icon={<AddCircleOutlineIcon fontSize="small" />}
                open={cadastroUsuario}
                onClose={FecharCadastroUsuario}
                title="Cadastrar Categoria"
              >
                <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
                  <div className="mt-4 flex gap-3 flex-wrap">
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Nome "
                      name="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "95%" },
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

                  <div className="flex w-[96%] items-end justify-end mt-2 ">
                    <ButtonComponent
                      startIcon={<AddCircleOutlineIcon fontSize="small" />}
                      title={"Cadastrar"}
                      subtitle={"Cadastrar"}
                      onClick={CadastrarCategoria}
                      buttonSize="large"
                      disabled={!validarCamposCadastro() || loading}
                    />
                  </div>
                </div>
              </CentralModal>

              <ModalLateral
                open={editando}
                handleClose={handleCloseEdicao}
                tituloModal="Editar Categoria"
                icon={<Edit />}
                tamanhoTitulo="75%"
                conteudo={
                  <div className="w-full">
                    <div className="mt-4 flex gap-3 flex-wrap">
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Nome"
                        name="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
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
                              <Work />
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
                        onClick={SalvarEdicao}
                        disabled={!validarCamposEdicao() || loading}
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

export default Categoria;
