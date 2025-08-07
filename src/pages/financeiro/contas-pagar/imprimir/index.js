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
    if (!value) return "R$ 0,00";
    return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return "Pendente";
      case 2:
        return "Pago";
      default:
        return "Em Andamento";
    }
  };

  return (
    <div
      id="print-container"
      style={{
        padding: "20px",
        fontFamily: "Arial",
        width: "210mm",
        maxWidth: "100%",
      }}
    >
      <Typography variant="h6" align="center" gutterBottom>
        Relatório de Contas a Pagar
      </Typography>

      {/* Filtros aplicados */}
      {Object.keys(filtros).length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <Typography variant="subtitle2">Filtros aplicados:</Typography>
          {filtros.dataInicio && (
            <Typography variant="body2">
              Data Início: {formatDate(filtros.dataInicio)}
            </Typography>
          )}
          {filtros.dataFim && (
            <Typography variant="body2">
              Data Fim: {formatDate(filtros.dataFim)}
            </Typography>
          )}
          {filtros.status && (
            <Typography variant="body2">Status: {filtros.status}</Typography>
          )}
        </div>
      )}

      {/* Tabela principal de contas */}
      <TableContainer component={Paper} style={{ marginBottom: "20px" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Prestador</TableCell>
              <TableCell>Data Início</TableCell>
              <TableCell>Data Fim</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contas.map((conta) => (
              <TableRow key={conta.id}>
                <TableCell>{conta.nome}</TableCell>
                <TableCell>{conta.custo_fixo ? "Fixo" : "Variável"}</TableCell>
                <TableCell>{conta.prestador?.nome || "-"}</TableCell>
                <TableCell>{formatDate(conta.data_inicio)}</TableCell>
                <TableCell>{formatDate(conta.data_fim) || "-"}</TableCell>
                <TableCell>
                  {formatCurrency(conta.valor_total || conta.valor_mensal)}
                </TableCell>
                <TableCell>{getStatusText(conta.status_geral)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Tabela de parcelas (uma para cada conta) */}
      {contas.map((conta) => (
        <div key={`parcelas-${conta.id}`} style={{ marginBottom: "30px" }}>
          <Typography variant="subtitle2" gutterBottom>
            Parcelas da conta: {conta.nome}
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
                {conta.parcelas?.map((parcela) => (
                  <TableRow key={parcela.id}>
                    <TableCell>{parcela.descricao}</TableCell>
                    <TableCell>{formatDate(parcela.data_vencimento)}</TableCell>
                    <TableCell>
                      {formatDate(parcela.data_pagamento) || "-"}
                    </TableCell>
                    <TableCell>{formatCurrency(parcela.valor)}</TableCell>
                    <TableCell>{getStatusText(parcela.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ))}

      {/* Totais */}
      <div style={{ marginTop: "20px" }}>
        <Typography variant="subtitle1">
          <strong>Totais:</strong>
        </Typography>
        <Typography>
          Total Pendente: {formatCurrency(totais.totalPendente)}
        </Typography>
        <Typography>
          Total Em Andamento: {formatCurrency(totais.totalAndamento)}
        </Typography>
        <Typography>Total Pago: {formatCurrency(totais.totalPago)}</Typography>
        <Typography>
          <strong>Total Geral: {formatCurrency(totais.totalGeral)}</strong>
        </Typography>
      </div>

      <Typography
        variant="caption"
        display="block"
        style={{ marginTop: "30px" }}
      >
        Emitido em: {new Date().toLocaleDateString("pt-BR")} às{" "}
        {new Date().toLocaleTimeString("pt-BR")}
      </Typography>
    </div>
  );
};

export const exportContasPagarToPDF = async (
  contas,
  totais = {},
  filtros = {},
  filename = "relatorio_contas_pagar.pdf"
) => {
  const printContainer = document.createElement("div");
  printContainer.style.position = "absolute";
  printContainer.style.left = "-9999px";
  document.body.appendChild(printContainer);

  const { createRoot } = await import("react-dom/client");
  const root = createRoot(printContainer);

  root.render(
    <ImpressaoContasPagar contas={contas} totais={totais} filtros={filtros} />
  );

  await new Promise((resolve) => setTimeout(resolve, 500));

  const input = printContainer.querySelector("#print-container");

  if (!input) {
    console.error("Elemento de impressão não encontrado");
    document.body.removeChild(printContainer);
    return;
  }

  try {
    const canvas = await html2canvas(input, {
      scale: 2,
      logging: false,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
  } finally {
    document.body.removeChild(printContainer);
  }
};

export default ImpressaoContasPagar;
