import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../../../components/navbars/header";
import HeaderPerfil from "../../../components/navbars/perfil";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CentralModal from "../../../components/modal-central";
import MenuMobile from "../../../components/menu-mobile";
import ModalLateral from "../../../components/modal-lateral";
import {
  DateRange,
  FilterAlt,
  InfoRounded,
  MonetizationOn,
  Person,
  Print,
  Work,
} from "@mui/icons-material";
import { IconButton, InputAdornment, MenuItem, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";
import TableLoading from "../../../components/loading/loading-table/loading";
import TableComponent from "../../../components/table";
import HeaderFinanceiro from "../../../components/navbars/financeiro";
import { headerPretadores } from "../../../entities/header/financeiro/prestadores";
import { buscarRelatorioPretadores } from "../../../service/get/relatorio-prestador";
import CustomToast from "../../../components/toast";
import { atualizarStatusPagamento } from "../../../service/put/status-pagamento-prestador";
import { buscarPretadores } from "../../../service/get/prestadores";
import { buscarClientes } from "../../../service/get/clientes";
import ImpressaoRelatorioPrestadores from "./imprimir";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const RelatorioPrestadores = () => {
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState(false);
  const [relatorios, setRelatorios] = useState([]);
  const [informacoes, setInformacoes] = useState(false);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const [prestadorSelecionado, setPrestadorSelecionado] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [listaPrestadores, setListaPrestadores] = useState([]);
  const [listaClientes, setListaClientes] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [statusPagamento, setStatusPagamento] = useState("");
  const [impressao, setImpressao] = useState(false);
  const componentRef = React.useRef();

  const handlePrint = () => {
    setImpressao(true);
    setTimeout(() => {
      const input = document.getElementById("print-container");

      html2canvas(input, {
        scale: 2,
        logging: false,
        useCORS: true,
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("relatorio_prestadores.pdf");
        setImpressao(false);
      });
    }, 500);
  };

  const Informacoes = (item) => {
    setItemSelecionado(item);
    setInformacoes(true);
  };

  const FecharFiltro = () => setFiltro(false);

  const handleClosInformacoes = () => {
    setInformacoes(false);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const buscarRelatorioPrestadores = async () => {
    try {
      setLoading(true);
      const response = await buscarRelatorioPretadores();
      const dadosFormatados = response.data.map((item) => {
        const totalServico = item.servicos.reduce(
          (acc, servico) => acc + parseFloat(servico.valor_total),
          0
        );

        const totalComissao = item.servicos.reduce(
          (acc, servico) => acc + parseFloat(servico.comissao),
          0
        );

        const data = new Date(item.created_at);
        const dataFormatada = data.toLocaleDateString("pt-BR");

        const hasPendingPayment = item.servicos.some((servico) =>
          servico.parcelas.some(
            (parcela) => parcela.status_pagamento_prestador === 2
          )
        );

        const status = hasPendingPayment ? "Pendente" : "Pago";

        return {
          id: item.id,
          nome: item.orcamento.nome,
          data: dataFormatada,
          pretadores: item.prestador.nome,
          cliente: item.orcamento.cliente.nome,
          valor_servico: `R$ ${totalServico.toFixed(2).replace(".", ",")}`,
          comissao: `R$ ${totalComissao.toFixed(2).replace(".", ",")}`,
          status: status,
          dadosCompletos: item,
        };
      });

      setRelatorios(response.data || []);
      setListaUsuarios(dadosFormatados);
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (parcelaId, tipo, novoStatus) => {
    setUpdatingStatus(true);
    try {
      const updatedRelatorios = relatorios.map((item) => {
        const updatedServicos = item.servicos.map((servico) => {
          const updatedParcelas = servico.parcelas.map((parcela) => {
            if (parcela.id === parcelaId) {
              return {
                ...parcela,
                [tipo === "prestador"
                  ? "status_pagamento_prestador"
                  : "status_pagamento_comissao"]: novoStatus,
                pago: novoStatus === 1,
              };
            }
            return parcela;
          });
          return { ...servico, parcelas: updatedParcelas };
        });
        return { ...item, servicos: updatedServicos };
      });

      setRelatorios(updatedRelatorios);

      if (itemSelecionado) {
        const updatedItem = JSON.parse(JSON.stringify(itemSelecionado));
        updatedItem.servicos.forEach((servico) => {
          servico.parcelas.forEach((parcela) => {
            if (parcela.id === parcelaId) {
              parcela[
                tipo === "prestador"
                  ? "status_pagamento_prestador"
                  : "status_pagamento_comissao"
              ] = novoStatus;
              parcela.pago = novoStatus === 1;
            }
          });
        });
        setItemSelecionado(updatedItem);
      }

      await atualizarStatusPagamento(parcelaId, tipo, novoStatus);

      await buscarRelatorioPrestadores();
    } catch (error) {
      CustomToast({
        type: "error",
        message: "Erro ao atualizar status",
      });
      buscarRelatorioPrestadores();
    }
  };
  useEffect(() => {
    buscarRelatorioPrestadores();
  }, []);

  const relatoriosFiltrados = useMemo(() => {
    return listaUsuarios.filter((relatorio) => {
      const termo = termoBusca.toLowerCase();
      const matchesTermo =
        relatorio.pretadores?.toLowerCase().includes(termo) ||
        relatorio.cliente?.toLowerCase().includes(termo) ||
        relatorio.data?.toLowerCase().includes(termo) ||
        relatorio.valor_servico?.toLowerCase().includes(termo) ||
        relatorio.status?.toLowerCase().includes(termo);

      const matchesPrestador = prestadorSelecionado
        ? relatorio.pretadores === prestadorSelecionado
        : true;

      const matchesCliente = clienteSelecionado
        ? relatorio.cliente === clienteSelecionado
        : true;

      const matchesDataInicio = dataInicio
        ? new Date(relatorio.data) >= new Date(dataInicio)
        : true;

      const matchesDataFim = dataFim
        ? new Date(relatorio.data) <= new Date(dataFim)
        : true;

      const matchesStatusPagamento = statusPagamento
        ? relatorio.status === statusPagamento
        : true;

      return (
        matchesTermo &&
        matchesPrestador &&
        matchesCliente &&
        matchesDataInicio &&
        matchesDataFim &&
        matchesStatusPagamento
      );
    });
  }, [
    termoBusca,
    listaUsuarios,
    prestadorSelecionado,
    clienteSelecionado,
    dataInicio,
    dataFim,
    statusPagamento,
  ]);

  const totalPago = relatoriosFiltrados
    .filter((item) => item.status === "Pago")
    .reduce(
      (acc, item) =>
        acc +
        parseFloat(item.valor_servico.replace("R$ ", "").replace(",", ".")),
      0
    );

  const totalPendente = relatoriosFiltrados
    .filter((item) => item.status === "Pendente")
    .reduce(
      (acc, item) =>
        acc +
        parseFloat(item.valor_servico.replace("R$ ", "").replace(",", ".")),
      0
    );

  const totalGeral = totalPago + totalPendente;

  const buscarPrestadoresEClientes = async () => {
    try {
      const responsePrestadores = await buscarPretadores();
      const responseClientes = await buscarClientes();
      setListaPrestadores(responsePrestadores.data);
      setListaClientes(responseClientes.data);
    } catch (error) {
      console.error("Erro ao buscar prestadores e clientes", error);
    }
  };

  useEffect(() => {
    buscarRelatorioPrestadores();
    buscarPrestadoresEClientes();
  }, []);

  return (
    <div className="flex w-full ">
      <Navbar />
      <div className="flex ml-0 flex-col gap-3 w-full items-end md:ml-0 ">
        <MenuMobile />
        <motion.div
          style={{ width: "100%" }}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.9 }}
        >
          <HeaderPerfil pageTitle="Relatorio Prestadores" />

          <div className=" items-center justify-center lg:justify-start w-full flex mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="hidden md:block md:w-[60%] lg:w-[15%]">
              <HeaderFinanceiro />
            </div>
            <div className="w-[100%] itens-center ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[80%]">
              <div className="flex itens-center w-full gap-2 mb-3">
                <div className="flex items-center justify-center  mr-9 w-[35%]">
                  <label
                    className="flex w-[100%] items-center justify-center text-xs gap-4 font-bold"
                    style={{
                      backgroundColor: "white",
                      color: "#9D4B5B",
                      border: "1px solid #9D4B5B",
                      borderRadius: "10px",
                      padding: "10px",
                    }}
                  >
                    <MonetizationOnIcon /> Total Pago: R${" "}
                    {totalPago.toFixed(2).replace(".", ",")}
                  </label>
                </div>

                <div className="flex items-center justify-center mr-9 w-[35%]">
                  <label
                    className="flex w-[100%] items-center justify-center text-xs gap-4 font-bold"
                    style={{
                      backgroundColor: "white",
                      color: "#9D4B5B",
                      border: "1px solid #9D4B5B",
                      borderRadius: "10px",
                      padding: "10px",
                    }}
                  >
                    <MonetizationOnIcon /> Total Pendente: R${" "}
                    {totalPendente.toFixed(2).replace(".", ",")}
                  </label>
                </div>

                <div className="flex items-center justify-center mr-9 w-[35%]">
                  <label
                    className="flex w-[100%] items-center justify-center text-xs gap-4 font-bold"
                    style={{
                      backgroundColor: "#9D4B5B",
                      color: "white",
                      borderRadius: "10px",
                      padding: "10px",
                    }}
                  >
                    <MonetizationOnIcon /> Total: R${" "}
                    {totalGeral.toFixed(2).replace(".", ",")}
                  </label>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap w-full items-center justify-center md:justify-start">
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Pesquisar"
                  autoComplete="off"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  sx={{ width: { xs: "72%", sm: "50%", md: "40%", lg: "40%" } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <IconButton
                  title="Filtro"
                  onClick={() => setFiltro(true)}
                  className="view-button w-10 h-10 "
                  sx={{
                    color: "black",
                    border: "1px solid black",
                    "&:hover": {
                      color: "#fff",
                      backgroundColor: "#9D4B5B",
                      border: "1px solid black",
                    },
                  }}
                >
                  <FilterAlt fontSize={"small"} />
                </IconButton>
                <IconButton
                  title="Imprimir"
                  onClick={handlePrint}
                  sx={{
                    color: "black",
                    border: "1px solid black",
                    "&:hover": { color: "#fff", backgroundColor: "#9D4B5B" },
                  }}
                >
                  <Print fontSize="small" />
                </IconButton>

                {impressao && (
                  <div style={{ position: "absolute", left: "-9999px" }}>
                    <ImpressaoRelatorioPrestadores
                      relatorios={relatoriosFiltrados}
                      totais={{
                        pago: totalPago,
                        pendente: totalPendente,
                        geral: totalGeral,
                      }}
                      filtros={{
                        prestador: prestadorSelecionado,
                        cliente: clienteSelecionado,
                        dataInicio,
                        dataFim,
                        status: statusPagamento,
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="w-full flex">
                {loading ? (
                  <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
                    <TableLoading />
                    <label className="text-xs text-primary">
                      Carregando Informações !
                    </label>
                  </div>
                ) : relatoriosFiltrados.length > 0 ? (
                  <TableComponent
                    headers={headerPretadores}
                    rows={relatoriosFiltrados}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      view: (item) => Informacoes(item.dadosCompletos),
                    }}
                  />
                ) : (
                  <div className="text-center w-full flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                    <TableLoading />
                    <label className="text-sm">
                      {termoBusca
                        ? `Nenhum relatório encontrado com "${termoBusca}"`
                        : "Nenhum relatório disponível!"}
                    </label>
                  </div>
                )}
              </div>

              <CentralModal
                tamanhoTitulo={"81%"}
                maxHeight={"90vh"}
                top={"20%"}
                left={"28%"}
                width={"450px"}
                icon={<FilterAlt fontSize="small" />}
                open={filtro}
                onClose={FecharFiltro}
                title="Filtro"
              >
                <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
                  <div className="flex items-center flex-wrap w-[95%] gap-3 mt-2">
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="date"
                      label="Data Início"
                      autoComplete="off"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      sx={{
                        width: { xs: "47%", sm: "50%", md: "40%", lg: "47%" },
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
                      type="date"
                      label="Data Fim"
                      autoComplete="off"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      sx={{
                        width: { xs: "48%", sm: "50%", md: "40%", lg: "49%" },
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
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Prestador"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Work />
                          </InputAdornment>
                        ),
                      }}
                      value={prestadorSelecionado}
                      onChange={(e) => setPrestadorSelecionado(e.target.value)}
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "100%" },
                      }}
                    >
                      {listaPrestadores.map((prestador) => (
                        <MenuItem key={prestador.id} value={prestador.nome}>
                          {prestador.nome}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Cliente"
                      value={clienteSelecionado}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                      onChange={(e) => setClienteSelecionado(e.target.value)}
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "100%" },
                      }}
                    >
                      {listaClientes.map((cliente) => (
                        <MenuItem key={cliente.id} value={cliente.nome}>
                          {cliente.nome}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Status Pagamento"
                      value={statusPagamento}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MonetizationOn />
                          </InputAdornment>
                        ),
                      }}
                      onChange={(e) => setStatusPagamento(e.target.value)}
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "100%" },
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Pago">Pago</MenuItem>
                      <MenuItem value="Pendente">Pendente</MenuItem>
                    </TextField>
                  </div>
                </div>
              </CentralModal>

              <ModalLateral
                open={informacoes}
                handleClose={handleClosInformacoes}
                tituloModal="Informações"
                icon={<InfoRounded />}
                tamanhoTitulo="75%"
                width="700px"
                conteudo={
                  itemSelecionado ? (
                    <div
                      className="flex flex-col w-full gap-4 p-4 overflow-y-auto"
                      style={{ maxHeight: "80vh" }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <label className="text-sm font-semibold text-gray-600">
                            Nome:
                          </label>
                          <p className="text-xs mt-1">
                            {itemSelecionado.orcamento.nome}
                          </p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <label className="text-sm font-semibold text-gray-600">
                            Prestador:
                          </label>
                          <p className="text-xs mt-1">
                            {itemSelecionado.prestador.nome}
                          </p>
                        </div>

                        <div className="bg-gray-100 p-3 rounded-lg">
                          <label className="text-sm font-semibold text-gray-600">
                            Cliente:
                          </label>
                          <p className="text-xs mt-1">
                            {itemSelecionado.orcamento.cliente.nome}
                          </p>
                        </div>

                        <div className="bg-gray-100 p-3 rounded-lg">
                          <label className="text-sm font-semibold text-gray-600">
                            Data:
                          </label>
                          <p className="text-xs mt-1">
                            {new Date(
                              itemSelecionado.created_at
                            ).toLocaleDateString("pt-BR")}
                          </p>
                        </div>

                        <div className="bg-gray-100 p-3 rounded-lg">
                          <label className="text-sm font-semibold text-gray-600">
                            Status Pagamento Prestador:
                          </label>
                          <p className="text-xs mt-1">
                            {itemSelecionado.servicos.some((servico) =>
                              servico.parcelas.some(
                                (p) => p.status_pagamento_prestador === 2
                              )
                            )
                              ? "Pendente"
                              : "Pago"}
                          </p>
                        </div>

                        <div className="bg-gray-100 p-3 rounded-lg">
                          <label className="text-sm font-semibold text-gray-600">
                            Status Pagamento Comissão:
                          </label>
                          <p className="text-xs mt-1">
                            {itemSelecionado.servicos.some((servico) =>
                              servico.parcelas.some(
                                (p) => p.status_pagamento_comissao === 2
                              )
                            )
                              ? "Pendente"
                              : "Pago"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-bold text-gray-700 mb-3">
                          Serviços
                        </h3>

                        {itemSelecionado.servicos.map((servico, index) => (
                          <div
                            key={index}
                            className="mb-6 border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <div className="bg-gray-200 p-3">
                              <h4 className="font-semibold text-gray-800">
                                {servico.servico.nome}
                              </h4>
                            </div>

                            <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50">
                              <div>
                                <label className="text-xs font-semibold text-gray-500">
                                  Valor Total
                                </label>
                                <p className="text-sm font-medium">
                                  R${" "}
                                  {parseFloat(servico.valor_total)
                                    .toFixed(2)
                                    .replace(".", ",")}
                                </p>
                              </div>

                              <div>
                                <label className="text-xs font-semibold text-gray-500">
                                  Comissão
                                </label>
                                <p className="text-sm font-medium">
                                  R${" "}
                                  {parseFloat(servico.comissao)
                                    .toFixed(2)
                                    .replace(".", ",")}
                                </p>
                              </div>

                              <div>
                                <label className="text-xs font-semibold text-gray-500">
                                  Valor Prestador
                                </label>
                                <p className="text-sm font-medium">
                                  R${" "}
                                  {parseFloat(servico.valor_prestador)
                                    .toFixed(2)
                                    .replace(".", ",")}
                                </p>
                              </div>
                            </div>

                            {/* Parcelas */}
                            <div className="p-3">
                              <h5 className="text-sm font-semibold text-gray-600 mb-2">
                                Parcelas
                              </h5>
                              <div className="space-y-3">
                                {servico.parcelas.map((parcela, pIndex) => (
                                  <div
                                    key={pIndex}
                                    className="grid grid-cols-1 gap-3 p-3 bg-white rounded border border-gray-200"
                                  >
                                    <div className="grid grid-cols-4 gap-2 items-center">
                                      <span className="text-xs font-medium">
                                        Parcela {parcela.numero_parcela}
                                      </span>
                                      <span className="text-xs">
                                        Vencimento:{" "}
                                        {new Date(
                                          parcela.data_pagamento
                                        ).toLocaleDateString("pt-BR")}
                                      </span>
                                      <span className="text-xs font-medium">
                                        R${" "}
                                        {parseFloat(parcela.valor_parcela)
                                          .toFixed(2)
                                          .replace(".", ",")}
                                      </span>

                                      <div className="flex items-center gap-1">
                                        {(() => {
                                          const isPaid =
                                            parcela.status_pagamento_prestador ===
                                              1 &&
                                            parcela.status_pagamento_comissao ===
                                              1;
                                          return (
                                            <span
                                              className={`text-xs font-medium ${
                                                isPaid
                                                  ? "text-green-600"
                                                  : "text-red-600"
                                              }`}
                                            >
                                              {isPaid ? "Pago" : "Pendente"}
                                            </span>
                                          );
                                        })()}
                                      </div>
                                    </div>

                                    {/* Selects para status de pagamento e comissão */}
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      <TextField
                                        select
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        label="Status Pagamento"
                                        value={
                                          parcela.status_pagamento_prestador
                                        }
                                        onChange={(e) =>
                                          handleStatusChange(
                                            parcela.id,
                                            "prestador",
                                            parseInt(e.target.value)
                                          )
                                        }
                                      >
                                        <MenuItem value={1}>Pago</MenuItem>
                                        <MenuItem value={2}>Pendente</MenuItem>
                                      </TextField>

                                      <TextField
                                        select
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        label="Status Comissão"
                                        value={
                                          parcela.status_pagamento_comissao
                                        }
                                        onChange={(e) =>
                                          handleStatusChange(
                                            parcela.id,
                                            "comissao",
                                            parseInt(e.target.value)
                                          )
                                        }
                                      >
                                        <MenuItem value={1}>Pago</MenuItem>
                                        <MenuItem value={2}>Pendente</MenuItem>
                                      </TextField>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {/* Cards existentes (mantidos) */}
                        <div className="bg-gray-200 p-3 rounded-lg text-center">
                          <label className="text-xs font-semibold text-gray-600 block">
                            Total Serviço
                          </label>
                          <p className="text-xs font-bold">
                            R${" "}
                            {itemSelecionado.servicos
                              .reduce(
                                (acc, serv) =>
                                  acc + parseFloat(serv.valor_total),
                                0
                              )
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>
                        </div>

                        <div className="bg-gray-200 p-3 rounded-lg text-center">
                          <label className="text-xs font-semibold text-gray-600 block">
                            Total Comissão
                          </label>
                          <p className="text-xs font-bold">
                            R${" "}
                            {itemSelecionado.servicos
                              .reduce(
                                (acc, serv) => acc + parseFloat(serv.comissao),
                                0
                              )
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>
                        </div>

                        <div className="bg-gray-200 p-3 rounded-lg text-center">
                          <label className="text-xs font-semibold text-gray-600 block">
                            Total Prestador
                          </label>
                          <p className="text-xs font-bold">
                            R${" "}
                            {itemSelecionado.servicos
                              .reduce(
                                (acc, serv) =>
                                  acc + parseFloat(serv.valor_prestador),
                                0
                              )
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>
                        </div>

                        {/* Novos cards para valores recebidos */}
                        <div className="bg-green-100 p-3 rounded-lg text-center">
                          <label className="text-xs font-semibold text-gray-600 block">
                            Comissão Recebida
                          </label>
                          <p className="text-xs font-bold text-green-700">
                            R${" "}
                            {itemSelecionado.servicos
                              .flatMap((serv) => serv.parcelas)
                              .filter(
                                (parcela) =>
                                  parcela.status_pagamento_comissao === 1
                              )
                              .reduce(
                                (acc, parcela) =>
                                  acc + parseFloat(parcela.valor_comissao || 0),
                                0
                              )
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>
                        </div>

                        <div className="bg-green-100 p-3 rounded-lg text-center">
                          <label className="text-xs font-semibold text-gray-600 block">
                            Prestador Recebido
                          </label>
                          <p className="text-xs font-bold text-green-700">
                            R${" "}
                            {itemSelecionado.servicos
                              .flatMap((serv) => serv.parcelas)
                              .filter(
                                (parcela) =>
                                  parcela.status_pagamento_prestador === 1
                              )
                              .reduce(
                                (acc, parcela) =>
                                  acc +
                                  parseFloat(parcela.valor_prestador || 0),
                                0
                              )
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>
                        </div>

                        <div className="bg-blue-100 p-3 rounded-lg text-center">
                          <label className="text-xs font-semibold text-gray-600 block">
                            Total Recebido
                          </label>
                          <p className="text-xs font-bold text-blue-700">
                            R${" "}
                            {(
                              itemSelecionado.servicos
                                .flatMap((serv) => serv.parcelas)
                                .filter(
                                  (parcela) =>
                                    parcela.status_pagamento_comissao === 1
                                )
                                .reduce(
                                  (acc, parcela) =>
                                    acc +
                                    parseFloat(parcela.valor_comissao || 0),
                                  0
                                ) +
                              itemSelecionado.servicos
                                .flatMap((serv) => serv.parcelas)
                                .filter(
                                  (parcela) =>
                                    parcela.status_pagamento_prestador === 1
                                )
                                .reduce(
                                  (acc, parcela) =>
                                    acc +
                                    parseFloat(parcela.valor_prestador || 0),
                                  0
                                )
                            )
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      Carregando informações...
                    </div>
                  )
                }
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RelatorioPrestadores;
