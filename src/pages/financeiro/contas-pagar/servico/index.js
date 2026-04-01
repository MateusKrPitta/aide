import React, { useState, useEffect, useRef, useCallback } from "react";
import ButtonComponent from "../../../../components/button";
import {
  AddCircleOutline,
  FilterAlt,
  Search,
  ArrowBack,
  Info,
  Work,
  Save,
  DateRange,
  Money,
  Numbers,
  Transform,
  Person,
  Business,
} from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  TextField,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Divider,
  Autocomplete,
} from "@mui/material";
import { buscarServicoTotalValor } from "../../../../service/get/servico-valores";
import TableComponent from "../../../../components/table";
import { buscarRelatorioServicoPagar } from "../../../../service/get/relatorio-servico-pagar";
import { relatoriosServicoPagar } from "../../../../entities/class/relatorio-servicos";
import { headerRelatorioServicoPagar } from "../../../../entities/header/financeiro/relatorio-servico-pagar";
import ModalLateral from "../../../../components/modal-lateral";
import { buscarRelatorioServicoId } from "../../../../service/get/relatorio-servico-id";
import { atualizarParcelaCompleta } from "../../../../service/put/atualiza-parcela-servico";
import CentralModal from "../../../../components/modal-central";
import { buscarPrestadoresAtivos } from "../../../../service/get/prestadores-ativos";
import { buscarClientesAtivos } from "../../../../service/get/clientes-ativo";

