import React, { useState } from "react";
import ModalLateral from "../../../../components/modal-lateral";
import { Article } from "@mui/icons-material";
import TransformIcon from "@mui/icons-material/Transform";
import { DateRange, MonetizationOn, Money, Save } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import CustomToast from "../../../../components/toast";
import { atualizarParcelaContasReceber } from "../../../../service/put/contas-receber-parcela";
import { atualizarStatusPagParcela } from "../../../../service/put/relatorio-palestra-cursos";
import { atualizarStatusPagamento } from "../../../../service/put/status-pagamento-prestador";

const ParcelasContasReceber = ({
  parcelas,
  handleClosParcelas,
  contaSelecionada,
  setContaSelecionada,
  parcelasEditando,
  setParcelasEditando,
  loadingParcelas,
  setLoadingParcelas,
  onClose,
}) => {
  const handleParcelaChange = (parcelaId, campo, valor) => {
    setParcelasEditando((prev) => ({
      ...prev,
      [parcelaId]: {
        ...(prev[parcelaId] || {}),
        [campo]: valor,
      },
    }));
  };

  const handleStatusChange = async (parcelaId, newValue) => {
    try {
      setLoadingParcelas((prev) => ({ ...prev, [parcelaId]: true }));

      const isPalestra = contaSelecionada?.tipoOrigem === "Palestra/Curso";
      const isPrestador = contaSelecionada?.tipoOrigem === "Prestador";

      setContaSelecionada((prev) => ({
        ...prev,
        parcelas: prev.parcelas.map((p) => {
          if (p.id === parcelaId) {
            if (isPrestador) {
              return { ...p, status_pagamento_comissao: newValue.toString() };
            } else {
              return {
                ...p,
                status_pagamento: newValue.toString(),
                ...(isPalestra && newValue === 2
                  ? {
                      data_pagamento: new Date().toISOString(),
                    }
                  : {}),
              };
            }
          }
          return p;
        }),
      }));

      if (isPalestra) {
        await atualizarStatusPagParcela(parcelaId, newValue);
      } else if (isPrestador) {
        await atualizarStatusPagamento(parcelaId, "comissao", newValue);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      CustomToast({
        type: "error",
        message: error.message || "Erro ao atualizar status",
      });

      setContaSelecionada((prev) => ({
        ...prev,
        parcelas: prev.parcelas.map((p) => {
          if (p.id === parcelaId) {
            if (isPrestador) {
              return {
                ...p,
                status_pagamento_comissao: p.status_pagamento_comissao,
              };
            } else {
              return { ...p, status_pagamento: p.status_pagamento };
            }
          }
          return p;
        }),
      }));
    } finally {
      setLoadingParcelas((prev) => ({ ...prev, [parcelaId]: false }));
    }
  };

  const handleUpdateParcela = async (parcelaId) => {
    try {
      setLoadingParcelas((prev) => ({ ...prev, [parcelaId]: true }));

      const dadosEditados = parcelasEditando[parcelaId];
      const parcelaOriginal = contaSelecionada.parcelas.find(
        (p) => p.id === parcelaId
      );

      const dadosParaEnvio = {
        data_vencimento:
          dadosEditados?.data_vencimento ||
          parcelaOriginal.data_vencimento.split("T")[0],
        status_pagamento:
          dadosEditados?.status_pagamento || parcelaOriginal.status_pagamento,
        data_pagamento:
          dadosEditados?.data_pagamento ||
          (dadosEditados?.status_pagamento === 1
            ? new Date().toISOString().split("T")[0]
            : null),
        forma_pagamento:
          dadosEditados?.forma_pagamento || parcelaOriginal.forma_pagamento,
        valor: dadosEditados?.valor || parcelaOriginal.valor,
      };

      let response;
      const isPalestra = contaSelecionada.tipoOrigem === "Palestra/Curso";
      const isPrestador = contaSelecionada.tipoOrigem === "Prestador";

      if (isPalestra) {
        response = await atualizarStatusPagParcela(
          parcelaId,
          dadosParaEnvio.status_pagamento
        );
      } else if (isPrestador) {
        response = await atualizarStatusPagamento(
          parcelaId,
          "comissao",
          dadosParaEnvio.status_pagamento
        );
      } else {
        response = await atualizarParcelaContasReceber(
          parcelaId,
          dadosParaEnvio
        );
      }
      setContaSelecionada((prev) => ({
        ...prev,
        parcelas: prev.parcelas.map((p) =>
          p.id === parcelaId
            ? {
                ...p,
                ...dadosParaEnvio,
                data_vencimento: dadosParaEnvio.data_vencimento
                  ? `${dadosParaEnvio.data_vencimento}T00:00:00.000Z`
                  : p.data_vencimento,
                data_pagamento: dadosParaEnvio.data_pagamento
                  ? `${dadosParaEnvio.data_pagamento}T00:00:00.000Z`
                  : p.data_pagamento,
                updated_at: new Date().toISOString(),
              }
            : p
        ),
      }));

      setParcelasEditando((prev) => {
        const newState = { ...prev };
        delete newState[parcelaId];
        return newState;
      });

      CustomToast({
        type: "success",
        message: "Parcela atualizada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar parcela:", error);
      CustomToast({
        type: "error",
        message: error.message || "Erro ao atualizar parcela",
      });
    } finally {
      setLoadingParcelas((prev) => ({ ...prev, [parcelaId]: false }));
    }
  };
  const formatarValor = (valor) => {
    if (valor === undefined || valor === null) return "R$ 0,00";

    if (typeof valor === "string" && valor.includes("R$")) {
      return valor;
    }
    let numero;
    if (typeof valor === "string") {
      const cleanedValue = valor.replace(/[^\d.,]/g, "");

      if (cleanedValue.includes(",") || cleanedValue.includes(".")) {
        if (
          cleanedValue.split(",").length === 2 ||
          cleanedValue.split(".").length === 2
        ) {
          numero = parseFloat(cleanedValue.replace(",", "."));
        } else {
          const parts = cleanedValue.split(/[,.]/);
          const integerPart = parts.slice(0, -1).join("");
          const decimalPart = parts[parts.length - 1];
          numero = parseFloat(`${integerPart}.${decimalPart}`);
        }
      } else {
        numero = parseFloat(cleanedValue);
      }
    } else {
      numero = Number(valor);
    }

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(isNaN(numero) ? 0 : numero);
  };

  const formasPagamento = [
    { value: "1", label: "Dinheiro" },
    { value: "2", label: "Pix" },
    { value: "3", label: "Débito" },
    { value: "4", label: "Crédito" },
    { value: "5", label: "Cheque" },
  ];

  const getFormaPagamentoLabel = (value) => {
    const forma = formasPagamento.find((f) => f.value === value);
    return forma ? forma.label : "Desconhecido";
  };

  const isPalestra = contaSelecionada?.tipoOrigem === "Palestra/Curso";
  const isPrestador = contaSelecionada?.tipoOrigem === "Prestador";

  const handleClose = () => {
    handleClosParcelas();
    setParcelasEditando({});
    if (onClose) {
      onClose();
    }
  };

  return (
    <div>
      <ModalLateral
        open={parcelas}
        handleClose={handleClose}
        tituloModal={`Parcelas - ${contaSelecionada?.nome || ""}`}
        icon={<Article />}
        tamanhoTitulo="75%"
        conteudo={
          <div
            className="flex flex-col gap-4 w-full"
            style={{ maxHeight: "500px", overflow: "auto" }}
          >
            {contaSelecionada?.parcelas?.length > 0 ? (
              contaSelecionada.parcelas.map((parcela) => {
                const parcelaEditando = parcelasEditando[parcela.id] || parcela;
                const estaEditando = !!parcelasEditando[parcela.id];
                const carregando = loadingParcelas[parcela.id] || false;

                let statusValue, statusText, statusColor;

                if (isPrestador) {
                  statusValue = parseInt(
                    parcela.status_pagamento_comissao || "0"
                  );
                  statusText = statusValue === 1 ? "Pago" : "Pendente";
                  statusColor =
                    statusValue === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800";
                } else if (isPalestra) {
                  statusValue = parseInt(parcela.status_pagamento || "0");
                  statusText = statusValue === 1 ? "Pendente" : "Pago";
                  statusColor =
                    statusValue === 1
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800";
                } else {
                  statusValue = parseInt(parcela.status_pagamento || "0");
                  statusText = statusValue === 1 ? "Pago" : "Pendente";
                  statusColor =
                    statusValue === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800";
                }
                let dataVencimento, valor, formaPagamento;
                if (isPalestra) {
                  dataVencimento = parcela.data_vencimento;
                  valor = parcela.valor_total || parcela.valor || 0;
                  formaPagamento = contaSelecionada.forma_pagamento || "1";
                } else if (isPrestador) {
                  dataVencimento = parcela.data_pagamento;
                  valor = parcela.valor_comissao || parcela.valor || 0;
                  formaPagamento = contaSelecionada.tipo_pagamento || "1";
                } else {
                  dataVencimento = parcela.data_vencimento;
                  valor = parcela.valor_parcela || parcela.valor || 0;
                  formaPagamento =
                    parcelaEditando.forma_pagamento ||
                    parcela.forma_pagamento ||
                    "1";
                }

                return (
                  <div
                    key={parcela.id}
                    className="w-full border border-gray-300 rounded-lg p-4 bg-white relative"
                    style={{
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {/* Cabeçalho */}
                    <div className="w-full flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                      <div className="flex items-center">
                        <TextField
                          disabled
                          label="Descrição"
                          size="small"
                          value={parcela.descricao || `Parcela ${parcela.id}`}
                          onChange={(e) =>
                            handleParcelaChange(
                              parcela.id,
                              "descricao",
                              e.target.value
                            )
                          }
                          sx={{ width: 200 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Article />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <span
                          className={`px-2 py-1 text-xs ml-3 rounded ${statusColor}`}
                        >
                          {statusText}
                        </span>
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        disabled
                        label={
                          isPrestador ? "Data Pagamento" : "Data Vencimento"
                        }
                        type="date"
                        value={
                          dataVencimento
                            ? new Date(dataVencimento)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (isPrestador) {
                            handleParcelaChange(
                              parcela.id,
                              "data_pagamento",
                              newValue
                            );
                          } else {
                            handleParcelaChange(
                              parcela.id,
                              "data_vencimento",
                              newValue
                            );
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DateRange />
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ shrink: true }}
                      />

                      {/* Mostra data pagamento apenas para contas a receber normais */}
                      {!isPalestra && !isPrestador && (
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Data Pagamento"
                          type="date"
                          value={
                            parcelaEditando.data_pagamento
                              ? parcelaEditando.data_pagamento.split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleParcelaChange(
                              parcela.id,
                              "data_pagamento",
                              e.target.value
                            )
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DateRange />
                              </InputAdornment>
                            ),
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}

                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Valor"
                        disabled
                        value={formatarValor(valor)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Money />
                            </InputAdornment>
                          ),
                          readOnly: true,
                        }}
                      />

                      <TextField
                        select
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Status Pagamento"
                        value={statusValue}
                        onChange={(e) =>
                          handleStatusChange(
                            parcela.id,
                            parseInt(e.target.value)
                          )
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TransformIcon />
                            </InputAdornment>
                          ),
                        }}
                      >
                        <MenuItem value={1}>
                          {isPalestra ? "Pendente" : "Pago"}
                        </MenuItem>
                        <MenuItem value={2}>
                          {isPalestra ? "Pago" : "Pendente"}
                        </MenuItem>
                      </TextField>

                      {/* Campo de forma de pagamento */}
                      {isPrestador ? (
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Forma de Pagamento"
                          value={formaPagamento}
                          disabled
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MonetizationOn />
                              </InputAdornment>
                            ),
                          }}
                        >
                          {getFormaPagamentoLabel(formaPagamento)}
                        </TextField>
                      ) : (
                        <TextField
                          select
                          fullWidth
                          disabled
                          variant="outlined"
                          size="small"
                          label="Forma de Pagamento"
                          value={formaPagamento}
                          onChange={(e) =>
                            handleParcelaChange(
                              parcela.id,
                              "forma_pagamento",
                              e.target.value
                            )
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MonetizationOn />
                              </InputAdornment>
                            ),
                          }}
                        >
                          {formasPagamento.map((forma) => (
                            <MenuItem key={forma.value} value={forma.value}>
                              {forma.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    </div>

                    {/* Botão de salvar */}
                    <div className="flex justify-end mt-3">
                      {!isPalestra && !isPrestador && (
                        <div className="flex justify-end mt-3">
                          <Button
                            variant="contained"
                            size="small"
                            disabled={!estaEditando || carregando}
                            startIcon={
                              carregando ? (
                                <CircularProgress size={20} />
                              ) : (
                                <Save />
                              )
                            }
                            onClick={() => handleUpdateParcela(parcela.id)}
                            sx={{
                              backgroundColor: "#9D4B5B",
                              "&:hover": { backgroundColor: "#7a3a48" },
                              "&:disabled": { opacity: 0.7 },
                            }}
                          >
                            {carregando ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma parcela encontrada</p>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};

export default ParcelasContasReceber;
