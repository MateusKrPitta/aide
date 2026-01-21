import React, { useEffect, useState } from "react";
import Navbar from "../../../components/navbars/header";
import HeaderPerfil from "../../../components/navbars/perfil";
import ButtonComponent from "../../../components/button";
import HeaderCadastro from "../../../components/navbars/cadastro";
import CentralModal from "../../../components/modal-central";
import MenuMobile from "../../../components/menu-mobile";
import ModalLateral from "../../../components/modal-lateral";
import { Category, Edit, Work } from "@mui/icons-material";
import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import NotesIcon from "@mui/icons-material/Notes";
import { motion } from "framer-motion";
import TableLoading from "../../../components/loading/loading-table/loading";
import TableComponent from "../../../components/table";
import { servicoCadastrados } from "../../../entities/header/cadastro/servico";
import { buscarCategoria } from "../../../service/get/categoria";
import CustomToast from "../../../components/toast";
import { criarTipoServico } from "../../../service/post/tipo-servico";
import { buscarServico } from "../../../service/get/servicos";
import { atualizarServico } from "../../../service/put/servico";
import { inativarServico } from "../../../service/delete/inativar-servico";
import { reativarServico } from "../../../service/delete/reativar-servico";

const Servicos = () => {
  const [editando, setEditando] = useState(false);
  const [categoriasCadastradas, setCategoriasCadastradas] = useState([]);
  const [idEditando, setIdEditando] = useState(null);
  const [servicosCadastrados, setServicosCadastrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const categoriasAtivas = categoriasCadastradas.filter(
    (categoria) => categoria.ativo,
  );
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [listaServicos, setListaServicos] = useState([]);
  const [pesquisar, setPesquisar] = useState("");

  const filteredServicos = listaServicos.filter(
    (servico) =>
      servico.nome.toLowerCase().includes(pesquisar.toLowerCase()) ||
      servico.categoria.toLowerCase().includes(pesquisar.toLowerCase()),
  );

  const validarCamposCadastro = () => {
    return nome.trim() !== "" && categoriaSelecionada !== "";
  };

  const validarCamposEdicao = () => {
    return nome.trim() !== "" && categoriaSelecionada !== "";
  };

  const FecharCadastroUsuario = () => {
    setCadastroUsuario(false);
    setNome("");
    setDescricao("");
    setCategoriaSelecionada("");
  };

  const handleCloseEdicao = () => {
    setNome("");
    setDescricao("");
    setCategoriaSelecionada("");
    setEditando(false);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const CadastrarServico = async () => {
    if (!nome) {
      CustomToast({ type: "error", message: "O nome é obrigatório" });
      return;
    }

    if (!categoriaSelecionada) {
      CustomToast({ type: "error", message: "A categoria é obrigatória" });
      return;
    }

    setLoading(true);
    try {
      const response = await criarTipoServico(
        nome,
        descricao,
        categoriaSelecionada,
      );

      CustomToast({
        type: "success",
        message: "Serviço cadastrado com sucesso!",
      });

      setListaServicos((prev) => [
        ...prev,
        {
          id: response.id,
          nome,
          descricao,
          categoria: categoriasAtivas.find((c) => c.id === categoriaSelecionada)
            ?.nome,
        },
      ]);

      FecharCadastroUsuario();
    } catch (error) {
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

  const buscarServicoCadastradas = async () => {
    try {
      setLoading(true);
      const response = await buscarServico();
      setServicosCadastrados(response.data || []);

      const servicosFormatados = response.data.map((servico) => ({
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
        categoria: servico.categoria?.nome || "Sem categoria",
        ativo: servico.ativo,
        statusLabel: servico.ativo ? "Ativo" : "Inativo",
      }));

      setListaServicos(servicosFormatados);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar serviços",
      });
    } finally {
      setLoading(false);
    }
  };

  const AtualizarServico = async () => {
    if (!nome) {
      CustomToast({ type: "error", message: "O nome é obrigatório" });
      return;
    }

    if (!categoriaSelecionada) {
      CustomToast({ type: "error", message: "A categoria é obrigatória" });
      return;
    }

    setLoading(true);
    try {
      await atualizarServico(idEditando, nome, categoriaSelecionada, descricao);

      CustomToast({
        type: "success",
        message: "Serviço atualizado com sucesso!",
      });

      await buscarServicoCadastradas();
      handleCloseEdicao();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const EditarOpcao = (servico) => {
    setEditando(true);
    setIdEditando(servico.id);
    setNome(servico.nome);
    setDescricao(servico.descricao);
    setCategoriaSelecionada(
      categoriasCadastradas.find((c) => c.nome === servico.categoria)?.id || "",
    );
  };

  const AlternarAtivacaoServico = async (servico) => {
    setLoading(true);
    try {
      if (servico.ativo) {
        await inativarServico(servico.id);
        CustomToast({
          type: "success",
          message: "Serviço inativado com sucesso!",
        });
      } else {
        await reativarServico(servico.id);
        CustomToast({
          type: "success",
          message: "Serviço reativado com sucesso!",
        });
      }
      await buscarServicoCadastradas();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarServicoCadastradas();
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
          <HeaderPerfil pageTitle="Serviços" />

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
                  label="Buscar Serviço"
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
              <div className="w-full">
                {loading ? (
                  <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
                    <TableLoading />
                    <label className="text-xs text-primary">
                      Carregando Informações !
                    </label>
                  </div>
                ) : filteredServicos.length > 0 ? (
                  <TableComponent
                    headers={servicoCadastrados}
                    rows={filteredServicos}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      edit: (row) => EditarOpcao(row),
                      inactivate: (row) => AlternarAtivacaoServico(row),
                    }}
                  />
                ) : (
                  <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                    <TableLoading />
                    <label className="text-sm">
                      {pesquisar
                        ? "Nenhum serviço encontrado para sua pesquisa!"
                        : "Nenhum serviço cadastrado!"}
                    </label>
                  </div>
                )}
              </div>

              <CentralModal
                tamanhoTitulo={"81%"}
                maxHeight={"90vh"}
                top={"20%"}
                left={"28%"}
                width={"450px"}
                icon={<AddCircleOutlineIcon fontSize="small" />}
                open={cadastroUsuario}
                onClose={FecharCadastroUsuario}
                title="Cadastrar Serviço"
              >
                <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
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
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "50%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Work />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <FormControl
                      fullWidth
                      size="small"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "40%" },
                      }}
                    >
                      <InputLabel>Categoria</InputLabel>
                      <Select
                        value={categoriaSelecionada}
                        onChange={(e) =>
                          setCategoriaSelecionada(e.target.value)
                        }
                        label="Categoria"
                        startAdornment={
                          <InputAdornment position="start">
                            <Category />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="">
                          <em>Selecione uma categoria</em>
                        </MenuItem>
                        {categoriasAtivas.map((categoria) => (
                          <MenuItem key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Descrição"
                      name="descricao"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      autoComplete="off"
                      multiline
                      rows={4}
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "95%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <NotesIcon />
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
                      onClick={CadastrarServico}
                      disabled={!validarCamposCadastro() || loading}
                      buttonSize="large"
                    />
                  </div>
                </div>
              </CentralModal>

              <ModalLateral
                open={editando}
                handleClose={handleCloseEdicao}
                tituloModal="Editar Serviço"
                icon={<Edit />}
                tamanhoTitulo="75%"
                conteudo={
                  <div className="">
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
                      <FormControl
                        fullWidth
                        size="small"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "50%",
                            md: "40%",
                            lg: "100%",
                          },
                          mt: 1,
                        }}
                      >
                        <InputLabel>Categoria</InputLabel>
                        <Select
                          value={categoriaSelecionada}
                          onChange={(e) =>
                            setCategoriaSelecionada(e.target.value)
                          }
                          label="Categoria"
                          startAdornment={
                            <InputAdornment position="start">
                              <Category />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="">
                            <em>Selecione uma categoria</em>
                          </MenuItem>
                          {categoriasAtivas.map((categoria) => (
                            <MenuItem key={categoria.id} value={categoria.id}>
                              {categoria.nome}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Descrição"
                        name="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        autoComplete="off"
                        multiline
                        rows={4}
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
                              <NotesIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>

                    <div className="flex w-[100%] items-end justify-end mt-2 ">
                      <ButtonComponent
                        startIcon={<AddCircleOutlineIcon fontSize="small" />}
                        title={"Salvar"}
                        disabled={!validarCamposEdicao() || loading}
                        subtitle={"Salvar"}
                        buttonSize="large"
                        onClick={AtualizarServico}
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

export default Servicos;
