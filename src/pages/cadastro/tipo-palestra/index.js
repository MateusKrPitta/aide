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
import CustomToast from "../../../components/toast";
import { criarTipoPalestra } from "../../../service/post/tipo-palestra";
import { listarTiposPalestra } from "../../../service/get/tipo-palestra";
import { tipopalestrasCadastrados } from "../../../entities/header/cadastro/tipo-palestra";
import { atualizarTipoPalestra } from "../../../service/put/tipo-palestra";
import { inativarTipoPalestra } from "../../../service/post/inativar-tipo-palestra";
import { reativarTipoPalestra } from "../../../service/post/reativar-tipo-palestar";

const TipoPalestra = () => {
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tipoEditando, setTipoEditando] = useState(null);
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [nome, setNome] = useState("");
  const [tiposPalestra, setTiposPalestra] = useState([]);
  const [pesquisar, setPesquisar] = useState("");
  const dadosParaTabela = tiposPalestra
    .filter((tipo) => tipo.nome.toLowerCase().includes(pesquisar.toLowerCase()))
    .map((tipo) => ({
      id: tipo.id,
      nome: tipo.nome,
      ativo: tipo.ativo,
      status: tipo.ativo ? "Ativo" : "Inativo",
    }));

  const filteredTiposPalestra = tiposPalestra
    .filter((tipo) => tipo.nome.toLowerCase().includes(pesquisar.toLowerCase()))
    .map((tipo) => ({
      id: tipo.id,
      nome: tipo.nome,
      ativo: tipo.ativo,
      status: tipo.ativo ? "Ativo" : "Inativo",
    }));

  const FecharCadastroUsuario = () => {
    setCadastroUsuario(false);
    setNome("");
  };

  const handleCloseEdicao = () => {
    setEditando(false);
    setNome("");
  };

  const validarCamposCadastro = () => {
    return nome.trim() !== "";
  };

  const validarCamposEdicao = () => {
    return nome.trim() !== "";
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const EditarOpcao = (tipo) => {
    setTipoEditando(tipo);
    setNome(tipo.nome);
    setEditando(true);
  };

  const CadastrarTipoPalestra = async () => {
    if (!nome) {
      CustomToast({ type: "error", message: "O nome é obrigatório" });
      return;
    }

    setLoading(true);
    try {
      const response = await criarTipoPalestra(nome);

      CustomToast({
        type: "success",
        message: "Tipo de palestra cadastrado com sucesso!",
      });
      FecharCadastroUsuario();
      buscarTipoPalestraCadastradas();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const SalvarEdicao = async () => {
    if (!nome) {
      CustomToast({ type: "error", message: "O nome é obrigatório" });
      return;
    }

    setLoading(true);
    try {
      await atualizarTipoPalestra(tipoEditando.id, nome);

      CustomToast({
        type: "success",
        message: "Tipo de palestra atualizado com sucesso!",
      });

      setTiposPalestra((prev) =>
        prev.map((item) =>
          item.id === tipoEditando.id ? { ...item, nome } : item
        )
      );

      handleCloseEdicao();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const buscarTipoPalestraCadastradas = async () => {
    try {
      setLoading(true);
      const response = await listarTiposPalestra();
      setTiposPalestra(response.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar tipos de palestra",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInativarReativar = async (row) => {
    setLoading(true);
    try {
      const tipoCompleto = tiposPalestra.find((t) => t.id === row.id);

      if (!tipoCompleto) {
        throw new Error("Tipo de palestra não encontrado");
      }

      if (tipoCompleto.ativo) {
        await inativarTipoPalestra(tipoCompleto.id);
        CustomToast({
          type: "success",
          message: "Tipo de palestra inativado com sucesso!",
        });
      } else {
        await reativarTipoPalestra(tipoCompleto.id);
        CustomToast({
          type: "success",
          message: "Tipo de palestra reativado com sucesso!",
        });
      }

      setTiposPalestra((prev) =>
        prev.map((item) =>
          item.id === tipoCompleto.id ? { ...item, ativo: !item.ativo } : item
        )
      );
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarTipoPalestraCadastradas();
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
          <HeaderPerfil pageTitle="Tipo de Palestra" />

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
                  label="Pesquisar o Tipo Palestra"
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
                ) : tiposPalestra.length > 0 ? (
                  <TableComponent
                    headers={tipopalestrasCadastrados}
                    rows={filteredTiposPalestra}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      edit: EditarOpcao,
                      inactivate: handleInativarReativar,
                    }}
                  />
                ) : (
                  <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                    <TableLoading />
                    <label className="text-sm">
                      {pesquisar
                        ? "Nenhum tipo de palestra encontrado para sua pesquisa!"
                        : "Nenhum tipo de palestra encontrado!"}
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
                title="Cadastrar Tipo de Palestra"
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
                      onClick={CadastrarTipoPalestra}
                      buttonSize="large"
                      disabled={!validarCamposCadastro() || loading}
                    />
                  </div>
                </div>
              </CentralModal>

              <ModalLateral
                open={editando}
                handleClose={handleCloseEdicao}
                tituloModal="Editar Tipo Palestra"
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

export default TipoPalestra;
