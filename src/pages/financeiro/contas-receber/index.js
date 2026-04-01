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
} from "@mui/icons-material";
import {
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
import { buscarContasReceber } from "../../../service/get/contas-receber";
import { headerContasReceber } from "../../../entities/header/financeiro/contas-receber";
import { deletarContasReceber } from "../../../service/delete/contas-receber";
import CadastrarContaReceber from "./cadastro";
import EditarContaREceber from "./editar-conta-receber";
import { buscarContasReceberTotal } from "../../../service/get/contas-receber-totais";
import ComissaoServico from "./comissao-servicos";

const ContasReceber = () => {
  const [informacoes, setInformacoes] = useState(false);
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState("contas");
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState(false);
  const [parcelas, setParcelas] = useState(false);
  const [categoriasCadastradas, setCategoriasCadastradas] = useState([]);
  const [contasReceberVi, setContasReceberVi] = useState([]);
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");

  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [totalItens, setTotalItens] = useState(0);
  const [totaisAPI, setTotaisAPI] = useState({
    pendente: 0,
    pago: 0,
    total: 0,
  });

  const buscarTotaisAPI = async () => {
    try {
      const filtros = getFiltrosAtuais();
      const response = await buscarContasReceberTotal(filtros);

      if (response && response.success) {
        setTotaisAPI({
          pendente: parseFloat(response.data.pendente || 0),
          pago: parseFloat(response.data.pago || 0),
          total: parseFloat(response.data.total || 0),
        });
      }
    } catch (error) {
      console.error("Erro ao buscar totais da API:", error);
    }
  };

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
    buscarContas(1, itensPorPagina, {
      termoBusca: "",
      dataInicio: "",
      dataFim: "",
      categoria: "",
      status: "",
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

    return dadosApi.map((conta) => {
      const dataFormatada = new Date(conta.data).toLocaleDateString("pt-BR");

      const valorFormatado = `R$ ${parseFloat(conta.valor)
        .toFixed(2)
        .replace(".", ",")}`;

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
    const carregarDados = async () => {
      await buscarCategoriaCadastradas();
      await buscarContas(1, itensPorPagina);
      await buscarTotaisAPI();
    };
    carregarDados();
  }, []);

  const handleBuscaChange = (valor) => {
    setTermoBusca(valor);
    const timeoutId = setTimeout(() => {
      buscarContas(1, itensPorPagina, { nome: valor });
    }, 500);

    return () => clearTimeout(timeoutId);
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
              <div className="flex items-center bg-gray-100 p-1 rounded-lg w-fit mb-4">
                <button
                  onClick={() => setSecaoAtiva("contas")}
                  className={`
      px-6 py-2 text-xs font-bold rounded-md transition-all duration-200
      ${
        secaoAtiva === "contas"
          ? "bg-[#9D4B5B] text-white  font-bold shadow-md"
          : "text-gray-600 font-bold hover:text-[#9D4B5B]"
      }
    `}
                >
                  Contas a Receber
                </button>
                <button
                  onClick={() => setSecaoAtiva("comissao")}
                  className={`
      px-6 py-2 text-xs font-boldrounded-md transition-all duration-200
      ${
        secaoAtiva === "comissao"
          ? "bg-[#9D4B5B] text-white  font-bold shadow-md"
          : "text-gray-600  font-bold hover:text-[#9D4B5B]"
      }
    `}
                >
                  Comissão de Serviços
                </button>
              </div>

              {/* CONTEÚDO - ALTERNAR ENTRE OS COMPONENTES */}
              {secaoAtiva === "contas" ? (
                <ContasReceberContent />
              ) : (
                <div className="w-full">
                  <ComissaoServico
                    onVoltar={() => setSecaoAtiva("contas")}
                    isActive={true}
                  />
                </div>
              )}

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
                    <FormControl
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{
                        width: { xs: "47%", sm: "50%", md: "40%", lg: "47%" },
                      }}
                    >
                      <InputLabel id="categoria-label">Categoria</InputLabel>
                      <Select
                        labelId="categoria-label"
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        label="Categoria"
                        startAdornment={
                          <InputAdornment position="start">
                            <Category />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="">Todas</MenuItem>
                        <MenuItem value="Conta à Receber">
                          Conta à Receber
                        </MenuItem>
                      </Select>
                    </FormControl>

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
                        <MenuItem value="Pendente">Pendente</MenuItem>
                        <MenuItem value="Pago">Pago</MenuItem>
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
