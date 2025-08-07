import React, { useEffect, useState } from "react";
import ButtonComponent from "../../../components/button";
import {
  AddCircle,
  AddCircleOutline,
  AddCircleOutlineOutlined,
  Article,
  AttachMoney,
  Close,
  DateRange,
  LocationOn,
  MonetizationOn,
  Numbers,
  Person,
  Work,
} from "@mui/icons-material";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import CustomToast from "../../../components/toast";
import { buscarClientes } from "../../../service/get/clientes";
import { listarTiposPalestra } from "../../../service/get/tipo-palestra";
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
import { criarPalestraCurso } from "../../../service/post/palestras-cursos";
import { buscarPalestraCurso } from "../../../service/get/palestra-curso";
import { cadastrosPalestraCurso } from "../../../entities/class/palestra-cursos";

const CadastrarPalestra = ({ onSuccess }) => {
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
  const [cadastro, setCadastro] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [currentPaymentDate, setCurrentPaymentDate] = useState("");
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
  const [endereco, setEndereco] = useState("");
  const [nomePalestra, setNomePalestra] = useState("");
  const [pagamentoError, setPagamentoError] = useState("");
  const [lista, setLista] = useState([]);

  const tiposPalestraAtivas = tiposPalestra.filter((tipo) => tipo.ativo);

  const validarCamposCadastro = () => {
    return (
      nomePalestra.trim() !== "" &&
      selectedCliente.length > 0 !== "" &&
      endereco.trim() !== ""
    );
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const FecharCadastro = () => {
    setCadastro(false);
    limparEstados();
  };

  const validarHorario = (time) => {
    if (!time) {
      return { valido: false, mensagem: "Horário é obrigatório" };
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return { valido: false, mensagem: "Horário inválido" };
    }

    return { valido: true, mensagem: "" };
  };

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

  const handleAdicionarSessao = () => {
    const validacaoHorario = validarHorario(horario);
    if (!validacaoHorario.valido) {
      CustomToast({
        type: "error",
        message: validacaoHorario.mensagem,
      });
      return;
    }

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

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const valorMascara = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    if (!isNaN(parseFloat(value)) || value === "") {
      setValor(value);
    }
  };

  const validarPagamento = () => {
    const valorTotal = sessoesAdicionadas.reduce(
      (total, sessao) => total + parseFloat(sessao.valor || 0),
      0
    );

    if (paymentMethods.length === 0) {
      CustomToast({
        type: "warning",
        message: "Adicione pelo menos uma forma de pagamento",
      });
      return false;
    }

    const totalPago = paymentMethods.reduce(
      (sum, payment) => sum + parseFloat(payment.value || 0),
      0
    );

    if (Math.abs(totalPago - valorTotal) > 0.01) {
      CustomToast({
        type: "warning",
        message: `O valor total pago (R$ ${totalPago.toFixed(
          2
        )}) não corresponde ao valor da palestra (R$ ${valorTotal.toFixed(2)})`,
      });
      setPagamentoError();
      return false;
    }

    setPagamentoError("");
    return true;
  };

  const adicionarPagamento = () => {
    if (!currentPaymentValue || parseFloat(currentPaymentValue) <= 0) {
      CustomToast({
        type: "warning",
        message: "Informe um valor válido para o pagamento",
      });
      return;
    }

    if (paymentMethods.length > 0) {
      CustomToast({
        type: "warning",
        message: "Apenas uma forma de pagamento é permitida",
      });
      return;
    }

    const newPayment = {
      method: currentPaymentMethod,
      value: parseFloat(currentPaymentValue),
      date: currentPaymentDate,
    };

    setPaymentMethods([newPayment]);
    setTotalPaid(parseFloat(currentPaymentValue));
    setCurrentPaymentValue("");
    setCurrentPaymentDate("");
  };

  const removerPagamento = (index) => {
    const updatedPayments = [...paymentMethods];
    const removedValue = updatedPayments[index].value;
    updatedPayments.splice(index, 1);
    setPaymentMethods(updatedPayments);
    setTotalPaid(totalPaid - removedValue);
  };
  const calculateInstallmentValue = (total, installments) => {
    return Math.floor(total / installments);
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

  const CadastrarPalestraCurso = async () => {
    if (!selectedCliente || !nomePalestra || sessoesAdicionadas.length === 0) {
      CustomToast({
        type: "error",
        message: "Preencha todos os campos obrigatórios",
      });
      return;
    }
    if (!validarPagamento()) {
      return;
    }
    if (nomePalestra.length > 100) {
      CustomToast({
        type: "warning",
        message: "O nome da palestra deve ter no máximo 100 caracteres",
      });
      return;
    }

    const primeiraSessao = sessoesAdicionadas[0];
    if (!primeiraSessao) {
      CustomToast({
        type: "warning",
        message: "Adicione pelo menos uma sessão",
      });
      return;
    }

    try {
      setLoading(true);

      const tipoPalestra = tiposPalestra.find(
        (t) => t.nome === primeiraSessao.palestra
      );
      if (!tipoPalestra) {
        throw new Error("Tipo de palestra não encontrado");
      }

      const dadosEnvio = {
        nome: nomePalestra.substring(0, 100),
        tipo_palestra_id: tipoPalestra.id,
        cliente_id: selectedCliente.id,
        endereco: endereco.substring(0, 255),
        data: primeiraSessao.data,
        horario: primeiraSessao.horario,
        valor_parcela:
          paymentType === "Parcelado"
            ? Number((valorTotal / installments).toFixed(2))
            : null,
        valor: Number(valorTotal.toFixed(2)),
        secoes: primeiraSessao.secoes
          ? parseInt(primeiraSessao.secoes, 10)
          : null,
        status_pagamento: paymentStatus === "Pago" ? 1 : 2,
        tipo_pagamento: paymentType === "À vista" ? 1 : 2,
        forma_pagamento:
          currentPaymentMethod === "Dinheiro"
            ? 1
            : currentPaymentMethod === "PIX"
            ? 2
            : currentPaymentMethod === "Débito"
            ? 3
            : currentPaymentMethod === "Crédito"
            ? 4
            : 5,
        qtd_parcelas:
          paymentType === "Parcelado" ? parseInt(installments, 10) : null,
        primeira_data_parcela:
          paymentType === "Parcelado" ? currentPaymentDate : null,
      };
      if (!dadosEnvio.data) {
        throw new Error("Data é obrigatória");
      }

      if (isNaN(dadosEnvio.valor) || dadosEnvio.valor <= 0) {
        throw new Error("Valor inválido");
      }

      const response = await criarPalestraCurso(dadosEnvio);

      if (response.success === false) {
        throw new Error(response.message || "Erro ao cadastrar palestra");
      }

      CustomToast({
        type: "success",
        message: "Palestra/Curso cadastrado com sucesso!",
      });
      buscarPalestras();
      FecharCadastro();
      limparEstados();
      onSuccess();
    } catch (error) {
      console.error("Erro ao cadastrar palestra:", error);
      CustomToast({
        type: "error",
        message: error.message || "Erro ao cadastrar palestra/curso",
      });
    } finally {
      setLoading(false);
    }
  };

  const limparEstados = () => {
    setSelectedCliente(null);
    setNomePalestra("");
    setEndereco("");
    setSessoesAdicionadas([]);
    setSelectedLecture("");
    setHorario("");
    setData("");
    setValor("");
    setSecoes("");
    setPaymentMethods([]);
    setTotalPaid(0);
    setCurrentPaymentMethod("Dinheiro");
    setPaymentType("À vista");
    setPaymentStatus("Pendente");
    setInstallments(1);
  };

  useEffect(() => {
    buscarTipoPalestraCadastradas();
    carregarClientes();
    buscarPalestras();
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
        title="Cadastrar Palestra ou Curso"
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
                      label="Nome da Palestra"
                      autoComplete="off"
                      value={nomePalestra}
                      onChange={(e) => setNomePalestra(e.target.value)}
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
                      options={clientes.filter(cliente => cliente.ativo)}
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
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Endereço"
                      autoComplete="off"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
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
                          {/* Campo de Horário com máscara */}
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
                                lg: "48%",
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
                                lg: "48%",
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
                                lg: "25%",
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
                                lg: "70%",
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
                            {tiposPalestraAtivas.map((tipo) => (
                              <MenuItem key={tipo.id} value={tipo.nome}>
                                {tipo.nome}
                              </MenuItem>
                            ))}
                          </TextField>

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
                                lg: "30%",
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
                          <div className="mt-4 w-[95%]">
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

                                  <div className="mt-2 grid flex grid-cols-3 gap-2 text-sm">
                                    <div className="w-[48%] flex items-center gap-1">
                                      <Numbers fontSize="small" />
                                      <label className="text-xs font-semibold">
                                        Seções: {sessao.secoes}
                                      </label>
                                    </div>

                                    <div className="w-[48%] flex items-center gap-1">
                                      <AttachMoney fontSize="small" />
                                      <label className="text-xs w-full font-semibold">
                                        R$
                                        {parseFloat(sessao.valor).toFixed(2)}
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-1 flex justify-between items-center">
                          <label className="font-semibold">Valor Total:</label>
                          <label className="font-semibold">
                            R$ {valorTotal.toFixed(2)}
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="w-[45%]">
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
                            <MenuItem value="Pago">Pago</MenuItem>
                            <MenuItem value="Pendente">Pendente</MenuItem>
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
                              sx={{ width: { xs: "40%", lg: "50%" } }}
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

                          {/* Lista de pagamentos adicionados */}
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
                                        <span className="font-medium">
                                          {payment.method}
                                        </span>
                                        <span className="ml-2 text-gray-600">
                                          R${" "}
                                          {parseFloat(payment.value).toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <DateRange fontSize="small" />
                                        <span className="text-xs text-gray-500">
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
                                      <Close />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-3 flex justify-between items-center">
                                <span className="font-bold">Valor Total </span>
                                <span className="font-bold">
                                  R$ {totalPaid.toFixed(2)}
                                </span>
                              </div>

                              {selectedLectures.length > 0 && (
                                <div className="mt-1 flex justify-between items-center">
                                  <span>Valor Total:</span>
                                  <span>
                                    R${" "}
                                    {selectedLectures
                                      .reduce(
                                        (sum, lecture) =>
                                          sum + parseFloat(lecture.price || 0),
                                        0
                                      )
                                      .toFixed(2)}
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
              disabled={!validarCamposCadastro() || loading}
              buttonSize="medium"
              onClick={CadastrarPalestraCurso}
            />
          )}
        </div>
      </CentralModal>
    </div>
  );
};

export default CadastrarPalestra;
