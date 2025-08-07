import React, { useEffect, useState } from "react";
import ButtonComponent from "../../../components/button";
import {
  AddCircleOutline,
  AddCircleOutlineOutlined,
  Article,
  Close,
  Money,
  Numbers,
  Person,
  Work,
} from "@mui/icons-material";
import CentralModal from "../../../components/modal-central";
import {
  Autocomplete,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import { motion } from "framer-motion";
import { buscarClientes } from "../../../service/get/clientes";
import { buscarPretadores } from "../../../service/get/prestadores";
import CustomToast from "../../../components/toast";
import { criarOrcamento } from "../../../service/post/orcamento";

const CadastroServicosCliente = ({ onSuccess }) => {
  const [nomeServico, setNomeServico] = useState("");
  const [loading, setLoading] = useState(false);
  const [cadastro, setCadastro] = useState(false);
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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  const limparEstados = () => {
    setNomeServico("");
    setSelectedCliente(null);
    setServicosPorPrestador({});
    setServicosSelecionados({});
    setPrestadoresAdicionados([]);
    setPrestadorSelecionado(null);
    setValorTotal(0);
    setComissao(0);
    setValorPrestador(0);
  };

  const FecharCadastro = () => {
    setCadastro(false);
    limparEstados();
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

      // Filtrar apenas prestadores ativos
      const prestadoresAtivos = response.data.filter(
        (prestador) => prestador.ativo
      );

      const prestadoresFormatados = prestadoresAtivos.map((prestador) => ({
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
        statusLabel: "Ativo", // Como já filtramos, todos são ativos
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
      const servicoIndex = updated[prestadorId].findIndex(
        (s) => s.id === servicoId
      );

      if (servicoIndex !== -1) {
        updated[prestadorId][servicoIndex].pagamento[field] = value;

        if (field === "tipo") {
          if (value === "1") {
            updated[prestadorId][servicoIndex].pagamento.parcelas = 1;
            updated[prestadorId][servicoIndex].pagamento.valorParcela =
              updated[prestadorId][servicoIndex].pagamento.valorTotal;
          }
        }

        if (field === "valorTotal") {
          const valor = parseFloat(value) || 0;
          updated[prestadorId][servicoIndex].pagamento.valorTotal = valor;
          updated[prestadorId][servicoIndex].pagamento.valorParcela =
            updated[prestadorId][servicoIndex].pagamento.tipo === "1"
              ? valor
              : valor / updated[prestadorId][servicoIndex].pagamento.parcelas;
        }

        if (field === "parcelas") {
          const num = Math.max(1, parseInt(value) || 1);
          updated[prestadorId][servicoIndex].pagamento.parcelas = num;
          updated[prestadorId][servicoIndex].pagamento.valorParcela =
            updated[prestadorId][servicoIndex].pagamento.valorTotal / num;
        }

        if (field === "comissao") {
          const val = parseFloat(value) || 0;
          if (val <= updated[prestadorId][servicoIndex].pagamento.valorTotal) {
            updated[prestadorId][servicoIndex].pagamento.comissao = val;
            updated[prestadorId][servicoIndex].pagamento.valorPrestador =
              updated[prestadorId][servicoIndex].pagamento.valorTotal - val;
          }
        }

        if (field === "valorPrestador") {
          const val = parseFloat(value) || 0;
          if (val <= updated[prestadorId][servicoIndex].pagamento.valorTotal) {
            updated[prestadorId][servicoIndex].pagamento.valorPrestador = val;
            updated[prestadorId][servicoIndex].pagamento.comissao =
              updated[prestadorId][servicoIndex].pagamento.valorTotal - val;
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

    const orcamento = {
      nome: nomeServico,
      cliente_id: selectedCliente.id,
      prestadores: [],
    };

    prestadoresAdicionados.forEach((prestador) => {
      const servicosDoPrestador = servicosPorPrestador[prestador.id] || [];

      if (servicosDoPrestador.length === 0) {
        CustomToast({
          type: "error",
          message: `Adicione pelo menos um serviço para ${prestador.nome}`,
        });
        return null;
      }

      const prestadorData = {
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
          data_inicio:
            servico.pagamento.dataInicio ||
            new Date().toISOString().split("T")[0],
          data_entrega:
            servico.pagamento.dataEntrega ||
            new Date().toISOString().split("T")[0],
          data_pagamento:
            servico.pagamento.dataPagamento ||
            new Date().toISOString().split("T")[0],
        })),
      };

      orcamento.prestadores.push(prestadorData);
    });
    onSuccess();
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

  useEffect(() => {
    if (comissao + valorPrestador !== valorTotal) {
      setValorPrestador(valorTotal - comissao);
    }
  }, [valorTotal, comissao, valorPrestador]);

  useEffect(() => {
    carregarClientes();
    buscarPrestadoresCadastrados();
  }, []);

  return (
    <div>
      <ButtonComponent
        startIcon={<AddCircleOutlineOutlined fontSize="small" />}
        title={"Cadastrar"}
        subtitle={"Cadastrar"}
        buttonSize="large"
        onClick={() => setCadastro(true)}
      />

      <CentralModal
        tamanhoTitulo={"81%"}
        maxHeight={"90vh"}
        top={"20%"}
        left={"28%"}
        width={"750px"}
        icon={<AddCircleOutline fontSize="small" />}
        open={cadastro}
        onClose={FecharCadastro}
        title="Cadastrar Serviço"
      >
        <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
          <div className="mt-4 flex gap-3 flex-wrap">
            <Box className="flex w-full items-center justify-center">
              <BottomNavigation
                showLabels
                className="w-[95%] flex flex-wrap"
                value={activeStep}
                onChange={(event, newValue) => handleStepChange(newValue)}
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
                      minWidth: activeStep === index ? "180px" : "200px",
                      height: "45px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "8px",
                      color: activeStep === index ? "#9D4B5B" : "#ffffff",
                      backgroundColor:
                        activeStep === index ? "#ffffff" : "#9D4B5B",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor:
                          activeStep === index ? "#ffffff" : "#cf7889",
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
                      autoComplete="off"
                      value={nomeServico}
                      onChange={(e) => setNomeServico(e.target.value)}
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
                      options={clientes.filter((cliente) => cliente.ativo)}
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
                                      {params.InputProps.startAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                          />
                          <ButtonComponent
                            startIcon={<AddCircleOutline fontSize="small" />}
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
                                  setServicosPorPrestador(novosServicos);

                                  const novosSelecionados = {
                                    ...servicosSelecionados,
                                  };
                                  delete novosSelecionados[prestador.id];
                                  setServicosSelecionados(novosSelecionados);
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
                                    servicosSelecionados[prestador.id] || ""
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
                                  {prestador.servicosArray
                                    ?.filter((servico) => servico.ativo) // Filtra apenas serviços ativos
                                    ?.map((servico) => (
                                      <MenuItem
                                        key={servico.id}
                                        value={servico}
                                      >
                                        {servico.nome}
                                      </MenuItem>
                                    ))}
                                </TextField>
                                <ButtonComponent
                                  startIcon={
                                    <AddCircleOutline fontSize="small" />
                                  }
                                  title={"Adicionar"}
                                  subtitle={"Adicionar"}
                                  buttonSize="large"
                                  onClick={() => adicionarServico(prestador.id)}
                                  disabled={!servicosSelecionados[prestador.id]}
                                />
                              </div>

                              <div className="mt-2 flex flex-col gap-2">
                                {(servicosPorPrestador[prestador.id] || []).map(
                                  (servico) => (
                                    <div
                                      key={servico.id}
                                      className="flex flex-col gap-3 p-3 bg-gray-100 rounded"
                                    >
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium">
                                          {servico.nome}
                                        </span>
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
                                          style={{ width: "30%" }}
                                          InputProps={{
                                            startAdornment: (
                                              <InputAdornment position="start">
                                                <Money />
                                              </InputAdornment>
                                            ),
                                          }}
                                        >
                                          <MenuItem value="1">À Vista</MenuItem>
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
                                          value={servico.pagamento.metodo}
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
                                          <MenuItem value="2">PIX</MenuItem>
                                          <MenuItem value="3">Débito</MenuItem>
                                          <MenuItem value="4">Crédito</MenuItem>
                                          <MenuItem value="5">Cheque</MenuItem>
                                        </TextField>
                                        {/* Número de Parcelas (só aparece se for parcelado) */}
                                        {servico.pagamento.tipo === "2" && (
                                          <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            label="Nº Parcelas"
                                            type="number"
                                            value={servico.pagamento.parcelas}
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
                                          value={servico.pagamento.valorTotal}
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
                                        {/* Valor Parcela (só aparece se for parcelado) */}
                                        {servico.pagamento.tipo === "2" && (
                                          <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            label="Valor Parcela"
                                            value={servico.pagamento.valorParcela.toFixed(
                                              2
                                            )}
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
                                          value={servico.pagamento.comissao}
                                          onChange={(e) =>
                                            handlePagamentoChange(
                                              prestador.id,
                                              servico.id,
                                              "comissao",
                                              e.target.value
                                            )
                                          }
                                          style={{ width: "16%" }}
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
                                            servico.pagamento.valorPrestador
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
                                          value={servico.pagamento.dataInicio}
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
                                          style={{ width: "25%" }}
                                          value={servico.pagamento.dataEntrega}
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
                                            servico.pagamento.dataPagamento
                                          }
                                          onChange={(e) =>
                                            handlePagamentoChange(
                                              prestador.id,
                                              servico.id,
                                              "dataPagamento",
                                              e.target.value
                                            )
                                          }
                                          style={{ width: "25%" }}
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
                                  )
                                )}
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
        </div>
        <div className="flex justify-between mt-4 p-2 border-t">
          <ButtonComponent
            title={"Voltar"}
            subtitle={"Voltar"}
            buttonSize="medium"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
            sx={{
              visibility: activeStep === 0 ? "hidden" : "visible",
            }}
          />

          {activeStep < 1 ? (
            <ButtonComponent
              title={"Avançar"}
              subtitle={"Avançar"}
              buttonSize="medium"
              onClick={() => setActiveStep((prev) => Math.min(prev + 1, 2))}
            />
          ) : (
            <ButtonComponent
              title={"Finalizar"}
              subtitle={"Finalizar"}
              buttonSize="medium"
              loading={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const dadosParaEnviar = prepararDadosParaEnvio();
                  if (!dadosParaEnviar) {
                    setLoading(false);
                    return;
                  }

                  const response = await criarOrcamento(dadosParaEnviar);
                  CustomToast({
                    type: "success",
                    message: "Serviço criado com sucesso!",
                  });
                  limparEstados();
                  setCadastro(false);
                  onSuccess();
                } catch (error) {
                  console.error("Erro ao criar orçamento:", error);
                } finally {
                  setLoading(false);
                }
              }}
            />
          )}
        </div>
      </CentralModal>
    </div>
  );
};

export default CadastroServicosCliente;
