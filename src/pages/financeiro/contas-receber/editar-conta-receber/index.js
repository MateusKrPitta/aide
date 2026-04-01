import React, { useEffect, useState } from "react";
import ButtonComponent from "../../../../components/button";
import TransformIcon from "@mui/icons-material/Transform";
import ModalLateral from "../../../../components/modal-lateral";
import {
  Article,
  Category,
  DateRange,
  Edit,
  InfoRounded,
  MonetizationOn,
  Numbers,
  Save,
  TableChart,
} from "@mui/icons-material";
import {
  Checkbox,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import CustomToast from "../../../../components/toast";
import { atualizarContasReceber } from "../../../../service/put/contas-receber";
import { buscarContasReceberId } from "../../../../service/get/contas-receber-id";
import { atualizarParcelaContasReceber } from "../../../../service/put/contas-receber-parcela";

const EditarContaREceber = ({
  informacoes,
  handleClosInformacoes,
  contaSelecionada,
  categoriasCadastradas,
  onUpdateSuccess,
}) => {
  const [tipoCusto, setTipoCusto] = useState("fixo");
  const [loading, setLoading] = useState(false);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const [editandoParcela, setEditandoParcela] = useState(false);
  const [parcelaSelecionada, setParcelaSelecionada] = useState(null);

  const [nome, setNome] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [quantidadeParcelas, setQuantidadeParcelas] = useState("");
  const [valorMensal, setValorMensal] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [detalhesConta, setDetalhesConta] = useState(null);

  const [parcelaDataVencimento, setParcelaDataVencimento] = useState("");
  const [parcelaStatusPagamento, setParcelaStatusPagamento] = useState("");
  const [parcelaValor, setParcelaValor] = useState("");
  const [parcelaFormaPagamento, setParcelaFormaPagamento] = useState("");

  const buscarDetalhesConta = async (id) => {
    if (!id) return;

    try {
      setCarregandoDetalhes(true);

      const response = await buscarContasReceberId(id);

      if (response) {
        const dadosConta = response.data || response;

        setDetalhesConta(dadosConta);
        preencherFormulario(dadosConta);
      } else {
        console.error("Resposta vazia da API");
        CustomToast({
          type: "error",
          message: "Não foi possível carregar os detalhes da conta",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes da conta:", error);
      CustomToast({
        type: "error",
        message: "Erro ao carregar detalhes da conta",
      });
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  const preencherFormulario = (conta) => {
    setNome(conta.nome || "");

    setCategoriaId(conta.categoria_id || "");

    const dataOriginal = conta.data_inicio || conta.data;
    let dataParaInput = "";

    if (dataOriginal) {
      if (dataOriginal.includes("T")) {
        dataParaInput = dataOriginal.split("T")[0];
      } else if (dataOriginal.includes("/")) {
        const partes = dataOriginal.split("/");
        if (partes.length === 3) {
          dataParaInput = `${partes[2]}-${partes[1]}-${partes[0]}`;
        } else {
          dataParaInput = dataOriginal;
        }
      } else {
        try {
          const dataObj = new Date(dataOriginal);
          if (!isNaN(dataObj.getTime())) {
            dataParaInput = dataObj.toISOString().split("T")[0];
          }
        } catch (e) {
          console.error("Erro ao converter data:", e);
        }
      }
    }

    setDataInicio(dataParaInput);

    if (conta.custo_fixo === true) {
      setTipoCusto("fixo");
      setQuantidadeParcelas(conta.quantidade_parcelas?.toString() || "0");
      const valorMensalNum = conta.valor_mensal
        ? parseFloat(conta.valor_mensal.replace(",", "."))
        : 0;
      setValorMensal(valorMensalNum.toString());
      setValorTotal("");
    } else if (conta.custo_variavel === true || conta.valor_total) {
      setTipoCusto("variavel");
      const valorTotalNum = conta.valor_total
        ? parseFloat(conta.valor_total.replace(",", "."))
        : 0;
      setValorTotal(valorTotalNum.toString());
      setQuantidadeParcelas("");
      setValorMensal("");
    }

    setFormaPagamento(conta.forma_pagamento?.toString() || "2");
  };

  const formatarData = (dataString) => {
    if (!dataString) return "";
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString("pt-BR");
    } catch (error) {
      return dataString;
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      1: "Pendente",
      2: "Pago",
      3: "Atrasado",
      4: "Cancelado",
    };
    return statusMap[status] || "Desconhecido";
  };

  const getStatusColor = (status) => {
    const colorMap = {
      1: "warning",
      2: "success",
      3: "error",
      4: "default",
    };
    return colorMap[status] || "default";
  };

  const abrirEdicaoParcela = (parcela) => {
    setParcelaSelecionada(parcela);

    let dataVencimentoFormatada = "";
    if (parcela.data_vencimento) {
      if (parcela.data_vencimento.includes("T")) {
        dataVencimentoFormatada = parcela.data_vencimento.split("T")[0];
      } else {
        const dataObj = new Date(parcela.data_vencimento);
        if (!isNaN(dataObj.getTime())) {
          dataVencimentoFormatada = dataObj.toISOString().split("T")[0];
        }
      }
    }

    setParcelaDataVencimento(dataVencimentoFormatada);
    setParcelaStatusPagamento(parcela.status_pagamento?.toString() || "1");
    setParcelaValor(parcela.valor?.toString() || "");
    setParcelaFormaPagamento(parcela.forma_pagamento?.toString() || "2");
    setEditandoParcela(true);
  };

  const salvarEdicaoParcela = async () => {
    try {
      if (!parcelaSelecionada) return;

      const dadosAtualizacao = {
        data_vencimento: parcelaDataVencimento,
        status_pagamento: parseInt(parcelaStatusPagamento),
        valor: parseFloat(parcelaValor),
        forma_pagamento: parcelaFormaPagamento,
      };

      const response = await atualizarParcelaContasReceber(
        parcelaSelecionada.id,
        dadosAtualizacao,
      );

      if (response.success) {
        CustomToast({
          type: "success",
          message: "Parcela atualizada com sucesso!",
        });

        await buscarDetalhesConta(contaSelecionada.id);

        setEditandoParcela(false);
        setParcelaSelecionada(null);

        if (onUpdateSuccess) {
          await onUpdateSuccess();
        }
      } else {
        throw new Error(response.error || "Erro ao atualizar parcela");
      }
    } catch (error) {
      console.error("Erro ao atualizar parcela:", error);
      CustomToast({
        type: "error",
        message: error.message || "Erro ao atualizar parcela",
      });
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      if (!nome || !categoriaId || !dataInicio || !formaPagamento) {
        CustomToast({
          type: "error",
          message: "Preencha todos os campos obrigatórios",
        });
        return;
      }

      if (tipoCusto === "fixo" && (!quantidadeParcelas || !valorMensal)) {
        CustomToast({
          type: "error",
          message:
            "Para custo fixo, preencha quantidade de parcelas e valor mensal",
        });
        return;
      }

      if (tipoCusto === "variavel" && !valorTotal) {
        CustomToast({
          type: "error",
          message: "Para custo variável, preencha o valor total",
        });
        return;
      }

      const dadosParaEnvio = {
        nome,
        categoria_id: parseInt(categoriaId),
        data_inicio: dataInicio,
        forma_pagamento: formaPagamento,
      };

      if (tipoCusto === "fixo") {
        dadosParaEnvio.custo_fixo = true;
        dadosParaEnvio.custo_variavel = false;
        dadosParaEnvio.quantidade_parcelas = parseInt(quantidadeParcelas);
        dadosParaEnvio.valor_mensal = parseFloat(valorMensal);
        dadosParaEnvio.valor_total =
          parseFloat(valorMensal) * parseInt(quantidadeParcelas);
      } else {
        dadosParaEnvio.custo_fixo = false;
        dadosParaEnvio.custo_variavel = true;
        dadosParaEnvio.valor_total = parseFloat(valorTotal);
        dadosParaEnvio.quantidade_parcelas = 1;
        dadosParaEnvio.valor_mensal = parseFloat(valorTotal);
      }

      await atualizarContasReceber(dadosParaEnvio, contaSelecionada.id);

      CustomToast({
        type: "success",
        message: "Conta atualizada com sucesso!",
      });

      buscarDetalhesConta(contaSelecionada.id);

      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error) {
      console.error("Erro ao atualizar conta:", error);
      CustomToast({
        type: "error",
        message: error.message || "Erro ao atualizar conta",
      });
    } finally {
      setLoading(false);
    }
  };

  const validarCampos = () => {
    const camposObrigatorios =
      nome && categoriaId && dataInicio && formaPagamento;

    if (tipoCusto === "fixo") {
      return camposObrigatorios && quantidadeParcelas && valorMensal;
    }

    if (tipoCusto === "variavel") {
      return camposObrigatorios && valorTotal;
    }

    return false;
  };

  useEffect(() => {
    if (informacoes && contaSelecionada && contaSelecionada.id) {
      buscarDetalhesConta(contaSelecionada.id);
    } else {
      resetarFormulario();
    }
  }, [informacoes, contaSelecionada]);

  const resetarFormulario = () => {
    setNome("");
    setCategoriaId("");
    setDataInicio("");
    setQuantidadeParcelas("");
    setValorMensal("");
    setValorTotal("");
    setFormaPagamento("");
    setTipoCusto("fixo");
    setDetalhesConta(null);
  };

  return (
    <div>
      <ModalLateral
        open={informacoes}
        width={"700px"}
        handleClose={() => {
          resetarFormulario();
          handleClosInformacoes();
        }}
        tituloModal={`Editar Conta - ${detalhesConta?.nome || "Carregando..."}`}
        icon={<InfoRounded />}
        tamanhoTitulo="75%"
        conteudo={
          <div className="flex flex-wrap w-full items-center gap-4">
            {carregandoDetalhes ? (
              <div className="w-full flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Carregando detalhes da conta...</span>
              </div>
            ) : (
              <>
                {/* Formulário Principal */}
                <div className="flex gap-3 flex-wrap">
                  <div className="flex gap-4 w-full mb-4">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={tipoCusto === "fixo"}
                          onChange={() => setTipoCusto("fixo")}
                          color="primary"
                          disabled={loading}
                        />
                      }
                      label="Custo Fixo"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={tipoCusto === "variavel"}
                          onChange={() => setTipoCusto("variavel")}
                          color="primary"
                          disabled={loading}
                        />
                      }
                      label="Custo Variável"
                    />
                  </div>

                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    label="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
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
                          <Article />
                        </InputAdornment>
                      ),
                    }}
                    disabled={loading}
                  />

                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    size="small"
                    label="Categoria"
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
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
                          <Category />
                        </InputAdornment>
                      ),
                    }}
                    disabled={loading}
                  >
                    <MenuItem value="">Selecione uma categoria</MenuItem>
                    {categoriasCadastradas.map((categoria) => (
                      <MenuItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </MenuItem>
                    ))}
                  </TextField>

                  {tipoCusto === "fixo" ? (
                    <>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Data Início"
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        InputLabelProps={{ shrink: true }}
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
                              <DateRange />
                            </InputAdornment>
                          ),
                        }}
                        disabled={loading}
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        disabled
                        size="small"
                        type="number"
                        label="Nº Parcelas"
                        value={quantidadeParcelas}
                        onChange={(e) => setQuantidadeParcelas(e.target.value)}
                        sx={{
                          width: {
                            xs: "48%",
                            sm: "50%",
                            md: "40%",
                            lg: "50%",
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
                        disabled
                        variant="outlined"
                        size="small"
                        label="Valor Mensal"
                        value={valorMensal}
                        onChange={(e) => setValorMensal(e.target.value)}
                        type="number"
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
                              <MonetizationOn />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Data Pagamento"
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        InputLabelProps={{ shrink: true }}
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
                              <DateRange />
                            </InputAdornment>
                          ),
                        }}
                        disabled={loading}
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        disabled
                        label="Valor Total"
                        value={valorTotal}
                        onChange={(e) => setValorTotal(e.target.value)}
                        type="number"
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
                              <MonetizationOn />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </>
                  )}

                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    size="small"
                    label="Forma de Pagamento"
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
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
                          <TransformIcon />
                        </InputAdornment>
                      ),
                    }}
                    disabled={loading}
                  >
                    <MenuItem value="1">Crédito</MenuItem>
                    <MenuItem value="2">Débito</MenuItem>
                    <MenuItem value="3">Cheque</MenuItem>
                    <MenuItem value="4">Pix</MenuItem>
                    <MenuItem value="5">Dinheiro</MenuItem>
                  </TextField>
                </div>

                {/* Botão Salvar Conta */}
                <div className="flex w-[100%] items-end justify-end  gap-2 ">
                  <ButtonComponent
                    startIcon={<Save fontSize="small" />}
                    title={"Salvar"}
                    subtitle={"Salvar"}
                    buttonSize="large"
                    onClick={handleUpdate}
                    disabled={!validarCampos() || loading || carregandoDetalhes}
                  />
                </div>

                {/* Seção de Parcelas */}
                {detalhesConta?.parcelas &&
                  detalhesConta.parcelas.length > 0 && (
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-3 text-primary">
                        <TableChart />
                        <h3 className="text-lg font-semibold">Parcelas</h3>
                      </div>

                      <TableContainer component={Paper} className="mb-4">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Descrição</TableCell>
                              <TableCell>Vencimento</TableCell>
                              <TableCell>Valor</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Pagamento</TableCell>
                              <TableCell>Ações</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {detalhesConta.parcelas.map((parcela) => (
                              <TableRow key={parcela.id}>
                                <TableCell>{parcela.descricao}</TableCell>
                                <TableCell>
                                  {formatarData(parcela.data_vencimento)}
                                </TableCell>
                                <TableCell>
                                  R$ {parseFloat(parcela.valor || 0).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={getStatusLabel(
                                      parcela.status_pagamento,
                                      parcela.data_pagamento,
                                    )}
                                    color={getStatusColor(
                                      parcela.status_pagamento,
                                      parcela.data_pagamento,
                                    )}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {parcela.status_pagamento === 2 &&
                                  !parcela.data_pagamento
                                    ? "Pago "
                                    : parcela.data_pagamento
                                      ? formatarData(parcela.data_pagamento)
                                      : "Não pago"}
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    size="small"
                                    onClick={() => abrirEdicaoParcela(parcela)}
                                    title="Editar parcela"
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  )}
              </>
            )}
          </div>
        }
      />

      {/* Modal de Edição de Parcela */}
      <Dialog
        open={editandoParcela}
        onClose={() => setEditandoParcela(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Editar Parcela - {parcelaSelecionada?.descricao}
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-2">
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label="Data de Vencimento"
              type="date"
              value={parcelaDataVencimento}
              onChange={(e) => setParcelaDataVencimento(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateRange fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label="Valor"
              value={parcelaValor}
              onChange={(e) => setParcelaValor(e.target.value)}
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MonetizationOn fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              label="Status do Pagamento"
              value={parcelaStatusPagamento}
              onChange={(e) => setParcelaStatusPagamento(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InfoRounded fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="1">Pendente</MenuItem>
              <MenuItem value="2">Pago</MenuItem>
              <MenuItem value="3">Atrasado</MenuItem>
              <MenuItem value="4">Cancelado</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              label="Forma de Pagamento"
              value={parcelaFormaPagamento}
              onChange={(e) => setParcelaFormaPagamento(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TransformIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="1">Crédito</MenuItem>
              <MenuItem value="2">Débito</MenuItem>
              <MenuItem value="3">Cheque</MenuItem>
              <MenuItem value="4">Pix</MenuItem>
              <MenuItem value="5">Dinheiro</MenuItem>
            </TextField>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditandoParcela(false)}>Cancelar</Button>
          <Button
            onClick={salvarEdicaoParcela}
            variant="contained"
            color="primary"
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EditarContaREceber;
