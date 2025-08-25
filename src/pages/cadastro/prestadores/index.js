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
} from "@mui/icons-material";
import { Autocomplete, Chip, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { motion } from "framer-motion";
import TableLoading from "../../../components/loading/loading-table/loading";
import TableComponent from "../../../components/table";
import { prestadoresCadastrados } from "../../../entities/header/cadastro/prestadores";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import { criarPrestador } from "../../../service/post/prestadores";
import CustomToast from "../../../components/toast";
import { buscarServico } from "../../../service/get/servicos";
import { buscarPretadores } from "../../../service/get/prestadores";
import { atualizarPrestadores } from "../../../service/put/prestadores";
import { inativarPrestador } from "../../../service/post/inativar-prestador";
import { reativarPrestador } from "../../../service/post/reativar-prestador";

const Prestadores = () => {
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
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [servicosCadastrados, setServicosCadastrados] = useState([]);
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [todosServicos, setTodosServicos] = useState([]);
  const [listaPrestadores, setListaPrestadores] = useState([]);
  const [prestadorEditando, setPrestadorEditando] = useState(null);
  const [pesquisar, setPesquisar] = useState("");

  const filteredPrestadores = listaPrestadores.filter((prestador) =>
    prestador.nome.toLowerCase().includes(pesquisar.toLowerCase())
  );

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

  const validarCamposCadastro = () => {
    const cleanedCpf = cpf.replace(/\D/g, "");
    const isCpfValid = cleanedCpf.length === 11;
    const isCnpjValid = cleanedCpf.length === 14;

    return (
      nome.trim() !== "" &&
      telefone.replace(/\D/g, "").length >= 10 &&
      (isCpfValid || isCnpjValid) &&
      email.trim() !== "" &&
      validarEmail(email) &&
      estado.trim().length === 2 &&
      cidade.trim() !== "" &&
      endereco.trim() !== "" &&
      numero.trim() !== "" &&
      servicosSelecionados.length > 0
    );
  };

  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const FecharCadastroUsuario = () => {
    setNome("");
    setTelefone("");
    setCpf("");
    setEmail("");
    setEstado("");
    setCidade("");
    setEndereco("");
    setNumero("");
    setComplemento("");
    setServicosSelecionados([]);
    setCadastroUsuario(false);
  };

  const fechaModalEdicao = () => {
    setEditando(false);

    setNome("");
    setTelefone("");
    setCpf("");
    setEmail("");
    setEstado("");
    setCidade("");
    setEndereco("");
    setNumero("");
    setComplemento("");
    setServicosSelecionados([]);
    setPrestadorEditando(null);
  };

  const CadastrarPrestador = async () => {
    try {
      setLoading(true);

      await criarPrestador(
        nome,
        telefone,
        cpf,
        email,
        estado,
        cidade,
        endereco,
        numero,
        complemento,
        servicosSelecionados
      );

      CustomToast({
        type: "success",
        message: "Prestador cadastrado com sucesso!",
      });
      await buscarPrestadoresCadastrados();

      setCadastroUsuario(false);

      setNome("");
      setTelefone("");
      setCpf("");
      setEmail("");
      setEstado("");
      setCidade("");
      setEndereco("");
      setNumero("");
      setComplemento("");
      setServicosSelecionados([]);
      buscarPrestadoresCadastrados();
    } catch (error) {
      console.error("Erro ao cadastrar prestador:", error);
    } finally {
      setLoading(false);
    }
  };

  const validarCamposEdicao = () => {
    const cleanedCpf = cpf.replace(/\D/g, "");
    const isCpfValid = cleanedCpf.length === 11;
    const isCnpjValid = cleanedCpf.length === 14;

    return (
      nome.trim() !== "" &&
      telefone.replace(/\D/g, "").length >= 10 &&
      (isCpfValid || isCnpjValid) &&
      email.trim() !== "" &&
      validarEmail(email) &&
      estado.trim().length === 2 &&
      cidade.trim() !== "" &&
      endereco.trim() !== "" &&
      numero.trim() !== "" &&
      servicosSelecionados.length > 0
    );
  };

  const buscarPrestadoresCadastrados = async () => {
    try {
      setLoading(true);
      const response = await buscarPretadores();

      const prestadoresFormatados = response.data.map((prestador) => ({
        id: prestador.id,
        nome: prestador.nome,
        telefone: prestador.telefone,
        cpf: prestador.cpf,
        email: prestador.email,
        endereco: prestador.endereco,
        numero: prestador.numero,
        cidade: prestador.cidade,
        estado: prestador.estado,
        servicos:
          prestador.servicos?.map((s) => s.nome).join(", ") || "Nenhum serviço",
        ativo: prestador.ativo,
        statusLabel: prestador.ativo ? "Ativo" : "Inativo",
        servicosArray: prestador.servicos || [],
      }));

      setListaPrestadores(prestadoresFormatados);
    } catch (error) {
      CustomToast({
        type: "error",
        message: error.response?.data?.message || "Erro ao buscar prestadores",
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarServicoCadastradas = async () => {
    try {
      setLoading(true);
      const response = await buscarServico();

      const servicosAtivos = response.data.filter((servico) => servico.ativo);

      const servicosParaSelect = servicosAtivos
        .map((servico) => ({
          id: servico.id,
          nome: servico.nome,
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

      setTodosServicos(servicosParaSelect);
      setServicosCadastrados(servicosAtivos || []);
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

  const EditarPrestador = async () => {
    try {
      setLoading(true);

      if (!prestadorEditando) {
        CustomToast({
          type: "error",
          message: "Nenhum prestador selecionado para edição",
        });
        return;
      }

      await atualizarPrestadores(
        prestadorEditando.id,
        nome,
        telefone,
        email,
        estado,
        cidade,
        endereco,
        numero,
        complemento,
        servicosSelecionados,
        cpf
      );

      CustomToast({
        type: "success",
        message: "Prestador atualizado com sucesso!",
      });

      await buscarPrestadoresCadastrados();

      fechaModalEdicao();
    } catch (error) {
      console.error("Erro ao atualizar prestador:", error);
      CustomToast({
        type: "error",
        message: error.response?.data?.message || "Erro ao atualizar prestador",
      });
    } finally {
      setLoading(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  const EditarOpcao = (prestador) => {
    setPrestadorEditando(prestador);
    setEditando(true);

    setNome(prestador.nome);
    setTelefone(prestador.telefone);
    setCpf(prestador.cpf);
    setEmail(prestador.email);
    setEstado(prestador.estado);
    setCidade(prestador.cidade);
    setEndereco(prestador.endereco || "");
    setNumero(prestador.numero || "");
    setComplemento(prestador.complemento || "");

    const servicosIds =
      prestador.servicosArray?.map((servico) => servico.id) || [];
    setServicosSelecionados(servicosIds);
  };

  const AlternarAtivacaoPrestador = async (prestador) => {
    setLoading(true);
    try {
      if (prestador.ativo) {
        await inativarPrestador(prestador.id);
      } else {
        await reativarPrestador(prestador.id);
      }

      CustomToast({
        type: "success",
        message: `Prestador ${
          prestador.ativo ? "inativado" : "reativado"
        } com sucesso!`,
      });
      await buscarPrestadoresCadastrados();
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
    buscarPrestadoresCadastrados();
    buscarServicoCadastradas();
  }, []);

  useEffect(() => {
    if (cadastroUsuario && todosServicos.length === 0) {
      buscarServicoCadastradas();
    }
  }, [cadastroUsuario]);
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
          <HeaderPerfil pageTitle="Prestadores" />

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
                  label="Buscar Prestador"
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
                ) : filteredPrestadores.length > 0 ? (
                  <TableComponent
                    headers={prestadoresCadastrados}
                    rows={filteredPrestadores}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      edit: EditarOpcao,
                      inactivate: AlternarAtivacaoPrestador,
                    }}
                  />
                ) : (
                  <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                    <TableLoading />
                    <label className="text-sm">
                      {pesquisar
                        ? "Nenhum prestador encontrado para sua pesquisa!"
                        : "Nenhum prestador encontrado!"}
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
                title="Cadastrar Prestador"
              >
                <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
                  <div className="flex w-full mt-4 flex-wrap items-center gap-4">
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Nome"
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      label="Estado (Sigla)"
                      value={estado}
                      onChange={(e) => {
                        const value = e.target.value
                          .toUpperCase()
                          .substring(0, 3);
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
                    />
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
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
                      label="Endereço"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "40%",
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
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
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
                            <Numbers />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Complemento"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      autoComplete="off"
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
                            <Article />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Autocomplete
                      multiple
                      style={{ width: "95%" }}
                      id="servicos-select"
                      options={todosServicos}
                      getOptionLabel={(option) => option.nome}
                      value={todosServicos.filter((servico) =>
                        servicosSelecionados.includes(servico.id)
                      )}
                      onChange={(event, newValue) => {
                        setServicosSelecionados(
                          newValue.map((item) => item.id)
                        );
                      }}
                      filterSelectedOptions
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Serviços"
                          placeholder={
                            todosServicos.length === 0
                              ? "Nenhum serviço ativo disponível"
                              : "Digite para buscar serviços..."
                          }
                          disabled={todosServicos.length === 0}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            key={option.id}
                            label={option.nome}
                            {...getTagProps({ index })}
                            deleteIcon={<CloseIcon />}
                          />
                        ))
                      }
                      loading={loading}
                      loadingText="Carregando serviços..."
                      noOptionsText="Nenhum serviço encontrado"
                    />
                  </div>

                  <div className="flex w-[96%] items-end justify-end mt-2 ">
                    <ButtonComponent
                      startIcon={<AddCircleOutlineIcon fontSize="small" />}
                      title={"Cadastrar"}
                      subtitle={"Cadastrar"}
                      onClick={CadastrarPrestador}
                      buttonSize="large"
                      disabled={!validarCamposCadastro() || loading}
                    />
                  </div>
                </div>
              </CentralModal>

              <ModalLateral
                open={editando}
                handleClose={fechaModalEdicao}
                tituloModal="Editar Prestador"
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
                        value={telefone}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          setTelefone(formatted);
                        }}
                        sx={{ width: "43%" }}
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
                        autoComplete="off"
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        value={estado}
                        onChange={(e) => {
                          const value = e.target.value
                            .toUpperCase()
                            .substring(0, 3);
                          setEstado(value);
                        }}
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
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        autoComplete="off"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "50%",
                            md: "40%",
                            lg: "65%",
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
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
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
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
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
                      <Autocomplete
                        multiple
                        style={{ width: "100%" }}
                        id="servicos-select-edit"
                        options={todosServicos}
                        getOptionLabel={(option) => option.nome}
                        value={todosServicos.filter((servico) =>
                          servicosSelecionados.includes(servico.id)
                        )}
                        onChange={(event, newValue) => {
                          setServicosSelecionados(
                            newValue.map((item) => item.id)
                          );
                        }}
                        filterSelectedOptions
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Serviços"
                            placeholder="Digite para buscar serviços..."
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              key={option.id}
                              label={option.nome}
                              {...getTagProps({ index })}
                              deleteIcon={<CloseIcon />}
                            />
                          ))
                        }
                        loading={loading}
                        loadingText="Carregando serviços..."
                        noOptionsText="Nenhum serviço encontrado"
                      />
                    </div>

                    <div className="flex w-[100%] items-end justify-end mt-2 ">
                      <ButtonComponent
                        startIcon={<AddCircleOutlineIcon fontSize="small" />}
                        title={"Salvar"}
                        subtitle={"Salvar"}
                        buttonSize="large"
                        onClick={EditarPrestador}
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

export default Prestadores;
