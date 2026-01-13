import React, { useEffect, useState } from "react";
import Navbar from "../../../components/navbars/header";
import HeaderPerfil from "../../../components/navbars/perfil";
import ButtonComponent from "../../../components/button";
import HeaderCadastro from "../../../components/navbars/cadastro";
import CentralModal from "../../../components/modal-central";
import MenuMobile from "../../../components/menu-mobile";
import ModalLateral from "../../../components/modal-lateral";
import {
  Article,
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
import { motion } from "framer-motion";
import TableLoading from "../../../components/loading/loading-table/loading";
import TableComponent from "../../../components/table";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { criarCliente } from "../../../service/post/clientes";
import CustomToast from "../../../components/toast";
import { buscarClientes } from "../../../service/get/clientes";
import { clientesCadastrados } from "../../../entities/header/cadastro/clientes";
import { cadastrosClientes } from "../../../entities/class/clientes";
import { atualizarClientes } from "../../../service/put/clientes";
import { reativarCliente } from "../../../service/post/reativa-cliente";
import { inativarCliente } from "../../../service/post/inativa-cliente";

const Clientes = () => {
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [pesquisar, setPesquisar] = useState("");
  const [responsavel, setResponsavel] = useState("");

  const formatDocument = (value) => {
    const cleaned = value.replace(/\D/g, "");

    if (cleaned.length > 11) {
      if (cleaned.length <= 2) return cleaned;
      if (cleaned.length <= 5)
        return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
      if (cleaned.length <= 8)
        return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(
          5
        )}`;
      if (cleaned.length <= 12)
        return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(
          5,
          8
        )}/${cleaned.slice(8)}`;
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(
        5,
        8
      )}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
    } else {
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6)
        return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
      if (cleaned.length <= 9)
        return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(
          6
        )}`;
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(
        6,
        9
      )}-${cleaned.slice(9, 11)}`;
    }
  };

  const DOCUMENT_MAX_LENGTH = 18;

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, "");

    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 6)
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 10)
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(
        6
      )}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
      7,
      11
    )}`;
  };

  const formatCEP = (value) => {
    const cleaned = value.replace(/\D/g, "");

    if (cleaned.length <= 5) {
      return cleaned;
    } else if (cleaned.length <= 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    } else {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
    }
  };

  const filteredClients = clientes.filter((cliente) => {
    const searchTerm = pesquisar.toLowerCase();

    return (
      cliente.nome.toLowerCase().includes(searchTerm) ||
      (cliente.responsavel &&
        cliente.responsavel.toLowerCase().includes(searchTerm))
    );
  });

  const validarCamposCadastro = () => {
    return (
      nome.trim() !== "" &&
      cpf.trim() !== "" &&
      cidade.trim() !== "" &&
      endereco.trim() !== "" &&
      numero.trim() !== "" &&
      estado !== null
    );
  };

  const CadastrarCliente = async () => {
    try {
      setLoading(true);
      await criarCliente(
        nome,
        telefone,
        cpf,
        email,
        estado,
        cidade,
        endereco,
        numero,
        complemento,
        responsavel,
        cep
      );
      setCep("");
      setNome("");
      setTelefone("");
      setCpf("");
      setEmail("");
      setEstado("");
      setCidade("");
      setEndereco("");
      setNumero("");
      setComplemento("");
      setResponsavel("");

      setCadastroUsuario(false);
      await carregarClientes();

      CustomToast({
        type: "success",
        message: "Cliente cadastrado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const response = await buscarClientes();
      setClientes(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const salvarEdicao = async () => {
    try {
      setLoading(true);

      await atualizarClientes(
        clienteEditando.id,
        clienteEditando.nome,
        clienteEditando.telefone,
        clienteEditando.email,
        clienteEditando.estado,
        clienteEditando.cidade,
        clienteEditando.endereco,
        clienteEditando.cpf_cnpj,
        clienteEditando.complemento,
        clienteEditando.responsavel,
        clienteEditando.cep
      );

      await carregarClientes();

      CustomToast({
        type: "success",
        message: "Cliente atualizado com sucesso!",
      });

      handleCloseEdicao();
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      CustomToast({
        type: "error",
        message: error.response?.data?.message || "Erro ao atualizar cliente",
      });
    } finally {
      setLoading(false);
    }
  };

  const FecharCadastroUsuario = () => {
    setNome("");
    setEmail("");
    setCidade("");
    setCpf("");
    setTelefone("");
    setEndereco("");
    setEstado("");
    setCep("");
    setNumero("");
    setComplemento("");
    setCadastroUsuario(false);
  };

  const handleCloseEdicao = () => {
    setEditando(false);
    setNome("");
    setEmail("");
    setCidade("");
    setCpf("");
    setTelefone("");
    setCep("");
    setEndereco("");
    setEstado("");
    setNumero("");
    setComplemento("");
    setClienteEditando(null);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const EditarOpcao = (cliente) => {
    setClienteEditando(cliente);
    setEditando(true);
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const AlternarAtivacaoCliente = async (cliente) => {
    setLoading(true);
    try {
      if (cliente.ativo) {
        await inativarCliente(cliente.id);
      } else {
        await reativarCliente(cliente.id);
      }

      CustomToast({
        type: "success",
        message: `Cliente ${
          cliente.ativo ? "inativado" : "reativado"
        } com sucesso!`,
      });
      await carregarClientes();
    } catch (error) {
      CustomToast({
        type: "error",
        message: error.response?.data?.message,
      });
    } finally {
      setLoading(false);
    }
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
                ) : filteredClients && filteredClients.length > 0 ? (
                  <TableComponent
                    headers={clientesCadastrados}
                    rows={cadastrosClientes(filteredClients)}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      edit: (row) =>
                        EditarOpcao(
                          filteredClients.find((c) => c.id === row.id)
                        ),
                      inactivate: AlternarAtivacaoCliente,
                    }}
                  />
                ) : (
                  <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                    <TableLoading />
                    <label className="text-sm">
                      {pesquisar
                        ? "Nenhum cliente encontrado para sua pesquisa!"
                        : "Nenhum cliente cadastrado!"}
                    </label>
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
                      label="Razão Social"
                      name="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
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
                      label="Nome Fantasia"
                      name="responsavel"
                      value={responsavel}
                      onChange={(e) => setResponsavel(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "44%",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Work /> {/* Ou use outro ícone apropriado */}
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Telefone"
                      value={telefone}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        setTelefone(formatted);
                      }}
                      sx={{ width: "47%" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        maxLength: 16,
                      }}
                    />

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="CPF/CNPJ"
                      value={cpf}
                      onChange={(e) => {
                        const formatted = formatDocument(e.target.value);
                        setCpf(formatted);
                      }}
                      sx={{ width: "44%" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Article />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        maxLength: DOCUMENT_MAX_LENGTH,
                      }}
                    />

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "48%",
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
                      label="CEP"
                      value={cep}
                      onChange={(e) => {
                        const formatted = formatCEP(e.target.value);
                        setCep(formatted);
                      }}
                      autoComplete="off"
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "20%",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        maxLength: 9, // Para "12345-678"
                      }}
                    />

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Estado (Sigla)"
                      value={estado}
                      onChange={(e) => {
                        const value = e.target.value
                          .toUpperCase()
                          .substring(0, 2);
                        setEstado(value);
                      }}
                      autoComplete="off"
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "20%",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        maxLength: 2,
                      }}
                    />
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Cidade"
                      name="cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
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
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "39%",
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
                      type="number"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
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
                    {/* Adicione este campo após o campo Email no modal de edição */}

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Complemento"
                      name="complemento"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Article />
                          </InputAdornment>
                        ),
                      }}
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "50%",
                        },
                      }}
                    />
                  </div>

                  <div className="flex w-[96%] items-end justify-end mt-2 ">
                    <ButtonComponent
                      startIcon={<AddCircleOutlineIcon fontSize="small" />}
                      title={"Cadastrar"}
                      subtitle={"Cadastrar"}
                      onClick={CadastrarCliente}
                      buttonSize="large"
                      disabled={!validarCamposCadastro() || loading}
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
                        label="Razão Social"
                        name="nome"
                        value={clienteEditando?.nome || ""}
                        onChange={(e) =>
                          setClienteEditando({
                            ...clienteEditando,
                            nome: e.target.value,
                          })
                        }
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
                        label="Nome Fantasia"
                        name="responsavel"
                        value={clienteEditando?.responsavel || ""}
                        onChange={(e) =>
                          setClienteEditando({
                            ...clienteEditando,
                            responsavel: e.target.value,
                          })
                        }
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

                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Telefone"
                        value={clienteEditando?.telefone || ""}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          setClienteEditando({
                            ...clienteEditando,
                            telefone: formatted,
                          });
                        }}
                        sx={{ width: "48%" }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{
                          maxLength: 16,
                        }}
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="CPF/CNPJ"
                        value={clienteEditando?.cpf_cnpj || ""}
                        onChange={(e) => {
                          const formatted = formatDocument(e.target.value);
                          setClienteEditando({
                            ...clienteEditando,
                            cpf_cnpj: formatted,
                          });
                        }}
                        sx={{ width: "47%" }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Article />
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{
                          maxLength: DOCUMENT_MAX_LENGTH,
                        }}
                        autoComplete="off"
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Email"
                        name="email"
                        value={clienteEditando?.email || ""}
                        onChange={(e) =>
                          setClienteEditando({
                            ...clienteEditando,
                            email: e.target.value,
                          })
                        }
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
                        label="Estado (Sigla)"
                        value={clienteEditando?.estado || ""}
                        onChange={(e) => {
                          const value = e.target.value
                            .toUpperCase()
                            .substring(0, 2);
                          setClienteEditando({
                            ...clienteEditando,
                            estado: value,
                          });
                        }}
                        autoComplete="off"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "50%",
                            md: "40%",
                            lg: "35%",
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon />
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{
                          maxLength: 2,
                        }}
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Cidade"
                        name="cidade"
                        value={clienteEditando?.cidade || ""}
                        onChange={(e) =>
                          setClienteEditando({
                            ...clienteEditando,
                            cidade: e.target.value,
                          })
                        }
                        autoComplete="off"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "50%",
                            md: "40%",
                            lg: "60%",
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
                        value={clienteEditando?.endereco || ""}
                        onChange={(e) =>
                          setClienteEditando({
                            ...clienteEditando,
                            endereco: e.target.value,
                          })
                        }
                        autoComplete="off"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "50%",
                            md: "40%",
                            lg: "67%",
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
                        type="number"
                        label="Número"
                        name="numero"
                        value={clienteEditando?.numero || ""}
                        onChange={(e) =>
                          setClienteEditando({
                            ...clienteEditando,
                            numero: e.target.value,
                          })
                        }
                        autoComplete="off"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "50%",
                            md: "40%",
                            lg: "28%",
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
                        label="CEP"
                        value={clienteEditando?.cep || ""}
                        onChange={(e) => {
                          const formatted = formatCEP(e.target.value);
                          setClienteEditando({
                            ...clienteEditando,
                            cep: formatted,
                          });
                        }}
                        autoComplete="off"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "50%",
                            md: "40%",
                            lg: "100%", // Ajuste conforme necessário
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon />
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{
                          maxLength: 9,
                        }}
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Complemento"
                        name="complemento"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Article />
                            </InputAdornment>
                          ),
                        }}
                        value={clienteEditando?.complemento || ""}
                        onChange={(e) =>
                          setClienteEditando({
                            ...clienteEditando,
                            complemento: e.target.value,
                          })
                        }
                        autoComplete="off"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "50%",
                            md: "40%",
                            lg: "100%",
                          },
                        }}
                      />
                    </div>

                    <div className="flex w-[100%] items-end justify-end mt-2 ">
                      <ButtonComponent
                        startIcon={<AddCircleOutlineIcon fontSize="small" />}
                        title={"Salvar"}
                        subtitle={"Salvar"}
                        buttonSize="large"
                        onClick={salvarEdicao}
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
