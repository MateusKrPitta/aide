import React, { useEffect, useState } from "react";
import ModalLateral from "../../../components/modal-lateral";
import {
  AddCircle,
  Article,
  AttachMoney,
  Close,
  DateRange,
  Edit,
  LocationOn,
  MonetizationOn,
  Numbers,
  Person,
  Save,
  Work,
} from "@mui/icons-material";
import {
  Autocomplete,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import ButtonComponent from "../../../components/button";
import { motion } from "framer-motion";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import CustomToast from "../../../components/toast";
import { buscarClientes } from "../../../service/get/clientes";
import { listarTiposPalestra } from "../../../service/get/tipo-palestra";
import { buscarPretadores } from "../../../service/get/prestadores";
import { atualizarPalestraCurso } from "../../../service/put/palestras-cursos";
import { buscarPalestraCurso } from "../../../service/get/palestra-curso";
import { cadastrosPalestraCurso } from "../../../entities/class/palestra-cursos";

const EditarPalestra = ({ open, onClose, onSave, palestra }) => {
  useEffect(() => {
    if (palestra) {
      setSelectedCliente(palestra.cliente ? { nome: palestra.cliente } : null);
      setData("");
      setHorario(palestra.horário ? formatTimeForInput(palestra.horário) : "");
      setValor(palestra.valor ? palestra.valor.replace("R$ ", "") : "");
      setPaymentStatus(
        palestra.statusPagamento === "Pago"
          ? "Pago"
          : palestra.statusPagamento === "Pendente"
          ? "Pendente"
          : "Outro"
      );
      setHorario("");
      setValor("");
      setSecoes("");
      setSelectedLecture("");
      setPaymentStatus("Pendente");
      setPaymentType("À vista");
      setCurrentPaymentMethod("Dinheiro");
      setCurrentPaymentDate("");
      setPaymentMethods([]);
      setSessoesAdicionadas([]);
      setTotalPaid(0);
      setPaymentType(palestra.tipo_pagamento === "1" ? "À vista" : "Parcelado");
      setInstallments(palestra.qtd_parcelas || 1);

      const formaPagamento =
        palestra.forma_pagamento === "1"
          ? "Dinheiro"
          : palestra.forma_pagamento === "2"
          ? "PIX"
          : palestra.forma_pagamento === "3"
          ? "Débito"
          : palestra.forma_pagamento === "4"
          ? "Crédito"
          : "Cheque";
      setCurrentPaymentMethod(formaPagamento);
      if (palestra.valor) {
        const valorNumerico = parseFloat(palestra.valor.replace("R$ ", ""));
        setPaymentMethods([
          {
            method: formaPagamento,
            value: valorNumerico,
            date: palestra.data ? formatDateForInput(palestra.data) : "",
          },
        ]);
        setTotalPaid(valorNumerico);
      }

      setSessoesAdicionadas([
        {
          id: Date.now(),
          horario: palestra.horário ? formatTimeForInput(palestra.horário) : "",
          data: palestra.data ? formatDateForInput(palestra.data) : "",
          secoes: palestra.secoes || "",
          palestra: palestra.nome || "",
          valor: palestra.valor ? palestra.valor.replace("R$ ", "") : "",
        },
      ]);
    }
  }, [palestra]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("/");
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const formatTimeForInput = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  const [nomePalestra, setNomePalestra] = useState(palestra?.nome || "");
  const [endereco, setEndereco] = useState(palestra?.endereco || "");
  const [loading, setLoading] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [sessoesAdicionadas, setSessoesAdicionadas] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState("");
  const [botaoAdicionarDesabilitado, setBotaoAdicionarDesabilitado] =
    useState(false);
  const [horario, setHorario] = useState("");
  const [data, setData] = useState("");
  const [valor, setValor] = useState("");
  const [secoes, setSecoes] = useState("");
  const [clientes, setClientes] = useState([]);
  const [currentPaymentDate, setCurrentPaymentDate] = useState("");
  const [listaPrestadores, setListaPrestadores] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [tiposPalestra, setTiposPalestra] = useState([]);
  const [selectedLectures, setSelectedLectures] = useState([]);
  const [installments, setInstallments] = useState(1);
  const [installmentValue, setInstallmentValue] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState("Dinheiro");
  const [paymentType, setPaymentType] = useState("À vista");
  const [paymentStatus, setPaymentStatus] = useState("Pendente");
  const [currentPaymentValue, setCurrentPaymentValue] = useState("");
  const [totalPaid, setTotalPaid] = useState(0);
  const [lista, setLista] = useState([]);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const handleAdicionarSessao = () => {
    if (!selectedLecture || !valor) {
      CustomToast({
        type: "warning",
        message: "Selecione uma palestra e informe o valor",
      });
      return;
    }

    const novaSessao = {
      id: Date.now(),
      horario: horario,
      data: data,
      secoes: secoes,
      palestra: selectedLecture,
      valor: valor,
    };

    setSessoesAdicionadas([...sessoesAdicionadas, novaSessao]);
    setBotaoAdicionarDesabilitado(true);

    setHorario("");
    setData("");
    setSecoes("");
    setSelectedLecture("");
    setValor("");
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

  useEffect(() => {
    if (paymentType === "Parcelado" && selectedLectures.length > 0) {
      const total = selectedLectures.reduce(
        (sum, lecture) => sum + parseFloat(lecture.price || 0),
        0
      );
      setInstallmentValue(calculateInstallmentValue(total, installments));
    }
  }, [paymentType, installments, selectedLectures]);

  const mascaraHorario = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 2) {
      value = value.substring(0, 2) + ":" + value.substring(2, 4);
    }

    setHorario(value.substring(0, 5));
  };

  const valorMascara = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setValor(value);
  };

  const adicionarPagamento = () => {
    if (currentPaymentValue && parseFloat(currentPaymentValue) > 0) {
      const valorPagamento = parseFloat(currentPaymentValue);
      const valorRestante = parseFloat(valor) - totalPaid;

      if (valorPagamento > valorRestante) {
        CustomToast({
          type: "warning",
          message: `O valor excede o restante a pagar (R$ ${valorRestante.toFixed(
            2
          )})`,
        });
        return;
      }

      const newPayment = {
        method: currentPaymentMethod,
        value: valorPagamento,
        date: currentPaymentDate,
      };

      setPaymentMethods([...paymentMethods, newPayment]);
      setTotalPaid(totalPaid + valorPagamento);
      setCurrentPaymentValue("");
      setCurrentPaymentDate("");
    }
  };

  const removerPagamento = (index) => {
    const updatedPayments = paymentMethods.filter((_, i) => i !== index);
    setPaymentMethods(updatedPayments);

    const removedAmount = paymentMethods[index].value;
    setTotalPaid((prev) => prev - removedAmount);
  };

  const calculateInstallmentValue = (total, installments) => {
    return (total / installments).toFixed(2);
  };

  const handleRemoverSessao = (id) => {
    setSessoesAdicionadas(
      sessoesAdicionadas.filter((sessao) => sessao.id !== id)
    );
  };

  const valorTotal = sessoesAdicionadas.reduce(
    (total, sessao) => total + parseFloat(sessao.valor || 0),
    0
  );

  useEffect(() => {
    if (paymentType === "Parcelado" && totalPaid > 0) {
      setInstallmentValue((totalPaid / installments).toFixed(2));
    }
  }, [paymentType, installments, totalPaid]);

  const buscarPalestras = async () => {
    try {
      setLoading(true);
      const response = await buscarPalestraCurso();
      const palestrasFormatadas = cadastrosPalestraCurso(response.data);
      setLista(palestrasFormatadas);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar palestras",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    try {
      setLoading(true);

      if (sessoesAdicionadas.length === 0) {
        CustomToast({
          type: "warning",
          message: "Adicione pelo menos uma sessão de palestra",
        });
        return;
      }

      const primeiraSessao = sessoesAdicionadas[0];

      const statusPagamentoMap = {
        Pendente: 1,
        Andamento: 2,
        Pago: 3,
      };

      const formaPagamentoMap = {
        Dinheiro: 1,
        PIX: 2,
        Débito: 3,
        Crédito: 4,
        Cheque: 5,
      };

      const dadosParaEnvio = {
        nome: nomePalestra,
        tipo_palestra_id:
          tiposPalestra.find((t) => t.nome === selectedLecture)?.id || 1,
        cliente_id: selectedCliente?.id || palestra?.cliente_id,
        endereco: endereco,
        data: primeiraSessao.data,
        horario: primeiraSessao.horario,
        secoes: primeiraSessao.secoes,
        valor: parseFloat(primeiraSessao.valor),
        status_pagamento: statusPagamentoMap[paymentStatus] || 1,
        tipo_pagamento: paymentType === "À vista" ? 1 : 2,
        forma_pagamento: formaPagamentoMap[currentPaymentMethod] || 1,
        qtd_parcelas: paymentType === "Parcelado" ? installments : 1,
        primeira_data_parcela: paymentMethods[0]?.date || primeiraSessao.data,
      };

      const response = await atualizarPalestraCurso(
        dadosParaEnvio,
        palestra.id
      );

      CustomToast({
        type: "success",
        message: "Palestra atualizada com sucesso!",
      });
      buscarPalestras();
      onSave(response);
      onClose();
    } catch (error) {
      CustomToast({
        type: "error",
        message: error.response?.data?.message || "Erro ao atualizar palestra",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarPrestadoresCadastrados();
    buscarTipoPalestraCadastradas();
    carregarClientes();
    buscarPalestras();
  }, []);
  return (
    <div>
      <ModalLateral
        open={open}
        width={{
          xs: "400px",
          lg: "600px",
        }}
        handleClose={onClose}
        tituloModal="Editar Informações"
        icon={<Edit />}
        tamanhoTitulo="75%"
        conteudo={
          <div
            className="w-full flex-col flex items-start gap-3 "
            style={{ maxHeight: "500px", overflow: "auto" }}
          >
            <Box className="flex w-full items-center justify-center">
              <BottomNavigation
                showLabels
                className="w-[95%] flex-wrap"
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
                      label="Nome da Palestra"
                      value={nomePalestra}
                      onChange={(e) => setNomePalestra(e.target.value)}
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
                        option.nome === value.nome
                      }
                      style={{ width: "45%" }}
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
                          xs: "72%",
                          sm: "50%",
                          md: "40%",
                          lg: "95%",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn />
                          </InputAdornment>
                        ),
                      }}
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
                    <div className="w-[50%]">
                      <div className="flex w-[100%] items-center gap-3 flex-wrap">
                        <div className="flex w-[100%] items-center gap-3 flex-wrap">
                          <label className="text-xs ">
                            Informações de Atendimento
                          </label>
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Horário"
                            value={horario}
                            onChange={mascaraHorario}
                            placeholder="HH:MM"
                            sx={{
                              width: {
                                xs: "45%",
                                sm: "50%",
                                md: "40%",
                                lg: "45%",
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <QueryBuilderIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Seções"
                            value={secoes}
                            onChange={(e) => setSecoes(e.target.value)}
                            sx={{
                              width: {
                                xs: "30%",
                                sm: "50%",
                                md: "40%",
                                lg: "48%",
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

                          {/* Campo de Data */}
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Data"
                            type="date"
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            sx={{
                              width: {
                                xs: "51%",
                                sm: "50%",
                                md: "40%",
                                lg: "100%",
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <DateRange />
                                </InputAdornment>
                              ),
                            }}
                          />

                          {/* Seleção de Palestra */}
                          <TextField
                            select
                            fullWidth
                            label="Selecione a Palestra/Curso"
                            value={selectedLecture}
                            onChange={(e) => setSelectedLecture(e.target.value)}
                            sx={{
                              width: {
                                xs: "66%",
                                sm: "50%",
                                md: "40%",
                                lg: "100%",
                              },
                            }}
                            variant="outlined"
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Article />
                                </InputAdornment>
                              ),
                            }}
                          >
                            <MenuItem value="">Selecione</MenuItem>
                            {tiposPalestra.map((tipo) => (
                              <MenuItem key={tipo.id} value={tipo.nome}>
                                {tipo.nome}
                              </MenuItem>
                            ))}
                          </TextField>

                          {/* Campo de Valor */}
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Valor"
                            value={valor}
                            onChange={valorMascara}
                            sx={{
                              width: {
                                xs: "50%",
                                sm: "50%",
                                md: "40%",
                                lg: "48%",
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AttachMoney />
                                </InputAdornment>
                              ),
                            }}
                          />

                          <ButtonComponent
                            startIcon={<AddCircle fontSize="small" />}
                            title={"Adicionar"}
                            subtitle={"Adicionar"}
                            buttonSize="large"
                            onClick={handleAdicionarSessao}
                            disabled={botaoAdicionarDesabilitado}
                          />
                        </div>
                        {sessoesAdicionadas.length > 0 && (
                          <div className="mt-4 w-[100%]">
                            <label className="font-bold text-xs mb-2">
                              Sessões Adicionadas:
                            </label>
                            <div className="space-y-2">
                              {sessoesAdicionadas.map((sessao) => (
                                <div
                                  key={sessao.id}
                                  className="flex flex-col p-3 border rounded bg-gray-50"
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="w-[48%] flex items-center gap-2">
                                      <QueryBuilderIcon fontSize="small" />
                                      <label className="text-xs font-semibold">
                                        {sessao.horario}
                                      </label>
                                    </div>
                                    <div className="w-[48%] flex items-center gap-2">
                                      <DateRange fontSize="small" />
                                      <label className="text-xs font-semibold">
                                        {new Date(
                                          sessao.data
                                        ).toLocaleDateString()}
                                      </label>
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleRemoverSessao(sessao.id)
                                      }
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Close />
                                    </button>
                                  </div>
                                  <div className="w-full mt-2">
                                    <div className="flex items-center gap-1">
                                      <Article fontSize="small" />
                                      <label className="text-xs font-semibold">
                                        {sessao.palestra}
                                      </label>
                                    </div>
                                  </div>

                                  <div className="mt-2  flex gap-2 text-sm">
                                    <div className="w-[48%] flex items-center gap-1">
                                      <Numbers fontSize="small" />
                                      <label className="text-xs font-semibold">
                                        Seções: {sessao.secoes}
                                      </label>
                                    </div>

                                    <div className="w-[48%] flex items-center gap-1">
                                      <AttachMoney fontSize="small" />
                                      <label className="text-xs w-full font-semibold">
                                        R$ {parseFloat(sessao.valor).toFixed(2)}
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-1 flex gap-1 justify-between items-center">
                          <label className=" text-xs font-semibold">
                            Valor Total:
                          </label>
                          <label className="text-xs font-semibold">
                            R$ {valorTotal.toFixed(2)}
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="w-[53%]">
                      <div className="w-full">
                        <h3 className="font-bold text-xs mb-3">
                          Informações de Pagamento
                        </h3>

                        <div className="w-full flex flex-wrap gap-3 w-full">
                          {/* Status do Pagamento */}
                          <TextField
                            select
                            fullWidth
                            label="Status do Pagamento"
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                            sx={{ width: { xs: "100%", lg: "47%" } }}
                            variant="outlined"
                            size="small"
                          >
                            <MenuItem value="Pendente">Pendente</MenuItem>
                            <MenuItem value="Andamento">Andamento</MenuItem>
                            <MenuItem value="Pago">Pago</MenuItem>
                          </TextField>

                          {/* Tipo de Pagamento */}
                          <TextField
                            select
                            fullWidth
                            label="Tipo de Pagamento"
                            value={paymentType}
                            onChange={(e) => setPaymentType(e.target.value)}
                            sx={{ width: { xs: "100%", lg: "47%" } }}
                            variant="outlined"
                            size="small"
                          >
                            <MenuItem value="À vista">À vista</MenuItem>
                            <MenuItem value="Parcelado">Parcelado</MenuItem>
                          </TextField>

                          {/* Se for parcelado, mostrar campos de parcelamento */}
                          {paymentType === "Parcelado" && (
                            <>
                              <TextField
                                fullWidth
                                type="number"
                                label="Nº Parcelas"
                                value={installments}
                                onChange={(e) =>
                                  setInstallments(e.target.value)
                                }
                                sx={{ width: { xs: "48%", lg: "47%" } }}
                                variant="outlined"
                                size="small"
                                inputProps={{ min: 1, max: 12 }}
                              />
                            </>
                          )}
                        </div>

                        <div className="mt-4 w-full">
                          <label className="font-bold text-xs mb-4">
                            Formas de Pagamento:
                          </label>
                          <div className="flex flex-wrap gap-3 items-end mt-3">
                            <TextField
                              select
                              fullWidth
                              label="Forma de Pagamento"
                              value={currentPaymentMethod}
                              onChange={(e) =>
                                setCurrentPaymentMethod(e.target.value)
                              }
                              sx={{ width: { xs: "40%", lg: "47%" } }}
                              variant="outlined"
                              size="small"
                            >
                              <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                              <MenuItem value="PIX">PIX</MenuItem>
                              <MenuItem value="Débito">
                                Cartão de Débito
                              </MenuItem>
                              <MenuItem value="Crédito">
                                Cartão de Crédito
                              </MenuItem>
                              <MenuItem value="Cheque">Cheque</MenuItem>
                            </TextField>

                            <TextField
                              fullWidth
                              label="Valor"
                              value={currentPaymentValue}
                              onChange={(e) =>
                                setCurrentPaymentValue(
                                  e.target.value.replace(/[^0-9.]/g, "")
                                )
                              }
                              sx={{ width: { xs: "40%", lg: "47%" } }}
                              variant="outlined"
                              size="small"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney />
                                  </InputAdornment>
                                ),
                              }}
                            />

                            <TextField
                              fullWidth
                              label="Data do Pagamento"
                              type="date"
                              value={currentPaymentDate || ""}
                              onChange={(e) =>
                                setCurrentPaymentDate(e.target.value)
                              }
                              sx={{ width: { xs: "40%", lg: "100%" } }}
                              variant="outlined"
                              size="small"
                              InputLabelProps={{
                                shrink: true,
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <DateRange />
                                  </InputAdornment>
                                ),
                              }}
                            />

                            <div className="flex justify-end w-full">
                              <ButtonComponent
                                startIcon={<AddCircle fontSize="small" />}
                                title={"Adicionar"}
                                subtitle={"Adicionar"}
                                buttonSize="large"
                                onClick={adicionarPagamento}
                                sx={{ width: { xs: "30%", lg: "20%" } }}
                              />
                            </div>
                          </div>

                          {paymentMethods.length > 0 && (
                            <div className="mt-3 w-full">
                              <div className="space-y-2">
                                {paymentMethods.map((payment, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-2 border rounded"
                                  >
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <MonetizationOn fontSize="small" />
                                        <label className="text-xs">
                                          {payment.method}
                                        </label>
                                        <label className="text-xs">
                                          R${" "}
                                          {parseFloat(payment.value).toFixed(2)}
                                        </label>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <DateRange fontSize="small" />
                                        <span className="text-xs ">
                                          {payment.date
                                            ? new Date(
                                                payment.date
                                              ).toLocaleDateString()
                                            : "Sem data"}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => removerPagamento(index)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Close fontSize="small" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-3 flex justify-between items-center">
                                <span className="text-xs font-bold">
                                  Valor Total
                                </span>
                                <span className="text-xs font-bold">
                                  R$ {totalPaid.toFixed(2)}
                                </span>
                              </div>

                              {paymentType === "Parcelado" && (
                                <div className="mt-2 flex justify-between items-center">
                                  <span className="text-xs font-semibold">
                                    Parcelas:
                                  </span>
                                  <span className="text-xs">
                                    {installments}x de R${" "}
                                    {(totalPaid / installments).toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
            <div className="flex justify-end w-[95%] mt-4 gap-3">
              <ButtonComponent
                startIcon={<Save fontSize="small" />}
                title={"Salvar"}
                subtitle={"Salvar"}
                buttonSize="large"
                onClick={handleSalvar}
                loading={loading}
                sx={{ backgroundColor: "#9D4B5B", color: "white" }}
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default EditarPalestra;
