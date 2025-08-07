import React, { useEffect, useState } from "react";
import MenuMobile from "../../components/menu-mobile";
import HeaderPerfil from "../../components/navbars/perfil";
import Navbar from "../../components/navbars/header";
import { motion } from "framer-motion";
import {
  Autocomplete,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  AddCircleOutline,
  Article,
  Close,
  Edit,
  Money,
  Numbers,
  Person,
  Search,
  Work,
} from "@mui/icons-material";
import TableLoading from "../../components/loading/loading-table/loading";
import TableComponent from "../../components/table";
import { atendimentosCadastrados } from "../../entities/header/atendimentos";
import CadastroServicosCliente from "./cadastro";
import { buscarOrcamento } from "../../service/get/orcamento";
import { transformarOrcamentosParaTabela } from "../../entities/class/orcamentos";
import { deletarOrcamento } from "../../service/delete/orcamento";
import { buscarClientes } from "../../service/get/clientes";
import { buscarPretadores } from "../../service/get/prestadores";
import CustomToast from "../../components/toast";
import ModalLateral from "../../components/modal-lateral";
import ButtonComponent from "../../components/button";
import { atualizaOrcamento } from "../../service/put/orcamento";

const Servico = () => {
  const [orcamentoParaEditar, setOrcamentoParaEditar] = useState(null);
  const [orcamentos, setOrcamentos] = useState([]);
  const [efeito, setEfeito] = useState(false);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [editando, setEditando] = useState(false);
  const [nomeServico, setNomeServico] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [servicosPorPrestador, setServicosPorPrestador] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [clientes, setClientes] = useState([]);
  const [servicosSelecionados, setServicosSelecionados] = useState({});
  const [listaPrestadores, setListaPrestadores] = useState([]);
  const [prestadorSelecionado, setPrestadorSelecionado] = useState(null);
  const [prestadoresAdicionados, setPrestadoresAdicionados] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [comissao, setComissao] = useState(0);
  const [valorPrestador, setValorPrestador] = useState(0);
  const [termoBusca, setTermoBusca] = useState("");

  const EditarOpcao = (rowData) => {
    try {
      const orcamentoCompleto = orcamentos.find((o) => o.id === rowData.id);
      if (!orcamentoCompleto) {
        CustomToast({ type: "error", message: "Orçamento não encontrado" });
        return;
      }
      setOrcamentoParaEditar(orcamentoCompleto);
      setEditando(true);
    } catch (error) {
      console.error("Erro ao preparar edição:", error);
      CustomToast({ type: "error", message: "Erro ao abrir edição" });
    }
  };
  const handleDeletar = async (rowDataOrId) => {
    const id = typeof rowDataOrId === "object" ? rowDataOrId.id : rowDataOrId;

    try {
      await deletarOrcamento(id);
      carregarDados();
    } catch (error) {
      console.error("Erro ao deletar serviço:", error);
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await buscarOrcamento();
      const dadosTransformados = transformarOrcamentosParaTabela(response.data);
      setListaUsuarios(dadosTransformados);
      setOrcamentos(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
      setListaUsuarios([]);
      setOrcamentos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setEfeito(true);
    }, 100);

    carregarDados();

    return () => clearTimeout(timer);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const handleCloseEdicao = () => {
    setEditando(false);
    setOrcamentoParaEditar(null);
    setNomeServico("");
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const carregarClientes = async (filtro = "") => {
    try {
      setLoading(true);
      const response = await buscarClientes(filtro);
      setClientes(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
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
  const handlePagamentoChange = (prestadorId, servicoId, field, value) => {
    setServicosPorPrestador((prev) => {
      const updated = { ...prev };
      const servicoIndex = updated[prestadorId]?.findIndex(
        (s) => s.id === servicoId
      );

      if (servicoIndex !== -1) {
        const numericValue =
          field === "tipo" || field === "metodo"
            ? value
            : parseFloat(value) || 0;

        updated[prestadorId][servicoIndex].pagamento[field] = numericValue;

        if (field === "tipo") {
          if (value === "1") {
            updated[prestadorId][servicoIndex].pagamento.parcelas = 1;
            updated[prestadorId][servicoIndex].pagamento.valorParcela =
              updated[prestadorId][servicoIndex].pagamento.valorTotal;
          }
        }

        if (field === "valorTotal") {
          updated[prestadorId][servicoIndex].pagamento.valorParcela =
            updated[prestadorId][servicoIndex].pagamento.tipo === "1"
              ? numericValue
              : numericValue /
                updated[prestadorId][servicoIndex].pagamento.parcelas;
        }

        if (field === "parcelas") {
          const num = Math.max(1, parseInt(value) || 1);
          updated[prestadorId][servicoIndex].pagamento.parcelas = num;
          updated[prestadorId][servicoIndex].pagamento.valorParcela =
            updated[prestadorId][servicoIndex].pagamento.valorTotal / num;
        }

        if (field === "comissao") {
          if (
            numericValue <=
            updated[prestadorId][servicoIndex].pagamento.valorTotal
          ) {
            updated[prestadorId][servicoIndex].pagamento.valorPrestador =
              updated[prestadorId][servicoIndex].pagamento.valorTotal -
              numericValue;
          }
        }

        if (field === "valorPrestador") {
          if (
            numericValue <=
            updated[prestadorId][servicoIndex].pagamento.valorTotal
          ) {
            updated[prestadorId][servicoIndex].pagamento.comissao =
              updated[prestadorId][servicoIndex].pagamento.valorTotal -
              numericValue;
          }
        }
      }

      return updated;
    });
  };

  const adicionarPrestador = () => {
    if (
      prestadorSelecionado &&
      !prestadoresAdicionados.some((p) => p.id === prestadorSelecionado.id)
    ) {
      setPrestadoresAdicionados([
        ...prestadoresAdicionados,
        prestadorSelecionado,
      ]);
      setServicosSelecionados({
        ...servicosSelecionados,
        [prestadorSelecionado.id]: null,
      });
      setPrestadorSelecionado(null);
    }
  };

  const handleServicoChange = (prestadorId, servico) => {
    setServicosSelecionados({
      ...servicosSelecionados,
      [prestadorId]: servico,
    });
  };

  const adicionarServico = (prestadorId) => {
    const servico = servicosSelecionados[prestadorId];
    if (servico) {
      setServicosPorPrestador((prev) => ({
        ...prev,
        [prestadorId]: [
          ...(prev[prestadorId] || []),
          {
            id: Date.now(),
            servicoId: servico.id,
            nome: servico.nome,
            descricao: servico.descricao,
            pagamento: {
              tipo: "1",
              metodo: "1",
              parcelas: 1,
              valorTotal: 0,
              valorParcela: 0,
              comissao: 0,
              valorPrestador: 0,
              dataInicio: new Date().toISOString().split("T")[0],
              dataEntrega: new Date().toISOString().split("T")[0],
              dataPagamento: new Date().toISOString().split("T")[0],
            },
          },
        ],
      }));

      setServicosSelecionados({
        ...servicosSelecionados,
        [prestadorId]: null,
      });
    }
  };

  const prepararDadosParaEnvio = () => {
    if (!nomeServico.trim()) {
      CustomToast({ type: "error", message: "Informe o nome do serviço" });
      return null;
    }

    if (!selectedCliente || !selectedCliente.id) {
      CustomToast({ type: "error", message: "Selecione um cliente" });
      return null;
    }

    if (prestadoresAdicionados.length === 0) {
      CustomToast({
        type: "error",
        message: "Adicione pelo menos um prestador",
      });
      return null;
    }

    for (const prestador of prestadoresAdicionados) {
      const servicosDoPrestador = servicosPorPrestador[prestador.id] || [];
      if (servicosDoPrestador.length === 0) {
        CustomToast({
          type: "error",
          message: `Adicione pelo menos um serviço para ${prestador.nome}`,
        });
        return null;
      }
    }

    const orcamento = {
      nome: nomeServico,
      cliente_id: selectedCliente.id,
      prestadores: prestadoresAdicionados.map((prestador) => {
        const servicosDoPrestador = servicosPorPrestador[prestador.id] || [];

        return {
          prestador_id: prestador.id,
          servicos: servicosDoPrestador.map((servico) => ({
            servico_id: servico.servicoId,
            tipo_pagamento: parseInt(servico.pagamento.tipo),
            metodo_pagamento: parseInt(servico.pagamento.metodo),
            numero_parcelas: servico.pagamento.parcelas,
            valor_total: parseFloat(servico.pagamento.valorTotal),
            valor_parcela: parseFloat(servico.pagamento.valorParcela),
            comissao: parseFloat(servico.pagamento.comissao),
            valor_prestador: parseFloat(servico.pagamento.valorPrestador),
            data_inicio: servico.pagamento.dataInicio,
            data_entrega: servico.pagamento.dataEntrega,
            data_pagamento: servico.pagamento.dataPagamento,
          })),
        };
      }),
    };

    return orcamento;
  };
  const removerServico = (prestadorId, servicoId) => {
    setServicosPorPrestador((prev) => ({
      ...prev,
      [prestadorId]: (prev[prestadorId] || []).filter(
        (s) => s.id !== servicoId
      ),
    }));
  };

  const prepararDadosParaEdicao = (orcamento) => {
    if (!orcamento) return;

    setNomeServico(orcamento.nome);
    setSelectedCliente(orcamento.cliente);
    const prestadoresAdicionados = orcamento.prestadores.map(
      (p) => p.prestador
    );
    setPrestadoresAdicionados(prestadoresAdicionados);
    const servicosPorPrestadorFormatado = {};

    orcamento.prestadores.forEach((prestador) => {
      servicosPorPrestadorFormatado[prestador.prestador_id] =
        prestador.servicos.map((servico) => ({
          id: servico.id,
          servicoId: servico.servico_id,
          nome: servico.servico.nome,
          descricao: servico.servico.descricao,
          pagamento: {
            tipo: servico.tipo_pagamento.toString(),
            metodo: servico.metodo_pagamento.toString(),
            parcelas: parseInt(servico.numero_parcelas) || 1,
            valorTotal: parseFloat(servico.valor_total) || 0,
            valorParcela: parseFloat(servico.valor_parcela) || 0,
            comissao: parseFloat(servico.comissao) || 0,
            valorPrestador: parseFloat(servico.valor_prestador) || 0,
            dataInicio:
              servico.data_inicio?.split("T")[0] ||
              new Date().toISOString().split("T")[0],
            dataEntrega:
              servico.data_entrega?.split("T")[0] ||
              new Date().toISOString().split("T")[0],
            dataPagamento:
              servico.data_pagamento?.split("T")[0] ||
              new Date().toISOString().split("T")[0],
          },
        }));
    });

    setServicosPorPrestador(servicosPorPrestadorFormatado);
  };

  const atualizarOrcamento = async () => {
    try {
      setLoading(true);
      const dadosParaEnvio = prepararDadosParaEnvio();

      if (!dadosParaEnvio) return;

      if (!orcamentoParaEditar?.id) {
        CustomToast({
          type: "error",
          message: "ID do orçamento não encontrado",
        });
        return;
      }

      const response = await atualizaOrcamento(
        dadosParaEnvio,
        orcamentoParaEditar.id
      );

      if (response) {
        carregarDados();
        handleCloseEdicao();
      }
    } catch (error) {
      console.error("Erro ao atualizar orçamento:", error);
      CustomToast({
        type: "error",
        message: error.response?.data?.message || "Erro ao atualizar orçamento",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orcamentoParaEditar) {
      prepararDadosParaEdicao(orcamentoParaEditar);
      setActiveStep(1);
    } else {
      setSelectedCliente(null);
      setPrestadoresAdicionados([]);
      setServicosPorPrestador({});
      setActiveStep(0);
    }
  }, [orcamentoParaEditar]);

  useEffect(() => {
    if (comissao + valorPrestador !== valorTotal) {
      setValorPrestador(valorTotal - comissao);
    }
  }, [valorTotal, comissao, valorPrestador]);

  useEffect(() => {
    carregarClientes();
    buscarPrestadoresCadastrados();
  }, []);

  useEffect(() => {
    if (orcamentoParaEditar) {
      setSelectedCliente(orcamentoParaEditar.cliente);
    }
  }, [orcamentoParaEditar]);

  const filtrarServicos = () => {
    if (!termoBusca.trim()) {
      return listaUsuarios;
    }

    const termo = termoBusca.toLowerCase();
    return listaUsuarios.filter(
      (servico) =>
        servico.nome.toLowerCase().includes(termo) ||
        servico.cliente.toLowerCase().includes(termo) ||
        servico.prestadores.toLowerCase().includes(termo)
    );
  };

  const servicosFiltrados = filtrarServicos();

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
          <HeaderPerfil pageTitle="Serviços" />

          <div className=" items-center justify-center lg:justify-start w-full mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="w-[100%] itens-center mt-2 ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[95%]">
              <div className="flex gap-2 flex-wrap w-full justify-center md:justify-start">
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Buscar Serviço"
                  autoComplete="off"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  sx={{ width: { xs: "72%", sm: "50%", md: "40%", lg: "40%" } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <CadastroServicosCliente onSuccess={carregarDados} />
              </div>
              <div className="w-full flex">
                {loading ? (
                  <TableLoading />
                ) : servicosFiltrados.length > 0 ? (
                  <TableComponent
                    headers={atendimentosCadastrados}
                    rows={servicosFiltrados}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      edit: (rowData) => EditarOpcao(rowData),
                      delete: handleDeletar,
                    }}
                  />
                ) : (
                  <div className="text-center flex items-center mt-28 justify-center gap-5 w-full flex-col text-primary">
                    <TableLoading />
                    <label className="text-sm">
                      Nenhum serviço encontrado com esse nome !"
                    </label>
                  </div>
                )}
              </div>
              <ModalLateral
                open={editando}
                width={{
                  xs: "400px",
                  lg: "700px",
                }}
                handleClose={handleCloseEdicao}
                tituloModal="Editar Serviço"
                icon={<Edit />}
                tamanhoTitulo="75%"
                conteudo={
                  <div
                    className="w-full flex items-start gap-3 flex-wrap"
                    style={{ maxHeight: "500px", overflow: "auto" }}
                  >
                    <div className="mt-4 flex gap-3 flex-wrap">
                      <Box className="flex w-full items-center justify-center">
                        <BottomNavigation
                          showLabels
                          className="w-[95%] flex flex-wrap"
                          value={activeStep}
                          onChange={(event, newValue) =>
                            handleStepChange(newValue)
                          }
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
                            { label: "Trabalho", icon: <Work /> },
                          ].map((item, index) => (
                            <BottomNavigationAction
                              key={index}
                              label={item.label}
                              icon={item.icon}
                              sx={{
                                minWidth:
                                  activeStep === index ? "180px" : "200px",
                                height: "45px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: "8px",
                                color:
                                  activeStep === index ? "#9D4B5B" : "#ffffff",
                                backgroundColor:
                                  activeStep === index ? "#ffffff" : "#9D4B5B",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  backgroundColor:
                                    activeStep === index
                                      ? "#ffffff"
                                      : "#cf7889",
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
                            <div className="flex w-full flex-wrap gap-2 items-center">
                              <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                label="Nome do Serviço"
                                value={nomeServico}
                                onChange={(e) => setNomeServico(e.target.value)}
                                autoComplete="off"
                                sx={{
                                  width: {
                                    xs: "72%",
                                    sm: "50%",
                                    md: "40%",
                                    lg: "48%",
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
                                options={clientes}
                                getOptionLabel={(option) => option.nome}
                                value={selectedCliente}
                                onChange={(event, newValue) =>
                                  setSelectedCliente(newValue)
                                }
                                isOptionEqualToValue={(option, value) =>
                                  option.id === value.id
                                }
                                style={{
                                  width: "45%",
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    label="Cliente"
                                    InputProps={{
                                      ...params.InputProps,
                                      startAdornment: (
                                        <>
                                          <InputAdornment position="start">
                                            <Person />
                                          </InputAdornment>
                                          {params.InputProps.startAdornment}
                                        </>
                                      ),
                                    }}
                                  />
                                )}
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
                            <div className="w-[95%] flex itens-start gap-3">
                              <div className="w-[100%]">
                                <div className="flex w-[100%] items-center gap-3 flex-wrap">
                                  <div className="flex w-[100%] items-center gap-3 flex-wrap">
                                    <Autocomplete
                                      options={listaPrestadores.filter(
                                        (prestador) =>
                                          !prestadoresAdicionados.some(
                                            (p) => p.id === prestador.id
                                          )
                                      )}
                                      getOptionLabel={(option) => option.nome}
                                      value={prestadorSelecionado}
                                      onChange={(event, newValue) =>
                                        setPrestadorSelecionado(newValue)
                                      }
                                      isOptionEqualToValue={(option, value) =>
                                        option.id === value.id
                                      }
                                      style={{ width: "50%" }}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          fullWidth
                                          variant="outlined"
                                          size="small"
                                          label="Prestadores"
                                          InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                              <>
                                                <InputAdornment position="start">
                                                  <Work />
                                                </InputAdornment>
                                                {
                                                  params.InputProps
                                                    .startAdornment
                                                }
                                              </>
                                            ),
                                          }}
                                        />
                                      )}
                                    />
                                    <ButtonComponent
                                      startIcon={
                                        <AddCircleOutline fontSize="small" />
                                      }
                                      title={"Adicionar"}
                                      subtitle={"Adicionar"}
                                      buttonSize="large"
                                      onClick={adicionarPrestador}
                                      disabled={!prestadorSelecionado}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-2 mt-2 w-full">
                                    {prestadoresAdicionados.map((prestador) => (
                                      <div
                                        key={prestador.id}
                                        className="flex flex-col p-3 border rounded-lg bg-gray-50 w-full relative"
                                      >
                                        <button
                                          onClick={() => {
                                            setPrestadoresAdicionados(
                                              prestadoresAdicionados.filter(
                                                (p) => p.id !== prestador.id
                                              )
                                            );
                                            const novosServicos = {
                                              ...servicosPorPrestador,
                                            };
                                            delete novosServicos[prestador.id];
                                            setServicosPorPrestador(
                                              novosServicos
                                            );

                                            const novosSelecionados = {
                                              ...servicosSelecionados,
                                            };
                                            delete novosSelecionados[
                                              prestador.id
                                            ];
                                            setServicosSelecionados(
                                              novosSelecionados
                                            );
                                          }}
                                          className="absolute top-2 right-2 text-[#9D4B5B] hover:text-[#cf7889]"
                                        >
                                          <Close fontSize="small" />
                                        </button>

                                        <div className="font-semibold text-[#9D4B5B] w-full">
                                          {prestador.nome}
                                        </div>

                                        <div className="w-full flex items-center gap-2 mt-3">
                                          <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            select
                                            label="Serviços"
                                            value={
                                              servicosSelecionados[
                                                prestador.id
                                              ] || ""
                                            }
                                            onChange={(e) =>
                                              handleServicoChange(
                                                prestador.id,
                                                e.target.value
                                              )
                                            }
                                            style={{ width: "50%" }}
                                            InputProps={{
                                              startAdornment: (
                                                <InputAdornment position="start">
                                                  <Work />
                                                </InputAdornment>
                                              ),
                                            }}
                                          >
                                            {prestador.servicosArray?.map(
                                              (servico) => (
                                                <MenuItem
                                                  key={servico.id}
                                                  value={servico}
                                                >
                                                  {servico.nome}
                                                </MenuItem>
                                              )
                                            )}
                                          </TextField>
                                          <ButtonComponent
                                            startIcon={
                                              <AddCircleOutline fontSize="small" />
                                            }
                                            title={"Adicionar"}
                                            subtitle={"Adicionar"}
                                            buttonSize="large"
                                            onClick={() =>
                                              adicionarServico(prestador.id)
                                            }
                                            disabled={
                                              !servicosSelecionados[
                                                prestador.id
                                              ]
                                            }
                                          />
                                        </div>

                                        <div className="mt-2 flex flex-col gap-2">
                                          {(
                                            servicosPorPrestador[
                                              prestador.id
                                            ] || []
                                          ).map((servico) => (
                                            <div
                                              key={servico.id}
                                              className="flex flex-col gap-3 p-3 bg-gray-100 rounded"
                                            >
                                              <div className="flex justify-between items-center">
                                                <label className="font-medium">
                                                  {servico.nome}
                                                </label>
                                                <button
                                                  onClick={() =>
                                                    removerServico(
                                                      prestador.id,
                                                      servico.id
                                                    )
                                                  }
                                                  className="text-[#9D4B5B] hover:text-[#cf7889]"
                                                >
                                                  <Close fontSize="small" />
                                                </button>
                                              </div>

                                              <div className="w-full flex flex-wrap gap-2 items-center">
                                                {/* Tipo de Pagamento */}
                                                <TextField
                                                  fullWidth
                                                  variant="outlined"
                                                  size="small"
                                                  select
                                                  label="Tipo Pagamento"
                                                  value={servico.pagamento.tipo}
                                                  onChange={(e) =>
                                                    handlePagamentoChange(
                                                      prestador.id,
                                                      servico.id,
                                                      "tipo",
                                                      e.target.value
                                                    )
                                                  }
                                                  style={{ width: "26%" }}
                                                  InputProps={{
                                                    startAdornment: (
                                                      <InputAdornment position="start">
                                                        <Money />
                                                      </InputAdornment>
                                                    ),
                                                  }}
                                                >
                                                  <MenuItem value="1">
                                                    À Vista
                                                  </MenuItem>
                                                  <MenuItem value="2">
                                                    Parcelado
                                                  </MenuItem>
                                                </TextField>
                                                {/* Método de Pagamento */}
                                                <TextField
                                                  fullWidth
                                                  variant="outlined"
                                                  size="small"
                                                  select
                                                  label="Método Pagamento"
                                                  value={
                                                    servico.pagamento.metodo
                                                  }
                                                  onChange={(e) =>
                                                    handlePagamentoChange(
                                                      prestador.id,
                                                      servico.id,
                                                      "metodo",
                                                      e.target.value
                                                    )
                                                  }
                                                  style={{ width: "30%" }}
                                                  InputProps={{
                                                    startAdornment: (
                                                      <InputAdornment position="start">
                                                        <Money />
                                                      </InputAdornment>
                                                    ),
                                                  }}
                                                >
                                                  <MenuItem value="1">
                                                    Dinheiro
                                                  </MenuItem>
                                                  <MenuItem value="2">
                                                    PIX
                                                  </MenuItem>
                                                  <MenuItem value="3">
                                                    Débito
                                                  </MenuItem>
                                                  <MenuItem value="4">
                                                    Crédito
                                                  </MenuItem>
                                                  <MenuItem value="5">
                                                    Cheque
                                                  </MenuItem>
                                                </TextField>
                                                {/* Número de Parcelas (só aparece se for parcelado) */}
                                                {servico.pagamento.tipo ===
                                                  "2" && (
                                                  <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    label="Nº Parcelas"
                                                    type="number"
                                                    value={
                                                      servico.pagamento.parcelas
                                                    }
                                                    onChange={(e) =>
                                                      handlePagamentoChange(
                                                        prestador.id,
                                                        servico.id,
                                                        "parcelas",
                                                        e.target.value
                                                      )
                                                    }
                                                    style={{ width: "15%" }}
                                                    InputProps={{
                                                      startAdornment: (
                                                        <InputAdornment position="start">
                                                          <Numbers />
                                                        </InputAdornment>
                                                      ),
                                                    }}
                                                  />
                                                )}
                                                {/* Valor Total */}
                                                <TextField
                                                  fullWidth
                                                  variant="outlined"
                                                  size="small"
                                                  label="Valor Total"
                                                  type="number"
                                                  value={
                                                    servico.pagamento.valorTotal
                                                  }
                                                  onChange={(e) =>
                                                    handlePagamentoChange(
                                                      prestador.id,
                                                      servico.id,
                                                      "valorTotal",
                                                      e.target.value
                                                    )
                                                  }
                                                  style={{ width: "20%" }}
                                                  InputProps={{
                                                    startAdornment: (
                                                      <InputAdornment position="start">
                                                        <Money />
                                                      </InputAdornment>
                                                    ),
                                                  }}
                                                />
                                                {servico.pagamento.tipo ===
                                                  "2" && (
                                                  <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    label="Valor Parcela"
                                                    value={Number(
                                                      servico.pagamento
                                                        .valorParcela || 0
                                                    ).toFixed(2)}
                                                    disabled
                                                    style={{ width: "20%" }}
                                                    InputProps={{
                                                      startAdornment: (
                                                        <InputAdornment position="start">
                                                          <Money />
                                                        </InputAdornment>
                                                      ),
                                                    }}
                                                  />
                                                )}
                                                <TextField
                                                  fullWidth
                                                  variant="outlined"
                                                  size="small"
                                                  label="Comissão"
                                                  type="number"
                                                  value={
                                                    servico.pagamento.comissao
                                                  }
                                                  onChange={(e) =>
                                                    handlePagamentoChange(
                                                      prestador.id,
                                                      servico.id,
                                                      "comissao",
                                                      e.target.value
                                                    )
                                                  }
                                                  style={{ width: "20%" }}
                                                  InputProps={{
                                                    startAdornment: (
                                                      <InputAdornment position="start">
                                                        <Money />
                                                      </InputAdornment>
                                                    ),
                                                  }}
                                                />
                                                {/* Valor Prestador */}
                                                <TextField
                                                  fullWidth
                                                  variant="outlined"
                                                  size="small"
                                                  label="Valor Prestador"
                                                  type="number"
                                                  value={
                                                    servico.pagamento
                                                      .valorPrestador
                                                  }
                                                  onChange={(e) =>
                                                    handlePagamentoChange(
                                                      prestador.id,
                                                      servico.id,
                                                      "valorPrestador",
                                                      e.target.value
                                                    )
                                                  }
                                                  style={{ width: "20%" }}
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
                                                  type="date"
                                                  label="Data de Início"
                                                  value={
                                                    servico.pagamento.dataInicio
                                                  }
                                                  onChange={(e) =>
                                                    handlePagamentoChange(
                                                      prestador.id,
                                                      servico.id,
                                                      "dataInicio",
                                                      e.target.value
                                                    )
                                                  }
                                                  style={{ width: "25%" }}
                                                  InputLabelProps={{
                                                    shrink: true,
                                                  }}
                                                />
                                                <TextField
                                                  fullWidth
                                                  variant="outlined"
                                                  size="small"
                                                  type="date"
                                                  label="Data de Entrega"
                                                  style={{ width: "27%" }}
                                                  value={
                                                    servico.pagamento
                                                      .dataEntrega
                                                  }
                                                  onChange={(e) =>
                                                    handlePagamentoChange(
                                                      prestador.id,
                                                      servico.id,
                                                      "dataEntrega",
                                                      e.target.value
                                                    )
                                                  }
                                                  InputProps={{
                                                    startAdornment: (
                                                      <InputAdornment position="start">
                                                        <Money />
                                                      </InputAdornment>
                                                    ),
                                                  }}
                                                ></TextField>
                                                <TextField
                                                  fullWidth
                                                  variant="outlined"
                                                  size="small"
                                                  type="date"
                                                  label="Data Pagamento"
                                                  value={
                                                    servico.pagamento
                                                      .dataPagamento
                                                  }
                                                  onChange={(e) =>
                                                    handlePagamentoChange(
                                                      prestador.id,
                                                      servico.id,
                                                      "dataPagamento",
                                                      e.target.value
                                                    )
                                                  }
                                                  style={{ width: "27%" }}
                                                  InputProps={{
                                                    startAdornment: (
                                                      <InputAdornment position="start">
                                                        <Money />
                                                      </InputAdornment>
                                                    ),
                                                  }}
                                                ></TextField>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </div>
                    <div className="flex w-full justify-between mt-4 p-2 border-t">
                      <ButtonComponent
                        title={"Voltar"}
                        subtitle={"Voltar"}
                        buttonSize="medium"
                        disabled={activeStep === 0}
                        onClick={() =>
                          setActiveStep((prev) => Math.max(prev - 1, 0))
                        }
                        sx={{
                          visibility: activeStep === 0 ? "hidden" : "visible",
                        }}
                      />

                      {activeStep < 1 ? (
                        <ButtonComponent
                          title={"Avançar"}
                          subtitle={"Avançar"}
                          buttonSize="medium"
                          onClick={() =>
                            setActiveStep((prev) => Math.min(prev + 1, 2))
                          }
                        />
                      ) : (
                        <ButtonComponent
                          title={"Salvar"}
                          subtitle={"Salvar"}
                          buttonSize="medium"
                          onClick={atualizarOrcamento}
                          loading={loading}
                        />
                      )}
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

export default Servico;
