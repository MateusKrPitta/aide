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
import { buscarRelatorioPalestras } from "../../../service/get/relatorio-palestra-cursos";
import { atualizarStatusPagParcela } from "../../../service/put/relatorio-palestra-cursos";
import { exportRelatorioPalestrasToPDF } from "./imprimir";

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

  const extrairOpcoesFiltro = (data) => {
    const clientesUnicos = [];
    const tiposPalestraUnicos = [];

    data.forEach((item) => {
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

    return { clientesUnicos, tiposPalestraUnicos };
  };

  const carregarRelatorioPalestras = async () => {
    try {
      setLoading(true);
      const response = await buscarRelatorioPalestras();

      const { clientesUnicos, tiposPalestraUnicos } = extrairOpcoesFiltro(
        response.data,
      );
      setClientesOptions(clientesUnicos);
      setTiposPalestraOptions(tiposPalestraUnicos);

      const listaTratada = (response.data || []).map((item) => {
        const totalPago = item.parcelas
          .filter((p) => p.status_pagamento === "2")
          .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

        return {
          id: item.id,
          nome: item.nome,
          data: new Date(item.data).toLocaleDateString("pt-BR"),
          cliente: item.cliente?.nome || "-",
          valor: `R$ ${Number(item.valor).toFixed(2).replace(".", ",")}`,
          status: totalPago === parseFloat(item.valor) ? "Pago" : "Pendente",
          original: item,
        };
      });

      setRelatorioPalestras(listaTratada);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setLoading(false);
    }
  };

  const relatoriosFiltrados = useMemo(() => {
    return relatorioPalestras.filter((palestra) => {
      const dataPalestra = new Date(palestra.original.data);

      const termoBuscaMatch =
        !termoBusca ||
        palestra.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        palestra.cliente.toLowerCase().includes(termoBusca.toLowerCase()) ||
        palestra.data.toLowerCase().includes(termoBusca.toLowerCase()) ||
        palestra.valor.toLowerCase().includes(termoBusca.toLowerCase());

      const clienteMatch =
        !clienteFiltro ||
        palestra.cliente.toLowerCase().includes(clienteFiltro.toLowerCase());

      const tipoPalestraMatch =
        !tipoPalestraFiltro ||
        palestra.original.tipoPalestra?.nome
          .toLowerCase()
          .includes(tipoPalestraFiltro.toLowerCase());

      const dataInicioMatch =
        !dataInicioFiltro || dataPalestra >= new Date(dataInicioFiltro);

      const dataFimMatch =
        !dataFimFiltro || dataPalestra <= new Date(dataFimFiltro);

      const statusMatch =
        !statusPagamentoFiltro ||
        palestra.status.toLowerCase() === statusPagamentoFiltro.toLowerCase();

      return (
        termoBuscaMatch &&
        clienteMatch &&
        tipoPalestraMatch &&
        dataInicioMatch &&
        dataFimMatch &&
        statusMatch
      );
    });
  }, [
    relatorioPalestras,
    termoBusca,
    clienteFiltro,
    tipoPalestraFiltro,
    dataInicioFiltro,
    dataFimFiltro,
    statusPagamentoFiltro,
  ]);

  const limparFiltros = () => {
    setClienteFiltro("");
    setTipoPalestraFiltro("");
    setDataInicioFiltro("");
    setDataFimFiltro("");
    setStatusPagamentoFiltro("");
  };

  const FecharFiltro = () => setFiltro(false);

  const { totalPago, totalPendente, totalGeral } = useMemo(() => {
    let pago = 0;
    let pendente = 0;

    relatoriosFiltrados.forEach((palestra) => {
      const valor = parseFloat(palestra.original.valor);
      if (palestra.status === "Pago") {
        pago += valor;
      } else {
        pendente += valor;
      }
    });

    return {
      totalPago: pago,
      totalPendente: pendente,
      totalGeral: pago + pendente,
    };
  }, [relatoriosFiltrados]);

  const formatarValor = (valor) => {
    return `R$ ${valor.toFixed(2).replace(".", ",")}`;
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
    carregarRelatorioPalestras();
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
                    {formatarValor(totalPago)}
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
                    {formatarValor(totalPendente)}
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
                    <MonetizationOnIcon /> Total: {formatarValor(totalGeral)}
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
                  className="view-button w-10 h-10 "
                  onClick={() =>
                    exportRelatorioPalestrasToPDF(
                      relatoriosFiltrados.map((item) => ({
                        nome: item.nome,
                        data: item.data,
                        cliente: item.cliente,
                        valor: item.valor,
                        status: item.status,
                      })),
                      {
                        totalPago: formatarValor(totalPago),
                        totalPendente: formatarValor(totalPendente),
                        totalGeral: formatarValor(totalGeral),
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
                ) : relatoriosFiltrados.length > 0 ? (
                  <TableComponent
                    headers={headerPalestras}
                    rows={relatoriosFiltrados}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      view: Informacoes,
                    }}
                  />
                ) : (
                  <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                    <TableLoading />
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
                        <MenuItem key={cliente.id} value={cliente.nome}>
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
                        <MenuItem key={tipo.id} value={tipo.nome}>
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
                                    <MenuItem value="1">Pendente</MenuItem>
                                    <MenuItem value="2">Pago</MenuItem>
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