const ContasPagarServico = ({ onClick, isActive }) => {
  const [totaisServicos, setTotaisServicos] = useState({
    prestador: {
      pendente: 0,
      pago: 0,
      total: 0,
    },
  });
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [dataInicioFiltro, setDataInicioFiltro] = useState("");
  const [statusPagamentoFiltro, setStatusPagamentoFiltro] = useState("");
  const [dataFimFiltro, setDataFimFiltro] = useState("");
  const [servicos, setServicos] = useState([]);

  const [prestadorFiltro, setPrestadorFiltro] = useState(null);
  const [prestadorBusca, setPrestadorBusca] = useState("");
  const [listaPrestadores, setListaPrestadores] = useState([]);
  const [loadingPrestadores, setLoadingPrestadores] = useState(false);
  const [clienteFiltro, setClienteFiltro] = useState(null);
  const [clienteBusca, setClienteBusca] = useState("");
  const [listaClientes, setListaClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [loadingTotais, setLoadingTotais] = useState(false);
  const [loadingTabela, setLoadingTabela] = useState(false);
  const [filtro, setFiltro] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [dadosCarregados, setDadosCarregados] = useState(false);
  const [servicoDetalhado, setServicoDetalhado] = useState(null);
  const [editando, setEditando] = useState(false);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [salvandoParcelas, setSalvandoParcelas] = useState({});

  const timeoutRef = useRef(null);
  const clienteTimeoutRef = useRef(null);
  const prestadorTimeoutRef = useRef(null);
  const isMounted = useRef(true);

  const handleCloseEdicao = () => {
    setEditando(false);
    setServicoDetalhado(null);
  };

  const FecharFiltro = () => {
    setFiltro(false);
  };

  const handleAbrirFiltro = async () => {
    setFiltro(true);
    await buscarPrestadores("");
    await buscarClientes("");
  };

  const buscarPrestadores = useCallback(async (busca = "") => {
    try {
      setLoadingPrestadores(true);
      const response = await buscarPrestadoresAtivos();

      if (response.success && response.data) {
        let prestadores = response.data;
        if (busca) {
          prestadores = prestadores.filter((prestador) =>
            prestador.nome.toLowerCase().includes(busca.toLowerCase()),
          );
        }
        setListaPrestadores(prestadores);
      }
    } catch (error) {
      console.error("Erro ao buscar prestadores:", error);
    } finally {
      setLoadingPrestadores(false);
    }
  }, []);

  const handlePrestadorBuscaChange = (event, newValue) => {
    setPrestadorBusca(newValue);

    if (prestadorTimeoutRef.current) {
      clearTimeout(prestadorTimeoutRef.current);
    }

    prestadorTimeoutRef.current = setTimeout(() => {
      buscarPrestadores(newValue);
    }, 300);
  };

  const buscarClientes = useCallback(async (busca = "") => {
    try {
      setLoadingClientes(true);
      const response = await buscarClientesAtivos();

      if (response.success && response.data) {
        let clientes = response.data;
        if (busca) {
          clientes = clientes.filter((cliente) =>
            cliente.nome.toLowerCase().includes(busca.toLowerCase()),
          );
        }
        setListaClientes(clientes);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  const handleClienteBuscaChange = (event, newValue) => {
    setClienteBusca(newValue);

    if (clienteTimeoutRef.current) {
      clearTimeout(clienteTimeoutRef.current);
    }

    clienteTimeoutRef.current = setTimeout(() => {
      buscarClientes(newValue);
    }, 300);
  };
  const fetchTotaisServicos = async () => {
    try {
      setLoadingTotais(true);
      const response = await buscarServicoTotalValor();

      if (isMounted.current) {
        setTotaisServicos(
          response.data || {
            prestador: {
              pendente: 0,
              pago: 0,
              total: 0,
            },
          },
        );
      }
    } catch (error) {
      console.error("Erro ao buscar totais de serviços:", error);
    } finally {
      if (isMounted.current) {
        setLoadingTotais(false);
      }
    }
  };

  const fetchServicos = useCallback(
    async (pagina = 1, itensPorPagina = 10, searchTerm = termoBusca) => {
      try {
        setLoadingTabela(true);

        const response = await buscarRelatorioServicoPagar({
          page: pagina,
          perPage: itensPorPagina,
          search: searchTerm,
          status: statusPagamentoFiltro,
          data_inicio: dataInicioFiltro,
          data_fim: dataFimFiltro,
          prestador_id: prestadorFiltro?.id || "",
          cliente_id: clienteFiltro?.id || "",
        });

        if (response && isMounted.current) {
          const servicosFormatados = relatoriosServicoPagar(
            response.data || [],
          );

          setServicos(servicosFormatados);
          setTotalRegistros(parseInt(response.total) || 0);
          setTotalPaginas(parseInt(response.lastPage) || 1);
          setPaginaAtual(parseInt(response.page) || 1);
          setItensPorPagina(parseInt(response.perPage) || itensPorPagina);
          setDadosCarregados(true);
        }
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);

        if (isMounted.current) {
          setServicos([]);
        }
      } finally {
        if (isMounted.current) {
          setLoadingTabela(false);
        }
      }
    },
    [
      termoBusca,
      statusPagamentoFiltro,
      dataInicioFiltro,
      dataFimFiltro,
      prestadorFiltro,
      clienteFiltro,
    ],
  );

  const VisualizarParcelas = async (servico) => {
    try {
      setLoadingDetalhes(true);
      if (servico.id) {
        const response = await buscarRelatorioServicoId(servico.id);

        setServicoDetalhado({
          ...servico,
          ...response.data,
        });

        setEditando(true);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do serviço:", error);
    } finally {
      setLoadingDetalhes(false);
    }
  };

  const handleChangeParcela = (index, campo, valor) => {
    const novasParcelas = [...servicoDetalhado.parcelas];
    novasParcelas[index] = {
      ...novasParcelas[index],
      [campo]: valor,
    };

    setServicoDetalhado((prev) => ({
      ...prev,
      parcelas: novasParcelas,
    }));
  };

  const handleClickServicos = () => {
    onClick();
    if (!isActive) {
      setDadosCarregados(false);
      fetchTotaisServicos();
      fetchServicos(1, itensPorPagina);
    } else {
      setDadosCarregados(false);
      setServicos([]);
    }
  };

  const salvarParcela = async (parcela, index) => {
    try {
      setSalvandoParcelas((prev) => ({ ...prev, [index]: true }));

      const dadosParaEnviar = {
        data_pagamento: parcela.data_pagamento || null,
        status_pagamento_prestador: parcela.status_pagamento_prestador || 1,
      };

      await atualizarParcelaCompleta(parcela.id, dadosParaEnviar);

      setEditando(false);
      setServicoDetalhado(null);
      setTimeout(() => {
        fetchTotaisServicos();
        fetchServicos(paginaAtual, itensPorPagina);
      }, 300);
    } catch (error) {
      console.error("Erro ao salvar parcela:", error);
    } finally {
      setSalvandoParcelas((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setTermoBusca(value);

    setPaginaAtual(1);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (dadosCarregados && isActive) {
        fetchServicos(1, itensPorPagina, value);
      }
    }, 500);
  };

  const handlePageChange = (newPage) => {
    const pageNumber = newPage + 1;
    setPaginaAtual(pageNumber);
    fetchServicos(pageNumber, itensPorPagina);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setItensPorPagina(newRowsPerPage);
    setPaginaAtual(1);
    fetchServicos(1, newRowsPerPage);
  };

  const limparFiltros = () => {
    setDataInicioFiltro("");
    setDataFimFiltro("");
    setCategoriaFiltro("");
    setStatusPagamentoFiltro("");
    setPrestadorFiltro(null);
    setPrestadorBusca("");
    setClienteFiltro(null);
    setClienteBusca("");
  };

  const aplicarFiltros = () => {
    setDadosCarregados(false);
    fetchServicos(1, itensPorPagina);
    FecharFiltro();
  };

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (prestadorTimeoutRef.current) {
        clearTimeout(prestadorTimeoutRef.current);
      }
    };
  }, []);

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "R$ 0,00";

    const numero = Number(value);
    if (isNaN(numero)) return "R$ 0,00";

    const valorFormatado = numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    });

    return `R$ ${valorFormatado}`;
  };
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  return (
    <>
      {!isActive ? (
        <ButtonComponent
          startIcon={<AddCircleOutline fontSize="small" />}
          title={"Serviços"}
          subtitle={"Serviços"}
          buttonSize="large"
          onClick={handleClickServicos}
          style={{
            backgroundColor: isActive ? "#9D4B5B" : "white",
            color: isActive ? "white" : "#9D4B5B",
            border: "1px solid #9D4B5B",
          }}
        />
      ) : (
        <ButtonComponent
          startIcon={<ArrowBack fontSize="small" />}
          title={"Voltar"}
          subtitle={"Contas"}
          buttonSize="large"
          onClick={handleClickServicos}
          style={{
            backgroundColor: "#9D4B5B",
            color: "white",
            border: "1px solid #9D4B5B",
          }}
        />
      )}

      {isActive && (
        <div className="w-full flex-col gap-2 ">
          <div className="flex w-full itens-center gap-2">
            <div
              className="w-full flex-col flex gap-2 itens-center justify-center p-2"
              style={{ backgroundColor: "#9D4B5B", borderRadius: "10px" }}
            >
              <label className="text-xs text-sm font-bold text-white text-center w-full">
                Prestador
              </label>
              <div className="flex itens-center w-full justify-between">
                <div
                  className="w-[30%] flex flex-col gap-1 p-2 justify-center"
                  style={{ backgroundColor: "white", borderRadius: "10px" }}
                >
                  <label className="text-xs text-center font-bold text-primary">
                    Pago
                  </label>
                  <label className="text-xs text-center text-primary">
                    {loadingTotais ? (
                      <CircularProgress size={16} />
                    ) : (
                      formatCurrency(totaisServicos.prestador?.pago || 0)
                    )}
                  </label>
                </div>
                <div
                  className="w-[30%] flex flex-col gap-1 p-2 justify-center"
                  style={{ backgroundColor: "white", borderRadius: "10px" }}
                >
                  <label className="text-xs text-center font-bold text-primary">
                    Pendente
                  </label>
                  <label className="text-xs text-center text-primary">
                    {loadingTotais ? (
                      <CircularProgress size={16} />
                    ) : (
                      formatCurrency(totaisServicos.prestador?.pendente || 0)
                    )}
                  </label>
                </div>
                <div
                  className="w-[30%] flex flex-col gap-1 p-2 justify-center"
                  style={{ backgroundColor: "white", borderRadius: "10px" }}
                >
                  <label className="text-xs text-center font-bold text-primary">
                    Total
                  </label>
                  <label className="text-xs text-center text-primary">
                    {loadingTotais ? (
                      <CircularProgress size={16} />
                    ) : (
                      formatCurrency(totaisServicos.prestador?.total || 0)
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap w-full items-center justify-center md:justify-start mb-2 mt-2">
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label="Pesquisar Prestador"
              autoComplete="off"
              value={termoBusca}
              onChange={handleSearchChange}
              sx={{ width: { xs: "72%", sm: "50%", md: "40%", lg: "40%" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton
              title="Filtro"
              onClick={handleAbrirFiltro}
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
          </div>

          <div className="w-full flex justify-center mb-4">
            {loadingTabela ? (
              <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <label className="text-xs text-primary">
                  Carregando serviços...
                </label>
              </div>
            ) : !dadosCarregados ? (
              <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                <label className="text-sm">
                  Clique no botão "Serviços" para carregar os dados
                </label>
              </div>
            ) : servicos.length > 0 ? (
              <>
                <TableComponent
                  headers={headerRelatorioServicoPagar}
                  rows={servicos}
                  actionsLabel={"Ações"}
                  actionCalls={{
                    view: VisualizarParcelas,
                  }}
                  pagination={true}
                  totalRows={totalRegistros}
                  page={paginaAtual}
                  rowsPerPage={itensPorPagina}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </>
            ) : (
              <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <label className="text-sm">
                  {termoBusca
                    ? `Nenhum resultado encontrado para "${termoBusca}"`
                    : "Nenhum serviço encontrado!"}
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      <ModalLateral
        open={editando}
        handleClose={handleCloseEdicao}
        tituloModal={`Detalhes do Serviço - ${servicoDetalhado?.servico_nome || ""}`}
        icon={<Info />}
        width={"600px"}
        tamanhoTitulo="75%"
        conteudo={
          <div
            className="w-full "
            style={{ overflow: "auto", maxHeight: "500px" }}
          >
            {loadingDetalhes ? (
              <div className="flex items-center justify-center h-48">
                <CircularProgress />
                <Typography className="ml-2">Carregando detalhes...</Typography>
              </div>
            ) : servicoDetalhado ? (
              <>
                <Box className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm font-bol">
                    {" "}
                    Informações Gerais
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Typography variant="body2">
                      <strong>Cliente:</strong> {servicoDetalhado.cliente_nome}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Prestador:</strong>{" "}
                      {servicoDetalhado.prestador_nome}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Valor Prestador:</strong>{" "}
                      {formatCurrency(servicoDetalhado.valor_prestador)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Parcelas:</strong>{" "}
                      {servicoDetalhado.numero_parcelas}
                    </Typography>
                  </div>
                </Box>

                <Divider className="my-4" />

                {servicoDetalhado.parcelas &&
                servicoDetalhado.parcelas.length > 0 ? (
                  servicoDetalhado.parcelas.map((parcela, index) => (
                    <Box
                      key={parcela.id}
                      className="mb-6 p-4 border border-gray-200 rounded-lg"
                    >
                      <label className="mt-2 mb-2 flex w-full itens-center text-xs font-bold gap-2">
                        <Numbers fontSize="small" />
                        Parcela {parcela.numero_parcela}
                      </label>

                      <div className="mt-4 flex gap-3 flex-wrap">
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          disabled
                          label="Número da Parcela"
                          value={parcela.numero_parcela}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <Work />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "30%",
                            },
                          }}
                        />

                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          disabled
                          label="Valor Prestador"
                          value={formatCurrency(parcela.valor_prestador)}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <Money />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "30%",
                            },
                          }}
                        />

                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Data de Pagamento"
                          type="date"
                          value={formatDateForInput(parcela.data_pagamento)}
                          onChange={(e) =>
                            handleChangeParcela(
                              index,
                              "data_pagamento",
                              e.target.value,
                            )
                          }
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
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "30%",
                            },
                          }}
                        />

                        <FormControl
                          fullWidth
                          size="small"
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "30%",
                            },
                          }}
                        >
                          <InputLabel>Status Prestador</InputLabel>
                          <Select
                            value={parcela.status_pagamento_prestador || 1}
                            onChange={(e) =>
                              handleChangeParcela(
                                index,
                                "status_pagamento_prestador",
                                e.target.value,
                              )
                            }
                            label="Status Prestador"
                          >
                            <MenuItem value={1}>Pendente</MenuItem>
                            <MenuItem value={2}>Pago</MenuItem>
                          </Select>
                        </FormControl>
                      </div>

                      <div className="flex w-full items-end justify-end mt-4">
                        <ButtonComponent
                          startIcon={
                            salvandoParcelas[index] ? (
                              <CircularProgress size={16} />
                            ) : (
                              <Save fontSize="small" />
                            )
                          }
                          title={
                            salvandoParcelas[index]
                              ? "Salvando..."
                              : "Salvar Parcela"
                          }
                          subtitle="Salvar"
                          buttonSize="medium"
                          disabled={salvandoParcelas[index]}
                          onClick={() => salvarParcela(parcela, index)}
                        />
                      </div>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" className="text-gray-500">
                    Nenhuma parcela encontrada para este serviço.
                  </Typography>
                )}

                <Box className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <Typography variant="h6" className="mb-3 font-bold">
                    Resumo de Pagamentos
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Typography variant="body2">
                      <strong>Prestador Pendente:</strong>{" "}
                      {formatCurrency(
                        servicoDetalhado.total_prestador_pendente,
                      )}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Prestador Pago:</strong>{" "}
                      {formatCurrency(servicoDetalhado.total_prestador_pago)}
                    </Typography>
                  </div>
                </Box>
              </>
            ) : (
              <Typography>Nenhum detalhe disponível</Typography>
            )}
          </div>
        }
      />

      <CentralModal
        tamanhoTitulo={"81%"}
        maxHeight={"90vh"}
        top={"20%"}
        left={"28%"}
        width={"550px"}
        icon={<FilterAlt fontSize="small" />}
        open={filtro}
        onClose={FecharFiltro}
        title="Filtro Avançado"
      >
        <div className="overflow-y-auto overflow-x-hidden max-h-[500px] p-1">
          <div className="flex items-center flex-wrap w-full gap-3 mt-2">
            <Autocomplete
              fullWidth
              size="small"
              options={listaPrestadores}
              loading={loadingPrestadores}
              value={prestadorFiltro}
              onChange={(event, newValue) => {
                setPrestadorFiltro(newValue);
              }}
              inputValue={prestadorBusca}
              onInputChange={handlePrestadorBuscaChange}
              getOptionLabel={(option) => option.nome || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filtrar por Prestador"
                  variant="outlined"
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
                    endAdornment: (
                      <>
                        {loadingPrestadores ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{
                width: "100%",
                mb: 1,
              }}
              noOptionsText="Nenhum prestador encontrado"
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="body2">{option.nome}</Typography>
                  </Box>
                </li>
              )}
            />

            <Autocomplete
              fullWidth
              size="small"
              options={listaClientes}
              loading={loadingClientes}
              value={clienteFiltro}
              onChange={(event, newValue) => setClienteFiltro(newValue)}
              inputValue={clienteBusca}
              onInputChange={handleClienteBuscaChange}
              getOptionLabel={(option) => option.nome || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filtrar por Cliente"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Business />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {loadingClientes ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{
                width: "100%",
                mb: 1,
              }}
              noOptionsText="Nenhum cliente encontrado"
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="body2">{option.nome}</Typography>
                  </Box>
                </li>
              )}
            />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              type="date"
              label="Data Início"
              value={dataInicioFiltro}
              onChange={(e) => setDataInicioFiltro(e.target.value)}
              sx={{
                width: {
                  xs: "100%",
                  sm: "100%",
                  md: "48%",
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
              sx={{
                width: {
                  xs: "100%",
                  sm: "100%",
                  md: "48%",
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
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              label="Status Pagamento"
              value={statusPagamentoFiltro}
              onChange={(e) => setStatusPagamentoFiltro(e.target.value)}
              sx={{
                width: {
                  xs: "100%",
                  sm: "100%",
                  md: "48%",
                  lg: "48%",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Transform />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">Todos Status</MenuItem>
              <MenuItem value="1">Pendente</MenuItem>
              <MenuItem value="2">Pago</MenuItem>
            </TextField>

            <div className="flex w-full justify-between gap-2 mt-4">
              <ButtonComponent
                title={"Limpar Filtros"}
                buttonSize="large"
                onClick={limparFiltros}
                variant="outlined"
              />

              <ButtonComponent
                startIcon={<Search fontSize="small" />}
                title={"Aplicar Filtros"}
                subtitle={"Aplicar"}
                buttonSize="large"
                onClick={aplicarFiltros}
              />
            </div>
          </div>
        </div>
      </CentralModal>
    </>
  );
};

export default ContasPagarServico;
