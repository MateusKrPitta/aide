import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../../../components/navbars/header";
import HeaderPerfil from "../../../components/navbars/perfil";
import ButtonComponent from "../../../components/button";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CentralModal from "../../../components/modal-central";
import MenuMobile from "../../../components/menu-mobile";
import ModalLateral from "../../../components/modal-lateral";
import {
  DateRange,
  FilterAlt,
  InfoRounded,
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
import { headerPalestras } from "../../../entities/header/financeiro/palestras";
import { atualizarStatusPagParcela } from "../../../service/put/relatorio-palestra-cursos";
import { exportRelatorioPalestrasToPDF } from "./imprimir";
import { buscarRelatorioTotalPalestras } from "../../../service/get/total-palestras-valor";

const RelatorioPalestrasCursos = () => {
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState(false);
  const [informacoes, setInformacoes] = useState(false);
  const [relatorioPalestras, setRelatorioPalestras] = useState([]);
  const [palestraSelecionada, setPalestraSelecionada] = useState(null);
  const [parcelasStatus, setParcelasStatus] = useState({});
  const [termoBusca, setTermoBusca] = useState("");
  const [clienteFiltro, setClienteFiltro] = useState("");
  const [tipoPalestraFiltro, setTipoPalestraFiltro] = useState("");
  const [dataInicioFiltro, setDataInicioFiltro] = useState("");
  const [dataFimFiltro, setDataFimFiltro] = useState("");
  const [statusPagamentoFiltro, setStatusPagamentoFiltro] = useState("");

  const [clientesOptions, setClientesOptions] = useState([]);
  const [tiposPalestraOptions, setTiposPalestraOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totais, setTotais] = useState({
    totalPago: 0,
    totalPendente: 0,
    totalGeral: 0,
  });

  const [debouncedTermoBusca, setDebouncedTermoBusca] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTermoBusca(termoBusca);
    }, 500);

    return () => clearTimeout(timer);
  }, [termoBusca]);

  const extrairOpcoesFiltro = async () => {
    try {
      const response = await buscarRelatorioTotalPalestras({
        page: 1,
        perPage: 1000,
      });

      if (response && response.data && response.data.dados) {
        const clientesUnicos = [];
        const tiposPalestraUnicos = [];

        response.data.dados.forEach((item) => {
          if (
            item.cliente &&
            !clientesUnicos.some((c) => c.id === item.cliente.id)
          ) {
            clientesUnicos.push(item.cliente);
          }

          if (
            item.tipoPalestra &&
            !tiposPalestraUnicos.some((t) => t.id === item.tipoPalestra.id)
          ) {
            tiposPalestraUnicos.push(item.tipoPalestra);
          }
        });

        setClientesOptions(clientesUnicos);
        setTiposPalestraOptions(tiposPalestraUnicos);
      }
    } catch (error) {
      console.error("Erro ao extrair opções de filtro:", error);
    }
  };

  const carregarRelatorioPalestras = async () => {
    try {
      setLoading(true);

      const filtros = {
        page: page,
        perPage: rowsPerPage,
        search: debouncedTermoBusca || undefined,
        cliente_id: clienteFiltro ? parseInt(clienteFiltro) : undefined,
        tipo_palestra_id: tipoPalestraFiltro
          ? parseInt(tipoPalestraFiltro)
          : undefined,
        data_inicio: dataInicioFiltro,
        data_fim: dataFimFiltro,
        status_pagamento: statusPagamentoFiltro,
      };

      const response = await buscarRelatorioTotalPalestras(filtros);

      if (response && response.data) {
        const listaTratada = response.data.dados.map((item) => ({
          id: item.id,
          nome: item.nome,
          data: new Date(item.data).toLocaleDateString("pt-BR"),
          cliente: item.cliente?.nome || "-",
          valor: formatarValor(item.valor),
          status: item.status,
          valor_pago: item.valor_pago,
          valor_pendente: item.valor_pendente,
          original: item,
        }));

        setRelatorioPalestras(listaTratada);
        setTotalRows(response.data.paginacao.total_itens);

        setTotais({
          totalPago: response.data.totais_filtrados.total_pago,
          totalPendente: response.data.totais_filtrados.total_pendente,
          totalGeral: response.data.totais_filtrados.total_geral,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setLoading(false);
    }
  };

  const relatoriosExibidos = relatorioPalestras;

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const limparFiltros = () => {
    setClienteFiltro("");
    setTipoPalestraFiltro("");
    setDataInicioFiltro("");
    setDataFimFiltro("");
    setStatusPagamentoFiltro("");
    setTermoBusca("");
    setDebouncedTermoBusca("");
    setPage(1);
  };

  const aplicarFiltros = () => {
    setPage(1);
    setFiltro(false);
    carregarRelatorioPalestras();
  };

  const FecharFiltro = () => setFiltro(false);

  const formatarValor = (valor) => {
    const numero = Number(valor);
    if (isNaN(numero)) return "R$ 0,00";

    return `R$ ${numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const Informacoes = (palestra) => {
    if (palestra?.original) {
      setPalestraSelecionada(palestra.original);

      const statusInicial = {};
      palestra.original.parcelas?.forEach((parcela) => {
        statusInicial[parcela.id] = parcela.status_pagamento;
      });
      setParcelasStatus(statusInicial);

      setInformacoes(true);
    }
  };

  const handleStatusChange = async (parcelaId, novoStatus) => {
    try {
      setParcelasStatus((prev) => ({
        ...prev,
        [parcelaId]: novoStatus,
      }));

      await atualizarStatusPagParcela(parcelaId, novoStatus);

      await carregarRelatorioPalestras();
    } catch (error) {
      setParcelasStatus((prev) => ({
        ...prev,
        [parcelaId]: prev[parcelaId],
      }));
    }
  };

  const handleClosInformacoes = () => {
    setInformacoes(false);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  useEffect(() => {
    extrairOpcoesFiltro();
  }, []);

  useEffect(() => {
    carregarRelatorioPalestras();
  }, [
    page,
    rowsPerPage,
    debouncedTermoBusca,
    clienteFiltro,
    tipoPalestraFiltro,
    dataInicioFiltro,
    dataFimFiltro,
    statusPagamentoFiltro,
  ]);

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
          <HeaderPerfil pageTitle="Relatorio de Palestras e Cursos" />

          <div className=" items-center justify-center lg:justify-start w-full flex mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="hidden md:block md:w-[60%] lg:w-[15%]">
              <HeaderFinanceiro />
            </div>
            <div className="w-[100%] itens-center mt-2 ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[80%]">
              <div className="flex itens-center gap-2 w-full mb-3">
                <div className="flex items-center justify-center mr-9 w-[35%]">
                  <label
                    className="flex w-[100%]  items-center justify-center text-xs gap-4 font-bold"
                    style={{
                      backgroundColor: "white",
                      color: "#9D4B5B",
                      border: "1px solid #9D4B5B",
                      borderRadius: "10px",
                      padding: "10px",
                    }}
                  >
                    <MonetizationOnIcon /> Total Pago:{" "}
                    {formatarValor(totais.totalPago)}
                  </label>
                </div>
                <div className="flex items-center justify-center mr-9 w-[35%]">
                  <label
                    className="flex w-[100%]  items-center justify-center text-xs gap-4 font-bold"
                    style={{
                      backgroundColor: "white",
                      color: "#9D4B5B",
                      border: "1px solid #9D4B5B",
                      borderRadius: "10px",
                      padding: "10px",
                    }}
                  >
                    <MonetizationOnIcon /> Total Pendente:{" "}
                    {formatarValor(totais.totalPendente)}
                  </label>
                </div>
                <div className="flex items-center justify-center mr-9 w-[35%]">
                  <label
                    className="flex w-[100%]  items-center justify-center text-xs gap-4 font-bold"
                    style={{
                      backgroundColor: "#9D4B5B",
                      color: "white",
                      borderRadius: "10px",
                      padding: "10px",
                    }}
                  >
                    <MonetizationOnIcon /> Total:{" "}
                    {formatarValor(totais.totalGeral)}
                  </label>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap w-full items-center justify-center md:justify-start">
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Pesquisar por nome, cliente, data ou valor"
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
                  className="view-button w-10 h-10 "
                  onClick={() =>
                    exportRelatorioPalestrasToPDF(
                      relatoriosExibidos.map((item) => ({
                        nome: item.nome,
                        data: item.data,
                        cliente: item.cliente,
                        valor: item.valor,
                        status: item.status,
                      })),
                      {
                        totalPago: formatarValor(totais.totalPago),
                        totalPendente: formatarValor(totais.totalPendente),
                        totalGeral: formatarValor(totais.totalGeral),
                      },
                      {
                        cliente: clienteFiltro,
                        tipoPalestra: tipoPalestraFiltro,
                        dataInicio: dataInicioFiltro
                          ? new Date(dataInicioFiltro).toLocaleDateString(
                              "pt-BR",
                            )
                          : "",
                        dataFim: dataFimFiltro
                          ? new Date(dataFimFiltro).toLocaleDateString("pt-BR")
                          : "",
                        statusPagamento: statusPagamentoFiltro,
                      },
                    )
                  }
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
                  <Print fontSize={"small"} />
                </IconButton>
              </div>
              <div className="w-full flex justify-center">
                {loading ? (
                  <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
                    <TableLoading />
                    <label className="text-xs text-primary">
                      Carregando Informações !
                    </label>
                  </div>
                ) : relatoriosExibidos.length > 0 ? (
                  <TableComponent
                    headers={headerPalestras}
                    rows={relatoriosExibidos}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      view: Informacoes,
                    }}
                    pagination={true}
                    totalRows={totalRows}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                  />
                ) : (
                  <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                    <label className="text-sm">
                      {termoBusca
                        ? `Nenhum resultado encontrado para "${termoBusca}"`
                        : "Nenhuma palestra ou curso encontrado!"}
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
                title="Filtro Avançado"
              >
                <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
                  <div className="flex items-center flex-wrap w-[95%] gap-3 mt-2">
                    {/* Select para Cliente */}
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Cliente"
                      value={clienteFiltro}
                      onChange={(e) => setClienteFiltro(e.target.value)}
                      sx={{ width: "100%" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {clientesOptions.map((cliente) => (
                        <MenuItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </MenuItem>
                      ))}
                    </TextField>

                    {/* Select para Tipo de Palestra */}
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Tipo de Palestra"
                      value={tipoPalestraFiltro}
                      onChange={(e) => setTipoPalestraFiltro(e.target.value)}
                      sx={{ width: "100%" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Work />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {tiposPalestraOptions.map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                          {tipo.nome}
                        </MenuItem>
                      ))}
                    </TextField>

                    {/* Filtro por Data */}
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="date"
                      label="Data Início"
                      value={dataInicioFiltro}
                      onChange={(e) => setDataInicioFiltro(e.target.value)}
                      sx={{ width: "100%" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRange />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="date"
                      label="Data Fim"
                      value={dataFimFiltro}
                      onChange={(e) => setDataFimFiltro(e.target.value)}
                      sx={{ width: "100%" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRange />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />

                    {/* Select para Status */}
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Status Pagamento"
                      value={statusPagamentoFiltro}
                      onChange={(e) => setStatusPagamentoFiltro(e.target.value)}
                      sx={{ width: "100%" }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Pago">Pago</MenuItem>
                      <MenuItem value="Pendente">Pendente</MenuItem>
                    </TextField>

                    {/* Botões de ação */}
                    <div className="flex items-end justify-between w-full gap-2">
                      <ButtonComponent
                        title={"Limpar Filtros"}
                        buttonSize="large"
                        onClick={limparFiltros}
                        variant="outlined"
                      />
                      <ButtonComponent
                        title={"Aplicar Filtros"}
                        buttonSize="large"
                        onClick={aplicarFiltros}
                        variant="contained"
                      />
                    </div>
                  </div>
                </div>
              </CentralModal>

              <ModalLateral
                open={informacoes}
                handleClose={handleClosInformacoes}
                tituloModal="Informações"
                icon={<InfoRounded />}
                tamanhoTitulo="75%"
                conteudo={
                  <div
                    className="flex w-full"
                    style={{ overflowY: "auto", maxHeight: "500px" }}
                  >
                    {palestraSelecionada && (
                      <div className="flex flex-col gap-4 text-sm w-[100%]">
                        <div className="bg-zinc-100 rounded-xl p-4">
                          <h2 className="text-base font-semibold mb-2">
                            Informações Gerais
                          </h2>
                          <p className="text-xs">
                            <label className="text-xs font-bold">Nome:</label>{" "}
                            {palestraSelecionada.nome}
                          </p>
                          <p className="text-xs">
                            <strong>Tipo:</strong>{" "}
                            {palestraSelecionada.tipoPalestra?.nome}
                          </p>
                          <p className="text-xs">
                            <label className="text-xs font-bold">Data:</label>{" "}
                            {new Date(
                              palestraSelecionada.data,
                            ).toLocaleDateString("pt-BR")}
                          </p>
                          <p className="text-xs">
                            <label className="text-xs font-bold">
                              Horário:
                            </label>{" "}
                            {palestraSelecionada.horario}
                          </p>
                          <p className="text-xs">
                            <label className="text-xs font-bold">Seções:</label>{" "}
                            {palestraSelecionada.secoes}
                          </p>
                          <p className="text-xs">
                            <label className="text-xs font-bold">
                              Valor total:
                            </label>{" "}
                            R${" "}
                            {Number(palestraSelecionada.valor)
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>
                        </div>

                        <div className="bg-zinc-100 rounded-xl p-4">
                          <h2 className="text-base font-semibold mb-2">
                            Cliente
                          </h2>
                          <p className="text-xs">
                            <strong>Nome:</strong>{" "}
                            {palestraSelecionada.cliente?.nome}
                          </p>
                          <p className="text-xs">
                            <strong>Telefone:</strong>{" "}
                            {palestraSelecionada.cliente?.telefone}
                          </p>
                          <p className="text-xs">
                            <strong>CPF/CNPJ:</strong>{" "}
                            {palestraSelecionada.cliente?.cpf_cnpj}
                          </p>
                          <p className="text-xs">
                            <strong>Email:</strong>{" "}
                            {palestraSelecionada.cliente?.email}
                          </p>
                          <p className="text-xs">
                            <strong>Endereço:</strong>{" "}
                            {palestraSelecionada.cliente?.endereco},{" "}
                            {palestraSelecionada.cliente?.numero} -{" "}
                            {palestraSelecionada.cliente?.cidade}/
                            {palestraSelecionada.cliente?.estado}
                          </p>
                        </div>

                        <div className="bg-zinc-100 rounded-xl p-4">
                          <h2 className="text-base font-semibold mb-2">
                            Parcelas
                          </h2>
                          {palestraSelecionada.parcelas?.map(
                            (parcela, index) => (
                              <div
                                key={parcela.id}
                                className="border rounded-lg p-3 mb-2 bg-white"
                              >
                                <p className="text-xs">
                                  <strong>
                                    Parcela {parcela.numero_parcela}
                                  </strong>
                                </p>
                                <p className="text-xs">
                                  Valor: R${" "}
                                  {Number(parcela.valor)
                                    .toFixed(2)
                                    .replace(".", ",")}
                                </p>
                                <p className="text-xs">
                                  Vencimento:{" "}
                                  {new Date(
                                    parcela.data_vencimento,
                                  ).toLocaleDateString("pt-BR")}
                                </p>
                                <p className="text-xs mt-4">
                                  <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    label="Status"
                                    value={
                                      parcelasStatus[parcela.id] ||
                                      parcela.status_pagamento
                                    }
                                    onChange={(e) =>
                                      handleStatusChange(
                                        parcela.id,
                                        e.target.value,
                                      )
                                    }
                                    variant="outlined"
                                  >
                                    <MenuItem value="2">Pendente</MenuItem>{" "}
                                    {/* ← CORRIGIDO: 2 = Pendente */}
                                    <MenuItem value="1">Pago</MenuItem>{" "}
                                    {/* ← CORRIGIDO: 1 = Pago */}
                                  </TextField>
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                }
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RelatorioPalestrasCursos;
