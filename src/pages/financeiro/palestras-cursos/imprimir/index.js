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
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

export const ImpressaoRelatorioPalestras = ({
  relatorios,
  totais,
  filtros,
}) => {
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
      {/* Cabeçalho */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Typography variant="h6" style={{ fontWeight: "bold" }}>
          Relatório de Palestras e Cursos
        </Typography>
      </div>

      {/* Filtros aplicados */}
      {filtros && (
        <div style={{ marginBottom: "15px" }}>
          <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
            Filtros aplicados:
          </Typography>
          {filtros.cliente && (
            <Typography variant="body2">Cliente: {filtros.cliente}</Typography>
          )}
          {filtros.tipoPalestra && (
            <Typography variant="body2">
              Tipo de Palestra: {filtros.tipoPalestra}
            </Typography>
          )}
          {filtros.dataInicio && filtros.dataFim && (
            <Typography variant="body2">
              Período: {filtros.dataInicio} a {filtros.dataFim}
            </Typography>
          )}
          {filtros.statusPagamento && (
            <Typography variant="body2">
              Status: {filtros.statusPagamento}
            </Typography>
          )}
        </div>
      )}

      {/* Tabela de dados */}
      <TableContainer component={Paper} style={{ overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow style={{ backgroundColor: "#f5f5f5" }}>
              <TableCell style={{ fontWeight: "bold" }}>Nome</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Data</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Cliente</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Valor</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {relatorios.map((relatorio, index) => (
              <TableRow key={index}>
                <TableCell>{relatorio.nome}</TableCell>
                <TableCell>{relatorio.data}</TableCell>
                <TableCell>{relatorio.cliente}</TableCell>
                <TableCell>{relatorio.valor}</TableCell>
                <TableCell>{relatorio.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totais */}
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          borderTop: "1px solid #ddd",
        }}
      >
        <Typography
          variant="subtitle1"
          style={{ fontWeight: "bold", marginBottom: "10px" }}
        >
          <MonetizationOnIcon
            fontSize="small"
            style={{ verticalAlign: "middle", marginRight: "5px" }}
          />
          Resumo Financeiro
        </Typography>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: "300px",
          }}
        >
          <Typography variant="body2">
            <strong>Total Pago:</strong>
          </Typography>
          <Typography variant="body2">{totais.totalPago}</Typography>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: "300px",
          }}
        >
          <Typography variant="body2">
            <strong>Total Pendente:</strong>
          </Typography>
          <Typography variant="body2">{totais.totalPendente}</Typography>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: "300px",
            marginTop: "5px",
            paddingTop: "5px",
            borderTop: "1px solid #eee",
          }}
        >
          <Typography variant="body2" style={{ fontWeight: "bold" }}>
            <strong>Total Geral:</strong>
          </Typography>
          <Typography variant="body2" style={{ fontWeight: "bold" }}>
            {totais.totalGeral}
          </Typography>
        </div>
      </div>

      {/* Rodapé */}
      <Typography
        variant="caption"
        display="block"
        style={{ marginTop: "30px", textAlign: "center", color: "#666" }}
      >
        Emitido em: {new Date().toLocaleDateString("pt-BR")} às{" "}
        {new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Typography>
    </div>
  );
};

export const exportRelatorioPalestrasToPDF = async (
  relatorios,
  totais,
  filtros,
  filename = "relatorio_palestras.pdf"
) => {
  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  document.body.appendChild(tempDiv);

  const { createRoot } = await import("react-dom/client");
  const root = createRoot(tempDiv);
  root.render(
    <ImpressaoRelatorioPalestras
      relatorios={relatorios}
      totais={totais}
      filtros={filtros}
    />
  );

  await new Promise((resolve) => setTimeout(resolve, 500));

  const input = tempDiv.querySelector("#print-container");

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
    root.unmount();
    document.body.removeChild(tempDiv);
  }
};

export default ImpressaoRelatorioPalestras;
