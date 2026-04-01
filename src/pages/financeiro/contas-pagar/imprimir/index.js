import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const ImpressaoContasPagar = ({ contas, totais, filtros }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "R$ 0,00";
    return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
  };

  const getStatusText = (status) => {
    const statusNum = parseInt(status);
    switch (statusNum) {
      case 1:
        return "Pendente";
      case 2:
        return "Pago";
      case 3:
        return "Em Andamento";
      default:
        return "Pendente";
    }
  };

  const getFiltroStatusText = (status) => {
    switch (status) {
      case "1":
        return "Pendente";
      case "2":
        return "Pago";
      case "3":
        return "Em Andamento";
      default:
        return status || "Todos";
    }
  };

  return (
    <div
      id="print-container"
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        width: "210mm",
        maxWidth: "100%",
        backgroundColor: "#fff",
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
          borderBottom: "2px solid #9D4B5B",
          paddingBottom: "10px",
        }}
      >
        <Typography
          variant="h5"
          style={{ color: "#9D4B5B", fontWeight: "bold" }}
        >
          Relatório de Contas a Pagar
        </Typography>
        <Typography variant="body2" style={{ color: "#666", marginTop: "5px" }}>
          Emitido em: {new Date().toLocaleDateString("pt-BR")} às{" "}
          {new Date().toLocaleTimeString("pt-BR")}
        </Typography>
      </div>

      {/* Filtros aplicados */}
      {filtros && Object.keys(filtros).length > 0 && (
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "5px",
          }}
        >
          <Typography
            variant="subtitle2"
            style={{
              fontWeight: "bold",
              marginBottom: "8px",
              color: "#9D4B5B",
            }}
          >
            📊 Filtros aplicados:
          </Typography>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "5px",
            }}
          >
            {filtros.search && (
              <Typography variant="body2">
                <strong>Pesquisa:</strong> {filtros.search}
              </Typography>
            )}
            {filtros.dataInicio && (
              <Typography variant="body2">
                <strong>Data Início:</strong> {formatDate(filtros.dataInicio)}
              </Typography>
            )}
            {filtros.dataFim && (
              <Typography variant="body2">
                <strong>Data Fim:</strong> {formatDate(filtros.dataFim)}
              </Typography>
            )}
            {filtros.categoria && (
              <Typography variant="body2">
                <strong>Categoria:</strong> {filtros.categoria}
              </Typography>
            )}
            {filtros.status && (
              <Typography variant="body2">
                <strong>Status:</strong> {getFiltroStatusText(filtros.status)}
              </Typography>
            )}
          </div>
        </div>
      )}

      {/* Cards de Totais */}
      {totais && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#9D4B5B",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" style={{ opacity: 0.9 }}>
              💰 Total Geral
            </Typography>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              {formatCurrency(totais.total_geral)}
            </Typography>
          </div>
          <div
            style={{
              backgroundColor: "#4caf50",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" style={{ opacity: 0.9 }}>
              ✅ Total Pago
            </Typography>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              {formatCurrency(totais.total_pago)}
            </Typography>
          </div>
          <div
            style={{
              backgroundColor: "#ff9800",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" style={{ opacity: 0.9 }}>
              ⏳ Total Pendente
            </Typography>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              {formatCurrency(totais.total_pendente)}
            </Typography>
          </div>
          <div
            style={{
              backgroundColor: "#2196f3",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" style={{ opacity: 0.9 }}>
              📋 Total de Contas
            </Typography>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              {totais.quantidade_contas || 0}
            </Typography>
          </div>
        </div>
      )}

      {/* Tabela principal de contas */}
      {contas && contas.length > 0 ? (
        <>
          <Typography
            variant="subtitle1"
            style={{
              fontWeight: "bold",
              marginBottom: "10px",
              color: "#9D4B5B",
            }}
          >
            📋 Lista de Contas
          </Typography>
          <TableContainer component={Paper} style={{ marginBottom: "20px" }}>
            <Table size="small">
              <TableHead>
                <TableRow style={{ backgroundColor: "#9D4B5B" }}>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>
                    Nome
                  </TableCell>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>
                    Tipo
                  </TableCell>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>
                    Categoria
                  </TableCell>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>
                    Prestador
                  </TableCell>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>
                    Data Início
                  </TableCell>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>
                    Valor
                  </TableCell>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contas.map((conta) => (
                  <TableRow key={conta.id} hover>
                    <TableCell>{conta.nome}</TableCell>
                    <TableCell>
                      {conta.custo_fixo ? "Fixo" : "Variável"}
                    </TableCell>
                    <TableCell>{conta.categoria_nome || "-"}</TableCell>
                    <TableCell>{conta.prestador_nome || "-"}</TableCell>
                    <TableCell>{formatDate(conta.data_inicio)}</TableCell>
                    <TableCell>{formatCurrency(conta.valor_total)}</TableCell>
                    <TableCell>
                      <span
                        style={{
                          color:
                            conta.status_geral === 2
                              ? "#4caf50"
                              : conta.status_geral === 3
                                ? "#2196f3"
                                : "#ff9800",
                          fontWeight: "bold",
                        }}
                      >
                        {getStatusText(conta.status_geral)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Tabela de parcelas (somente para contas que têm parcelas) */}
          {contas.some(
            (conta) => conta.parcelas && conta.parcelas.length > 0,
          ) && (
            <>
              <Typography
                variant="subtitle1"
                style={{
                  fontWeight: "bold",
                  marginBottom: "10px",
                  marginTop: "20px",
                  color: "#9D4B5B",
                }}
              >
                📅 Detalhamento de Parcelas
              </Typography>
              {contas.map(
                (conta) =>
                  conta.parcelas &&
                  conta.parcelas.length > 0 && (
                    <div
                      key={`parcelas-${conta.id}`}
                      style={{ marginBottom: "20px" }}
                    >
                      <Typography
                        variant="subtitle2"
                        style={{
                          fontWeight: "bold",
                          marginBottom: "5px",
                          backgroundColor: "#f5f5f5",
                          padding: "5px",
                        }}
                      >
                        {conta.nome}
                      </Typography>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Descrição</TableCell>
                              <TableCell>Vencimento</TableCell>
                              <TableCell>Pagamento</TableCell>
                              <TableCell>Valor</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {conta.parcelas.map((parcela) => (
                              <TableRow key={parcela.id}>
                                <TableCell>{parcela.descricao}</TableCell>
                                <TableCell>
                                  {formatDate(parcela.data_vencimento)}
                                </TableCell>
                                <TableCell>
                                  {formatDate(parcela.data_pagamento) || "-"}
                                </TableCell>
                                <TableCell>
                                  {formatCurrency(parcela.valor)}
                                </TableCell>
                                <TableCell>
                                  <span
                                    style={{
                                      color:
                                        parcela.status === 2
                                          ? "#4caf50"
                                          : parcela.status === 3
                                            ? "#2196f3"
                                            : "#ff9800",
                                    }}
                                  >
                                    {getStatusText(parcela.status)}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  ),
              )}
            </>
          )}
        </>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f5f5f5",
            borderRadius: "5px",
          }}
        >
          <Typography variant="body1">
            Nenhuma conta encontrada para os filtros selecionados.
          </Typography>
        </div>
      )}

      <Typography
        variant="caption"
        display="block"
        style={{
          marginTop: "30px",
          textAlign: "center",
          color: "#999",
          borderTop: "1px solid #e0e0e0",
          paddingTop: "10px",
        }}
      >
        Relatório gerado automaticamente pelo sistema de gestão financeira
      </Typography>
    </div>
  );
};

export const exportContasPagarToPDF = async (
  contas,
  totais = {},
  filtros = {},
  filename = "relatorio_contas_pagar.pdf",
) => {
  const printContainer = document.createElement("div");
  printContainer.style.position = "absolute";
  printContainer.style.left = "-9999px";
  printContainer.style.top = "0";
  document.body.appendChild(printContainer);

  try {
    const ReactDOMClient = await import("react-dom/client");
    const root = ReactDOMClient.createRoot(printContainer);

    root.render(
      <ImpressaoContasPagar
        contas={contas}
        totais={totais}
        filtros={filtros}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    const input = printContainer.querySelector("#print-container");

    if (!input) {
      throw new Error("Elemento de impressão não encontrado");
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const canvas = await html2canvas(input, {
      scale: 2,
      logging: false,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
      backgroundColor: "#ffffff",
    });

    document.body.style.overflow = originalOverflow;

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let position = 10;

    pdf.addImage(imgData, "PNG", 10, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight() - 20;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight() - 20;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw error;
  } finally {
    document.body.removeChild(printContainer);
  }
};

export default ImpressaoContasPagar;
