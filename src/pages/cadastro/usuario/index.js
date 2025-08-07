import React, { useState, useEffect } from "react";
import Navbar from "../../../components/navbars/header";
import HeaderPerfil from "../../../components/navbars/perfil";
import ButtonComponent from "../../../components/button";
import HeaderCadastro from "../../../components/navbars/cadastro";
import CentralModal from "../../../components/modal-central";
import Checkbox from "@mui/material/Checkbox";
import MenuMobile from "../../../components/menu-mobile";
import ModalLateral from "../../../components/modal-lateral";
import { Edit } from "@mui/icons-material";
import {
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import NotesIcon from "@mui/icons-material/Notes";
import { Password } from "@mui/icons-material";
import { motion } from "framer-motion";
import TableLoading from "../../../components/loading/loading-table/loading";
import TableComponent from "../../../components/table";
import { usuarioCadastrados } from "../../../entities/header/usuario";
import { criarUsuarios } from "../../../service/post/usuario";
import CustomToast from "../../../components/toast";
import { cadastrosUsuarios } from "../../../entities/class/usuario";
import { buscarUsuarios } from "../../../service/get/usuario";
import { inativarUsuario } from "../../../service/put/inativar-usuario";
import { reativarUsuario } from "../../../service/put/reativar-usuario";
import { atualizarUsuario } from "../../../service/put/usuario";

const Usuario = () => {
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [usuariosCadastrados, setUsuariosCadastrados] = useState([]);
  const [permissao, setPermissao] = useState(null);
  const [username, setUsername] = useState("");
  const [telefone, setTelefone] = useState("");
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [pesquisar, setPesquisar] = useState("");

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const FecharCadastroUsuario = () => {
    setCadastroUsuario(false);
    setUsuarioEditando(null);
    setNomeCompleto("");
    setEmail("");
    setSenha("");
    setUsername("");
    setTelefone("");
    setPermissao(null);
  };

  const usuariosFiltrados = usuariosCadastrados.filter((usuario) => {
    const termo = pesquisar.toLowerCase();
    return (
      usuario.nome?.toLowerCase().includes(termo) ||
      usuario.username?.toLowerCase().includes(termo) ||
      usuario.email?.toLowerCase().includes(termo)
    );
  });

  const EditarOpcao = (usuario) => {
    setUsuarioEditando(usuario);
    setNomeCompleto(usuario.nome);
    setEmail(usuario.email);
    setUsername(usuario.username || "");
    setTelefone(usuario.telefone || "");
    setPermissao(usuario.permissao || null);
    setEditando(true);
  };

  const handleCloseEdicao = () => {
    setEditando(false);
    setUsuarioEditando(null);
    setNomeCompleto("");
    setEmail("");
    setSenha("");
    setUsername("");
    setTelefone("");
    setPermissao(null);
  };

  const validarCamposCadastro = () => {
    return (
      nomeCompleto.trim() !== "" &&
      email.trim() !== "" &&
      senha.trim() !== "" &&
      username.trim() !== "" &&
      permissao !== null
    );
  };

  const validarCamposEdicao = () => {
    return (
      nomeCompleto.trim() !== "" &&
      email.trim() !== "" &&
      username.trim() !== "" &&
      permissao !== null
    );
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const CadastrarUsuario = async () => {
    setLoading(true);

    try {
      await criarUsuarios(
        nomeCompleto,
        username,
        email,
        senha,
        telefone.replace(/\D/g, ""),
        permissao
      );

      CustomToast({
        type: "success",
        message: "Usuário cadastrado com sucesso!",
      });

      setNomeCompleto("");
      setEmail("");
      setSenha("");
      setUsername("");
      setTelefone("");
      setPermissao(null);

      buscarUsuariosCadastradas();
      setCadastroUsuario(false);
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
    } finally {
      setLoading(false);
    }
  };
  const EditarUsuario = async () => {
    setLoading(true);
    try {
      await atualizarUsuario(
        usuarioEditando.id,
        nomeCompleto,
        username,
        email,
        telefone.replace(/\D/g, ""),
        permissao
      );

      await buscarUsuariosCadastradas();
      handleCloseEdicao();
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarUsuariosCadastradas = async () => {
    try {
      setLoading(true);
      const response = await buscarUsuarios();
      setUsuariosCadastrados(response.data.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const AlternarAtivacaoUsuario = async (usuario) => {
    setLoading(true);
    try {
      if (usuario.ativo) {
        await inativarUsuario(usuario.id);
      } else {
        await reativarUsuario(usuario.id);
      }

      CustomToast({
        type: "success",
        message: `Usuario ${
          usuario.ativo ? "inativado" : "reativado"
        } com sucesso!`,
      });
      await buscarUsuariosCadastradas();
    } catch (error) {
      CustomToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Erro ao alterar status do prestador",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarUsuariosCadastradas();
  }, []);
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
          <HeaderPerfil pageTitle="Usuário" />

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
              <div className="w-full flex">
                {loading ? (
                  <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
                    <TableLoading />
                    <label className="text-xs text-primary">
                      Carregando Informações !
                    </label>
                  </div>
                ) : usuariosCadastrados.length > 0 ? (
                  <TableComponent
                    headers={usuarioCadastrados}
                    rows={cadastrosUsuarios(usuariosFiltrados)}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      edit: (usuario) => EditarOpcao(usuario),
                      inactivate: AlternarAtivacaoUsuario,
                    }}
                  />
                ) : (
                  <div className="text-center flex items-center w-full mt-28 justify-center gap-5 flex-col text-primary">
                    <TableLoading />
                    <label className="text-sm">
                      {pesquisar
                        ? "Nenhum usuário encontrado para sua pesquisa!"
                        : "Nenhum usuário encontrado!"}
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
                title="Cadastrar Usuário"
              >
                <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
                  <div className="mt-4 flex gap-3 flex-wrap">
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Nome Completo"
                      name="nome"
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "100%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Email"
                      name="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: { xs: "48%", sm: "43%", md: "45%", lg: "100%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <NotesIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="password"
                      label="Senha"
                      name="senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: { xs: "48%", sm: "40%", md: "40%", lg: "47%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Password />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Username"
                      name="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: { xs: "47%", sm: "50%", md: "40%", lg: "47%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="w-full flex items-center mt-4 ml-2 font-bold mb-1">
                    <label className="w-[70%] text-xs">Permissão</label>
                  </div>
                  <div className="flex flex-col gap-1 w-[95%]  border-[1px] p-3 rounded-lg">
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={permissao === 1}
                          onChange={() => setPermissao(1)}
                        />
                      }
                      label="Administrador"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={permissao === 2}
                          onChange={() => setPermissao(2)}
                        />
                      }
                      label="Cliente"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={permissao === 3}
                          onChange={() => setPermissao(3)}
                        />
                      }
                      label="Funcionário"
                    />
                  </div>
                  <div className="flex w-[96%] items-end justify-end mt-2 ">
                    <ButtonComponent
                      startIcon={<AddCircleOutlineIcon fontSize="small" />}
                      title={"Cadastrar"}
                      subtitle={"Cadastrar"}
                      onClick={CadastrarUsuario}
                      buttonSize="large"
                      disabled={!validarCamposCadastro() || loading}
                    />
                  </div>
                </div>
              </CentralModal>

              <ModalLateral
                open={editando}
                handleClose={handleCloseEdicao}
                tituloModal="Editar Usuário"
                icon={<Edit />}
                tamanhoTitulo="75%"
                conteudo={
                  <div className="">
                    <div className="mt-4 flex gap-3 flex-wrap">
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Username"
                        name="nome"
                        value={nomeCompleto}
                        onChange={(e) => setNomeCompleto(e.target.value)}
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
                              <PersonIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Email"
                        name="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="off"
                        sx={{
                          width: { xs: "48%", sm: "43%", md: "45%", lg: "47%" },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <NotesIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="password"
                        label="Senha"
                        name="senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        autoComplete="off"
                        sx={{
                          width: { xs: "48%", sm: "40%", md: "40%", lg: "47%" },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Password />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>

                    <div className="w-full flex items-center mt-4 ml-2 font-bold mb-1">
                      <label className="w-[70%] text-xs">Permissão</label>
                    </div>
                    <div className="flex flex-col gap-1 w-[95%] border-[1px] p-3 rounded-lg">
                      <RadioGroup
                        value={permissao}
                        onChange={(e) => setPermissao(Number(e.target.value))}
                      >
                        <FormControlLabel
                          value={1}
                          control={<Radio size="small" />}
                          label="Administrador"
                        />
                        <FormControlLabel
                          value={2}
                          control={<Radio size="small" />}
                          label="Cliente"
                        />
                        <FormControlLabel
                          value={3}
                          control={<Radio size="small" />}
                          label="Funcionário"
                        />
                      </RadioGroup>
                    </div>

                    <div className="flex w-[96%] items-end justify-end mt-2 ">
                      <ButtonComponent
                        startIcon={<AddCircleOutlineIcon fontSize="small" />}
                        title={"Salvar"}
                        subtitle={"Salvar"}
                        buttonSize="large"
                        onClick={EditarUsuario}
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

export default Usuario;
