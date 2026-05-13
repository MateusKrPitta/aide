import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../../components/navbars/header";
import HeaderPerfil from "../../../components/navbars/perfil";
import ButtonComponent from "../../../components/button";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CentralModal from "../../../components/modal-central";
import MenuMobile from "../../../components/menu-mobile";
import {
  AddCircleOutline,
  Category,
  DateRange,
  FilterAlt,
  StarOutlineSharp,
  Print,
} from "@mui/icons-material";
import {
  Autocomplete,
  InputAdornment,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";
import TableLoading from "../../../components/loading/loading-table/loading";
import TableComponent from "../../../components/table";
import HeaderFinanceiro from "../../../components/navbars/financeiro";
import { buscarCategoria } from "../../../service/get/categoria";
import CustomToast from "../../../components/toast";
import {
  buscarContasReceber,
  buscarContasReceberImprimir,
} from "../../../service/get/contas-receber";
import { headerContasReceber } from "../../../entities/header/financeiro/contas-receber";
import { deletarContasReceber } from "../../../service/delete/contas-receber";
import CadastrarContaReceber from "./cadastro";
import EditarContaREceber from "./editar-conta-receber";
import { buscarContasReceberTotal } from "../../../service/get/contas-receber-totais";

const ContasReceber = () => {
  const [informacoes, setInformacoes] = useState(false);
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState(false);
  const [parcelas, setParcelas] = useState(false);
  const [categoriasCadastradas, setCategoriasCadastradas] = useState([]);
  const [contasReceberVi, setContasReceberVi] = useState([]);
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipoCusto, setFiltroTipoCusto] = useState("todos");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [totalItens, setTotalItens] = useState(0);
  const [totaisAPI, setTotaisAPI] = useState({
    pendente: 0,
    pago: 0,
    total: 0,
  });



  const buscarCategoriaCadastradas = async () => {
    try {
      setLoading(true);
      const response = await buscarCategoria();
      setCategoriasCadastradas(response.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar categorias",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseInformacoesInfo = () => {
    setInformacoes(false);
  };

  const FecharFiltro = () => setFiltro(false);

  const LimparFiltros = () => {
    setTermoBusca("");
    setFiltroDataInicio("");
    setFiltroDataFim("");
    setFiltroCategoria("");
    setFiltroStatus("");
    setFiltroTipoCusto("todos");
    buscarContas(1, itensPorPagina, {
      termoBusca: "",
      dataInicio: "",
      dataFim: "",
      categoria: "",
      status: "",
      custo_fixo: null,
      custo_variavel: null,
    });
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deletarContasReceber(id);
      await buscarContas(paginaAtual, itensPorPagina, getFiltrosAtuais());
    } catch (error) {
      console.error("Erro ao deletar conta:", error);
      CustomToast({
        type: "error",
        message: error.message || "Erro ao deletar conta",
      });
    } finally {
      setLoading(false);
    }
  };

  const Informacoes = (conta) => {
    setContaSelecionada(conta);
    setInformacoes(true);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const mapearDadosParaTabela = (dadosApi) => {
    if (!dadosApi || !Array.isArray(dadosApi)) {
      return [];
    }

    const formatarValor = (valor) => {
      if (valor === undefined || valor === null) return "R$ 0,00";

      const numero = Number(valor);
      if (isNaN(numero)) return "R$ 0,00";

      const valorFormatado = numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
      });

      return `R$ ${valorFormatado}`;
    };

    return dadosApi.map((conta) => {
      const dataFormatada = new Date(conta.data).toLocaleDateString("pt-BR");

      const valorFormatado = formatarValor(conta.valor);

      let status = "";
      if (conta.status_pagamento === 1) {
        status = "Pendente";
      } else if (conta.status_pagamento === 2) {
        status = "Pago";
      } else {
        status = conta.status_label || "Desconhecido";
      }

      return {
        id: conta.id,
        nome: conta.nome,
        data: dataFormatada,
        data_original: conta.data,
        valor: valorFormatado,
        valor_numerico: parseFloat(conta.valor),
        status: status,
        status_pagamento: conta.status_pagamento,
        status_label: conta.status_label,
        tipo: conta.custo_fixo ? "Fixo" : "Variável",
        tipoOrigem: "Conta à Receber",
        categoria: "Conta à Receber",
      };
    });
  };

  const getFiltrosAtuais = () => {
    const filtros = {};

    if (termoBusca) filtros.nome = termoBusca;
    if (filtroDataInicio) filtros.dataInicio = filtroDataInicio;
    if (filtroDataFim) filtros.dataFim = filtroDataFim;
    if (filtroCategoria && filtroCategoria !== "todas")
      filtros.categoria = filtroCategoria;
    if (filtroStatus) filtros.status = filtroStatus;

    if (filtroTipoCusto === "fixo") {
      filtros.custo_fixo = true;
    } else if (filtroTipoCusto === "variavel") {
      filtros.custo_variavel = true;
    }

    return filtros;
  };

  const buscarContas = async (
    pagina = paginaAtual,
    limite = itensPorPagina,
    filtros = {},
  ) => {
    try {
      setLoading(true);

      const filtrosCombinados = {
        ...getFiltrosAtuais(),
        ...filtros,
      };

      const [responseContas, responseTotais] = await Promise.all([
        buscarContasReceber(pagina, limite, filtrosCombinados),
        buscarContasReceberTotal(filtrosCombinados),
      ]);

      const { data: dadosContas, total, perPage, page } = responseContas;

      setTotalItens(total || 0);
      setPaginaAtual(page || 1);
      setItensPorPagina(perPage || 10);

      const dadosMapeados = mapearDadosParaTabela(dadosContas || []);
      setContasReceberVi(dadosMapeados);

      if (responseTotais && responseTotais.success) {
        setTotaisAPI({
          pendente: parseFloat(responseTotais.data.pendente || 0),
          pago: parseFloat(responseTotais.data.pago || 0),
          total: parseFloat(responseTotais.data.total || 0),
        });
      }
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
      CustomToast({
        type: "error",
        message: "Erro ao buscar contas a receber",
      });
      setContasReceberVi([]);
      setTotalItens(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (termoBusca === "") {
      setDebouncedSearchTerm("");
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(termoBusca);
    }, 500);

    return () => clearTimeout(timer);
  }, [termoBusca]);

  useEffect(() => {
    const carregarDados = async () => {
      await buscarCategoriaCadastradas();
    };
    carregarDados();
  }, []);

  useEffect(() => {
    buscarContas(1, itensPorPagina, { nome: debouncedSearchTerm });
  }, [debouncedSearchTerm]);

  const handleBuscaChange = (valor) => {
    setTermoBusca(valor);
  };

  const calcularTotais = (dados) => {
    if (!dados || !Array.isArray(dados)) {
      return {
        totalPago: 0,
        totalPendente: 0,
        totalAndamento: 0,
        totalGeral: 0,
      };
    }

    let totalPago = 0;
    let totalPendente = 0;

    dados.forEach((item) => {
      if (item.status === "Pago") {
        totalPago += item.valor_numerico;
      } else {
        totalPendente += item.valor_numerico;
      }
    });

    return {
      totalPago,
      totalPendente,
      totalAndamento: 0,
      totalGeral: totalPago + totalPendente,
    };
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handlePageChange = (novaPagina) => {
    setPaginaAtual(novaPagina);
    buscarContas(novaPagina, itensPorPagina);
  };

  const handleRowsPerPageChange = (novoLimite) => {
    setItensPorPagina(novoLimite);
    setPaginaAtual(1);
    buscarContas(1, novoLimite);
  };

  const handleImprimir = async () => {
    try {
      setLoading(true);

      const filtrosAtuais = getFiltrosAtuais();

      const response = await buscarContasReceberImprimir(filtrosAtuais);
      const dadosBrutos = response.contas || [];

      if (dadosBrutos.length === 0) {
        CustomToast({
          type: "warning",
          message: "Nenhum dado encontrado para imprimir.",
        });
        return;
      }

      const totaisResponse = await buscarContasReceberTotal(filtrosAtuais);
      const totaisRelatorio = totaisResponse?.data || {
        pago: 0,
        pendente: 0,
        total: 0,
      };

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Relatório de Contas a Receber</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #9D4B5B; color: white; text-transform: uppercase; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              h2 { color: #9D4B5B; margin-bottom: 5px; }
              .header { text-align: center; border-bottom: 2px solid #9D4B5B; padding-bottom: 10px; margin-bottom: 20px; }
              .summary { display: flex; justify-content: space-around; margin-top: 20px; padding: 15px; background: #f8f8f8; border: 1px solid #eee; border-radius: 8px; }
              .summary-item { text-align: center; }
              .summary-item span { display: block; font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
              .summary-item strong { display: block; color: #9D4B5B; font-size: 16px; }
              .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #777; }
              @media print {
                .no-print { display: none; }
                th { background-color: #9D4B5B !important; color: white !important; -webkit-print-color-adjust: exact; }
                .summary { background-color: #f8f8f8 !important; -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Relatório de Contas a Receber</h2>
              <p>Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
            </div>
            
            <div class="summary">
              <div class="summary-item">
                <span>Total Geral</span>
                <strong>${formatarMoeda(totaisRelatorio.total)}</strong>
              </div>
              <div class="summary-item">
                <span>Total Recebido</span>
                <strong>${formatarMoeda(totaisRelatorio.pago)}</strong>
              </div>
              <div class="summary-item">
                <span>Total Pendente</span>
                <strong>${formatarMoeda(totaisRelatorio.pendente)}</strong>
              </div>
              <div class="summary-item">
                <span>Qtd. Registros</span>
                <strong>${dadosBrutos.length}</strong>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${dadosBrutos
                  .map(
                    (row) => `
                  <tr>
                    <td>${row.nome || "-"}</td>
                    <td>${row.tipo || "-"}</td>
                    <td>${row.categoria || "-"}</td>
                    <td>${row.data_inicio ? new Date(row.data_inicio).toLocaleDateString("pt-BR") : "-"}</td>
                    <td>${formatarMoeda(row.valor_total || 0)}</td>
                    <td>${row.status || "-"}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="footer">
              <p>Sistema Aidê - Gestão Financeira</p>
            </div>
            <script>
              window.onload = function() { 
                setTimeout(() => {
                  window.print(); 
                  window.close();
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error("Erro ao imprimir:", error);
      CustomToast({
        type: "error",
        message: "Erro ao gerar relatório para impressão.",
      });
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    setPaginaAtual(1);
    buscarContas(1, itensPorPagina);
    setFiltro(false);
  };

  const getTotaisParaExibir = () => {
    if (totaisAPI.total > 0 || totaisAPI.pendente > 0 || totaisAPI.pago > 0) {
      return {
        totalPago: totaisAPI.pago,
        totalPendente: totaisAPI.pendente,
        totalGeral: totaisAPI.total,
      };
    }

    return calcularTotais(contasReceberVi);
  };

  const totais = useMemo(
    () => getTotaisParaExibir(),
    [totaisAPI, contasReceberVi],
  );

  const ContasReceberContent = () => (
    <>
      <div className="flex itens-center gap-2 w-full mb-3">
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
            <MonetizationOnIcon /> Total Pago: {formatarMoeda(totais.totalPago)}
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
            <MonetizationOnIcon /> Total Pendente:{" "}
            {formatarMoeda(totais.totalPendente)}
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
            <MonetizationOnIcon /> Total: {formatarMoeda(totais.totalGeral)}
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
          onChange={(e) => handleBuscaChange(e.target.value)}
          sx={{ width: { xs: "72%", sm: "50%", md: "40%", lg: "40%" } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <ButtonComponent
          startIcon={<AddCircleOutline fontSize="small" />}
          title={"Cadastrar"}
          subtitle={"Cadastrar"}
          buttonSize="large"
          onClick={() => setCadastroUsuario(true)}
        />
        <ButtonComponent
          startIcon={<FilterAlt fontSize="small" />}
          title={"Filtrar"}
          subtitle={"Filtrar"}
          buttonSize="large"
          onClick={() => setFiltro(true)}
        />
        <ButtonComponent
          startIcon={<Print fontSize="small" />}
          title={"Imprimir"}
          subtitle={"Imprimir"}
          buttonSize="large"
          onClick={handleImprimir}
        />
      </div>
      <div className="w-full flex itens-center  justify-center">
        {loading ? (
          <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
            <TableLoading />
            <label className="text-xs text-primary">
              Carregando Informações !
            </label>
          </div>
        ) : contasReceberVi.length > 0 ? (
          <TableComponent
            forceShowDelete={true}
            headers={headerContasReceber}
            rows={contasReceberVi}
            actionsLabel={"Ações"}
            actionCalls={{
              view: (row) => Informacoes(row),
              delete: (row) => handleDelete(row.id),
            }}
            pagination={true}
            totalRows={totalItens}
            page={paginaAtual}
            rowsPerPage={itensPorPagina}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        ) : (
          <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
            <TableLoading />
            <label className="text-xs">
              Nenhuma conta a receber encontrada!
            </label>
          </div>
        )}
      </div>
    </>
  );

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
          <HeaderPerfil pageTitle="Contas à Receber" />
          <div className=" items-center justify-center lg:justify-start w-full flex mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="hidden md:block md:w-[60%] lg:w-[15%]">
              <HeaderFinanceiro />
            </div>
            <div className="w-[100%] itens-center mt-2 ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[80%]">
              <ContasReceberContent />

              {/* Modais - sempre disponíveis */}
              <CadastrarContaReceber
                cadastroUsuario={cadastroUsuario}
                setCadastroUsuario={setCadastroUsuario}
                categoriasCadastradas={categoriasCadastradas}
                onCadastroSuccess={() =>
                  buscarContas(paginaAtual, itensPorPagina)
                }
              />
              <EditarContaREceber
                informacoes={informacoes}
                handleClosInformacoes={handleCloseInformacoesInfo}
                contaSelecionada={contaSelecionada}
                categoriasCadastradas={categoriasCadastradas}
                onUpdateSuccess={() =>
                  buscarContas(paginaAtual, itensPorPagina)
                }
              />
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
                      value={filtroDataInicio}
                      onChange={(e) => setFiltroDataInicio(e.target.value)}
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
                      value={filtroDataFim}
                      onChange={(e) => setFiltroDataFim(e.target.value)}
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
                    <Autocomplete
                      fullWidth
                      size="small"
                      options={categoriasCadastradas}
                      getOptionLabel={(option) => option.nome || ""}
                      value={categoriasCadastradas.find(c => c.id === filtroCategoria) || null}
                      onChange={(event, newValue) => setFiltroCategoria(newValue ? newValue.id : "")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Categoria"
                          variant="outlined"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <Category />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      sx={{
                        width: { xs: "47%", sm: "50%", md: "40%", lg: "47%" },
                      }}
                    />

                    <FormControl
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{
                        width: { xs: "47%", sm: "50%", md: "40%", lg: "47%" },
                      }}
                    >
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        label="Status"
                        startAdornment={
                          <InputAdornment position="start">
                            <StarOutlineSharp />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="1">Pendente</MenuItem>
                        <MenuItem value="2">Pago</MenuItem>
                        <MenuItem value="3">Atrasado</MenuItem>
                        <MenuItem value="4">Em Andamento</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{
                        width: { xs: "95%", sm: "95%", md: "95%", lg: "97%" },
                      }}
                    >
                      <InputLabel id="tipo-custo-label">Tipo de Custo</InputLabel>
                      <Select
                        labelId="tipo-custo-label"
                        value={filtroTipoCusto}
                        onChange={(e) => setFiltroTipoCusto(e.target.value)}
                        label="Tipo de Custo"
                      >
                        <MenuItem value="todos">Todos</MenuItem>
                        <MenuItem value="fixo">Custo Fixo</MenuItem>
                        <MenuItem value="variavel">Custo Variável</MenuItem>
                      </Select>
                    </FormControl>
                    <div className="flex items-end justify-end w-full gap-2">
                      <ButtonComponent
                        title={"Limpar"}
                        subtitle={"Limpar"}
                        buttonSize="large"
                        onClick={LimparFiltros}
                      />
                      <ButtonComponent
                        startIcon={<SearchIcon fontSize="small" />}
                        title={"Aplicar"}
                        subtitle={"Aplicar"}
                        buttonSize="large"
                        onClick={aplicarFiltros}
                      />
                    </div>
                  </div>
                </div>
              </CentralModal>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContasReceber;
