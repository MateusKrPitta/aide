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

export const ImpressaoRelatorioPrestadores = ({
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
      <label className="text-sm w-full text-center">
        {" "}
        Relatório de Prestadores
      </label>

      <TableContainer component={Paper} style={{ overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Prestador</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Valor Serviço</TableCell>
              <TableCell>Comissão</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {relatorios.map((relatorio, index) => (
              <TableRow key={index}>
                <TableCell>{relatorio.data}</TableCell>
                <TableCell>{relatorio.pretadores}</TableCell>
                <TableCell>{relatorio.cliente}</TableCell>
                <TableCell>{relatorio.valor_servico}</TableCell>
                <TableCell>{relatorio.comissao}</TableCell>
                <TableCell>{relatorio.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totais */}
      <div style={{ marginTop: "20px" }}>
        <Typography variant="subtitle1">
          <strong>Totais:</strong>
        </Typography>
        <Typography>
          Total Pago: R$ {totais.pago.toFixed(2).replace(".", ",")}
        </Typography>
        <Typography>
          Total Pendente: R$ {totais.pendente.toFixed(2).replace(".", ",")}
        </Typography>
        <Typography>
          Total Geral: R$ {totais.geral.toFixed(2).replace(".", ",")}
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

export const exportToPDF = async (filename = "relatorio_prestadores.pdf") => {
  const input = document.getElementById("print-container");

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
};

export default ImpressaoRelatorioPrestadores;
