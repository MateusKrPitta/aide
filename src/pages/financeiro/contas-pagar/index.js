import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../../components/navbars/header";
import HeaderPerfil from "../../../components/navbars/perfil";
import ButtonComponent from "../../../components/button";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CentralModal from "../../../components/modal-central";
import TransformIcon from "@mui/icons-material/Transform";
import MenuMobile from "../../../components/menu-mobile";
import ModalLateral from "../../../components/modal-lateral";
import {
  AddCircleOutline,
  Article,
  Category,
  DateRange,
  FilterAlt,
  MonetizationOn,
  Money,
  Person,
  Print,
  Save,
} from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";
import TableLoading from "../../../components/loading/loading-table/loading";
import TableComponent from "../../../components/table";
import HeaderFinanceiro from "../../../components/navbars/financeiro";
import { headerContasPagar } from "../../../entities/header/financeiro/contas-pagar";
import { Checkbox, FormControlLabel } from "@mui/material";
import CustomToast from "../../../components/toast";
import { buscarPretadores } from "../../../service/get/prestadores";
import { criarContasPagar } from "../../../service/post/contas-pagar";
import { buscarContasPagar } from "../../../service/get/contas-pagar";
import { buscarCategoria } from "../../../service/get/categoria";
import { contasPagarem } from "../../../entities/class/contas";
import { deletarContas } from "../../../service/delete/contas";
import { atualizarParcelaContasPagar } from "../../../service/put/atualiza-parcela-contas-pagar";

import { buscarTotalContasPagar } from "../../../service/get/total-contas-pagar";
import ContasPagarServico from "./servico";
import { atualizarContasPagar } from "../../../service/put/contas-pagar";
import { buscarContasPagarId } from "../../../service/get/contas-pagar-id";
import { exportContasPagarToPDF } from "./imprimir";
import { buscarContasImprimir } from "../../../service/get/imprimir-contas-pagar";

const ContasPagar = () => {
  const [tipoCusto, setTipoCusto] = useState("fixo");
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState(false);
  const [modalParcelas, setModalParcelas] = useState(false);
  const [loadingPrestadores, setLoadingPrestadores] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [contaEditando, setContaEditando] = useState(null);
  const [loadingTotais, setLoadingTotais] = useState(false);
  const [listaPrestadores, setListaPrestadores] = useState([]);
  const [contas, setContas] = useState([]);
  const [prestadorSelecionado, setPrestadorSelecionado] = useState("");
  const [nomeConta, setNomeConta] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [dataVariavel, setDataVariavel] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [statusPagamento, setStatusPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoPrestador, setNovoPrestador] = useState("");
  const [dataInicioFiltro, setDataInicioFiltro] = useState("");
  const [dataFimFiltro, setDataFimFiltro] = useState("");
  const [statusPagamentoFiltro, setStatusPagamentoFiltro] = useState("");
  const [valor, setValor] = useState("");
  const [contasPagar, setContasPagar] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [categoriasCadastradas, setCategoriasCadastradas] = useState([]);
  const [parcelasConta, setParcelasConta] = useState([]);
  const [parcelasEditando, setParcelasEditando] = useState({});
  const [loadingParcelas, setLoadingParcelas] = useState({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [mostrarServicos, setMostrarServicos] = useState(false);

  const [totais, setTotais] = useState({
    total_pago: 0,
    total_pendente: 0,
    total_geral: 0,
    quantidade_contas: 0,
  });

  const categoriasAtivas = categoriasCadastradas.filter(
    (categoria) => categoria.ativo,
  );

  const prestadoresAtivos = listaPrestadores.filter(
    (prestador) => prestador.ativo,
  );

  const fetchContasPagarComPaginacao = async (
    pagina = 1,
    itensPorPagina = 10,
  ) => {
    try {
      setLoading(true);

      const filters = {
        data_inicio: dataInicioFiltro,
        data_fim: dataFimFiltro,
        categoria_id: categoriaFiltro,
        status_pagamento: statusPagamentoFiltro,
        search: termoBusca,
      };

      Object.keys(filters).forEach((key) => {
        if (!filters[key] || filters[key] === "") {
          delete filters[key];
        }
      });

      if (filters.status_pagamento) {
        const statusMap = {
          1: "Pendente",
          2: "Pago",
          3: "Em andamento",
        };
        filters.status_pagamento = statusMap[filters.status_pagamento];
      }

      const response = await buscarContasPagar(pagina, itensPorPagina, filters);

      setContasPagar(response.data || []);
      setTotalPaginas(parseInt(response.lastPage) || 1);
      setTotalRegistros(parseInt(response.total) || 0);
      setPaginaAtual(pagina);
      setItensPorPagina(itensPorPagina);

      return response;
    } catch (error) {
      console.error("Erro ao buscar contas pagar:", error);
      CustomToast({
        type: "error",
        message: "Erro ao carregar contas",
      });
      setContasPagar([]);
    } finally {
      setLoading(false);
    }
  };

  const handleParcelaChange = (parcelaId, field, value) => {
    setParcelasEditando((prev) => ({
      ...prev,
      [parcelaId]: {
        ...(prev[parcelaId] || parcelasConta.find((p) => p.id === parcelaId)),
        [field]: value,
      },
    }));
  };

  const formatCurrency = (value) => {
    return `R$ ${parseFloat(value || 0)
      .toFixed(2)
      .replace(".", ",")}`;
  };

  const handleImprimir = async () => {
    try {
      setLoading(true);

      const filtrosAtuais = {
        search: termoBusca,
        data_inicio: dataInicioFiltro,
        data_fim: dataFimFiltro,
        categoria_id: categoriaFiltro,
        status_geral: statusPagamentoFiltro,
      };

      Object.keys(filtrosAtuais).forEach((key) => {
        if (!filtrosAtuais[key] || filtrosAtuais[key] === "") {
          delete filtrosAtuais[key];
        }
      });

      const dadosImpressao = await buscarContasImprimir(filtrosAtuais);

      if (!dadosImpressao) {
        throw new Error("Dados não encontrados");
      }

      const contasParaImpressao = dadosImpressao.contas || [];

      const totaisResponse = await buscarTotalContasPagar(filtrosAtuais);

      const totaisParaImpressao = {
        total_geral: totaisResponse?.total_geral || 0,
        total_pago: totaisResponse?.total_pago || 0,
        total_pendente: totaisResponse?.total_pendente || 0,
        quantidade_contas:
          totaisResponse?.quantidade_contas || contasParaImpressao.length,
      };

      let categoriaNome = "";
      if (categoriaFiltro && categoriasCadastradas.length > 0) {
        const categoriaEncontrada = categoriasCadastradas.find(
          (cat) => cat.id === parseInt(categoriaFiltro),
        );
        categoriaNome = categoriaEncontrada ? categoriaEncontrada.nome : "";
      }

      const filtrosExibicao = {
        search: termoBusca || undefined,
        dataInicio: dataInicioFiltro || undefined,
        dataFim: dataFimFiltro || undefined,
        categoria: categoriaNome,
        status: statusPagamentoFiltro || undefined,
      };

      Object.keys(filtrosExibicao).forEach((key) => {
        if (!filtrosExibicao[key]) {
          delete filtrosExibicao[key];
        }
      });

      console.log("Filtros para exibição:", filtrosExibicao);

      const nomeArquivo = `relatorio_contas_pagar_${new Date().toISOString().split("T")[0]}.pdf`;

      await exportContasPagarToPDF(
        contasParaImpressao,
        totaisParaImpressao,
        filtrosExibicao,
        nomeArquivo,
      );

      CustomToast({
        type: "success",
        message: "Relatório gerado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao imprimir:", error);
      CustomToast({
        type: "error",
        message: error.message || "Erro ao gerar relatório",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateParcela = async (parcelaId) => {
    setLoadingParcelas((prev) => ({ ...prev, [parcelaId]: true }));

    try {
      const parcelaEditada = parcelasEditando[parcelaId];
      if (!parcelaEditada) {
        throw new Error("Parcela não encontrada");
      }

      if (parcelaEditada.custo_variavel) {
        const isPago = parcelaEditada.status === 2;
        const isEmAndamento = parcelaEditada.status === 3;

        let dataPagamentoEnviar = parcelaEditada.data_pagamento;

        if (isPago && !dataPagamentoEnviar) {
          dataPagamentoEnviar = new Date().toISOString().split("T")[0];
        }

        if (!isPago) {
          dataPagamentoEnviar = null;
        }

        const dadosParaEnviar = {
          status_geral: parcelaEditada.status,
          data_pagamento: dataPagamentoEnviar,
          nome: parcelaEditada.originalData?.nome,
          valor_total: parcelaEditada.originalData?.valor_total,
          categoria_id: parcelaEditada.originalData?.categoria_id,
          prestador_id: parcelaEditada.originalData?.prestador_id,
          data_inicio: parcelaEditada.originalData?.data_inicio,
          custo_fixo: false,
          custo_variavel: true,
        };

        const response = await atualizarContasPagar(dadosParaEnviar, parcelaId);

        setParcelasConta((prev) =>
          prev.map((p) =>
            p && p.id === parcelaId
              ? {
                  ...p,
                  status: response.status_geral || parcelaEditada.status,
                  data_pagamento:
                    response.data_pagamento || dataPagamentoEnviar,
                  status_texto:
                    response.status_geral === 2
                      ? "Pago"
                      : response.status_geral === 3
                        ? "Em andamento"
                        : "Pendente",
                }
              : p,
          ),
        );
      } else {
        const dadosParaEnviar = {
          descricao: parcelaEditada.descricao,
          data_vencimento: parcelaEditada.data_vencimento,
          data_pagamento: parcelaEditada.data_pagamento || null,
          valor: parcelaEditada.valor,
          status: parcelaEditada.status,
          forma_pagamento: parcelaEditada.forma_pagamento,
        };

        const response = await atualizarParcelaContasPagar(
          parcelaId,
          dadosParaEnviar,
        );

        setParcelasConta((prev) =>
          prev.map((p) => (p && p.id === parcelaId ? response.data : p)),
        );
      }

      setParcelasEditando((prev) => {
        const newState = { ...prev };
        delete newState[parcelaId];
        return newState;
      });

      await fetchTotais();
      await fetchContasPagarComPaginacao(paginaAtual, itensPorPagina);

      CustomToast({
        type: "success",
        message: parcelaEditada.custo_variavel
          ? "Conta atualizada com sucesso!"
          : "Parcela atualizada com sucesso!",
      });

      setModalParcelas(false);
      setParcelasConta([]);
      setParcelasEditando({});
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      CustomToast({
        type: "error",
        message:
          error.response?.data?.error || error.message || "Erro ao atualizar",
      });
    } finally {
      setLoadingParcelas((prev) => ({ ...prev, [parcelaId]: false }));
    }
  };

  const handleVisualizarParcelas = async (row) => {
    try {
      setLoadingParcelas(true);

      if (row.tipo === "Conta") {
        const contaDetalhada = await buscarContasPagarId(row.id || row._id);

        if (!contaDetalhada) {
          CustomToast({
            type: "error",
            message: "Não foi possível carregar os detalhes da conta",
          });
          return;
        }

        setContaEditando(contaDetalhada);

        if (contaDetalhada.custo_variavel) {
          const parcelaVirtual = {
            id: contaDetalhada.id,
            conta_pagar_id: contaDetalhada.id,
            descricao: "Pagamento Único",
            data_vencimento: contaDetalhada.data_inicio,
            data_pagamento: contaDetalhada.data_pagamento,
            valor: contaDetalhada.valor_total,
            status: contaDetalhada.status_geral || 1,
            forma_pagamento: null,
            tipo: "Conta",
            custo_variavel: true,
            originalData: contaDetalhada,
          };
          setParcelasConta([parcelaVirtual]);
        } else {
          const parcelasFormatadas = (contaDetalhada.parcelas || [])
            .filter((p) => p && p.id)
            .map((p) => ({
              ...p,
              tipo: "Conta",
              custo_variavel: false,
              originalData: contaDetalhada,
              status: p.status || 1,
              status_texto:
                p.status_texto ||
                (p.status === 2
                  ? "Pago"
                  : p.status === 3
                    ? "Em andamento"
                    : "Pendente"),
            }));

          setParcelasConta(parcelasFormatadas);
        }
      } else if (row.tipo === "Serviço") {
        const servico = row.originalData?.servico || row.originalData;
        const parcelasServico = servico?.parcelas || [];

        const parcelasFormatadas = parcelasServico.map((parcela) => ({
          id: parcela.id,
          conta_pagar_id: servico.id,
          descricao: `Parcela ${parcela.numero_parcela}/${servico.numero_parcelas}`,
          data_vencimento: parcela.data_pagamento,
          data_pagamento: parcela.data_pagamento,
          valor: parcela.valor_parcela,
          valor_prestador: parcela.valor_prestador,
          status: parcela.status_pagamento_prestador || 1,
          status_pagamento_prestador: parcela.status_pagamento_prestador,
          forma_pagamento: servico.metodo_pagamento,
          tipo: "Serviço",
          custo_variavel: false,
          originalData: row.originalData,
        }));

        setParcelasConta(parcelasFormatadas.filter((p) => p && p.id));
      }

      setModalParcelas(true);
    } catch (error) {
      console.error("Erro ao visualizar parcelas:", error);
      CustomToast({
        type: "error",
        message: error.message || "Erro ao carregar detalhes da conta",
      });
    } finally {
      setLoadingParcelas(false);
    }
  };

  const FecharFiltro = () => setFiltro(false);
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      const ano = date.getUTCFullYear();
      const mes = String(date.getUTCMonth() + 1).padStart(2, "0");
      const dia = String(date.getUTCDate()).padStart(2, "0");

      const resultado = `${ano}-${mes}-${dia}`;
      return resultado;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "";
    }
  };

  const FecharCadastroUsuario = () => {
    limparFormulario();
    setCadastroUsuario(false);
  };

  const validarCampos = () => {
    const camposObrigatorios = nomeConta && valor;

    if (tipoCusto === "fixo") {
      return camposObrigatorios && dataInicio;
    }

    if (tipoCusto === "variavel") {
      return camposObrigatorios && dataVariavel;
    }

    return false;
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const handleCadastrar = async () => {
    try {
      setLoading(true);

      const valorNumerico = parseFloat(
        valor.replace("R$", "").replace(",", ".").trim(),
      );

      const dataInicioFormatada =
        tipoCusto === "fixo" ? dataInicio : dataVariavel;

      let valorTotal = valorNumerico;
      if (tipoCusto === "fixo" && dataInicio && dataFim) {
        const diffInMonths = monthDiff(new Date(dataInicio), new Date(dataFim));
        valorTotal = valorNumerico * (diffInMonths + 1);
      }

      const isPago = statusPagamento === 2;

      const dadosParaEnviar = {
        nome: nomeConta,
        custo_fixo: tipoCusto === "fixo",
        custo_variavel: tipoCusto === "variavel",
        data_inicio: dataInicioFormatada,
        data_fim: tipoCusto === "fixo" ? dataFim : null,
        valor_mensal: valorNumerico,
        valor_total: valorTotal,
        prestador_id: prestadorSelecionado || null,
        status_geral: tipoCusto === "variavel" ? statusPagamento || 1 : 1,
        data_pagamento:
          tipoCusto === "variavel" && isPago ? dataVariavel : null,
        categoria_id: categoriaSelecionada || null,
      };

      if (tipoCusto === "variavel" && isPago && !dataVariavel) {
        CustomToast({
          type: "error",
          message: "Data é obrigatória para contas pagas",
        });
        return;
      }

      await criarContasPagar(dadosParaEnviar);

      CustomToast({
        type: "success",
        message: "Conta cadastrada com sucesso!",
      });

      await fetchTotais();
      await fetchContasPagarComPaginacao(1, itensPorPagina);

      setCadastroUsuario(false);
      limparFormulario();
    } catch (error) {
      CustomToast({
        type: "error",
        message: error.response?.data?.message || "Erro ao cadastrar conta",
      });
    } finally {
      setLoading(false);
    }
  };

  function monthDiff(dateFrom, dateTo) {
    return (
      dateTo.getMonth() -
      dateFrom.getMonth() +
      12 * (dateTo.getFullYear() - dateFrom.getFullYear())
    );
  }
  const limparFormulario = () => {
    setNomeConta("");
    setPrestadorSelecionado("");
    setDataInicio("");
    setDataFim("");
    setDataVariavel("");
    setStatusPagamento("");
    setFormaPagamento("");
    setValor("");
    setCategoriaSelecionada("");
  };

  const handleDeleteConta = async (id) => {
    try {
      setLoading(true);

      await deletarContas(id);

      await fetchTotais();
      await fetchContasPagarComPaginacao(paginaAtual, itensPorPagina);

      CustomToast({ type: "success", message: "Conta excluída com sucesso!" });
    } catch (error) {
      console.error("❌ Erro no handleDeleteConta:", error);
      console.error("Response:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotais = async () => {
    try {
      setLoadingTotais(true);
      const response = await buscarTotalContasPagar();
      setTotais(
        response || {
          total_pago: 0,
          total_pendente: 0,
          total_geral: 0,
          quantidade_contas: 0,
        },
      );
    } catch (error) {
      console.error("Erro ao buscar totais:", error);
      setTotais({
        total_pago: 0,
        total_pendente: 0,
        total_geral: 0,
        quantidade_contas: 0,
      });
    } finally {
      setLoadingTotais(false);
    }
  };

  const handleAbrirFiltro = async () => {
    try {
      if (categoriasCadastradas.length === 0) {
        const response = await buscarCategoria();
        setCategoriasCadastradas(response.data || []);
      }
      setFiltro(true);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      CustomToast({
        type: "error",
        message: "Erro ao carregar categorias para filtro",
      });
    }
  };

  const handleAbrirModalCadastro = async () => {
    setCadastroUsuario(true);

    try {
      setLoadingPrestadores(true);
      setLoadingCategorias(true);

      const [prestadoresResponse, categoriasResponse] = await Promise.all([
        buscarPretadores(),
        buscarCategoria(),
      ]);

      setListaPrestadores(prestadoresResponse.data || []);
      setCategoriasCadastradas(categoriasResponse.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      CustomToast({
        type: "error",
        message: "Erro ao carregar prestadores e categorias",
      });
    } finally {
      setLoadingPrestadores(false);
      setLoadingCategorias(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchContasPagarComPaginacao(paginaAtual, itensPorPagina);
        await fetchTotais();
      } catch (error) {
        CustomToast({
          type: "error",
          message: "Erro ao carregar contas",
        });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTotaisComFiltros = async () => {
      try {
        setLoadingTotais(true);
        const queryParams = new URLSearchParams();

        if (dataInicioFiltro)
          queryParams.append("data_inicio", dataInicioFiltro);
        if (dataFimFiltro) queryParams.append("data_fim", dataFimFiltro);
        if (categoriaFiltro)
          queryParams.append("categoria_id", categoriaFiltro);
        if (statusPagamentoFiltro)
          queryParams.append("status_geral", statusPagamentoFiltro);

        const queryString = queryParams.toString();
        const url = queryString
          ? `/contas-pagar/totais?${queryString}`
          : "/contas-pagar/totais";
        await fetchTotais();
      } catch (error) {
        console.error("Erro ao buscar totais com filtros:", error);
      } finally {
        setLoadingTotais(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchTotaisComFiltros();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [dataInicioFiltro, dataFimFiltro, categoriaFiltro, statusPagamentoFiltro]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchContasPagarComPaginacao(1, itensPorPagina);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    dataInicioFiltro,
    dataFimFiltro,
    categoriaFiltro,
    statusPagamentoFiltro,
    termoBusca,
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
          <HeaderPerfil pageTitle="Contas à Pagar" />
          <div className=" items-center justify-center lg:justify-start w-full flex mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="hidden md:block md:w-[60%] lg:w-[15%]">
              <HeaderFinanceiro />
            </div>
            <div className="w-[100%] itens-center mt-2 ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[82%]">
              <div className="flex itens-start flex-wrap gap-2 w-full mb-3">
                <ContasPagarServico
                  onClick={() => setMostrarServicos(!mostrarServicos)}
                  isActive={mostrarServicos}
                />
                {!mostrarServicos && (
                  <>
                    <div className="flex items-center justify-center w-[27%]">
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
                        <MonetizationOnIcon /> Pendente:{" "}
                        {loadingTotais ? (
                          <CircularProgress size={16} />
                        ) : (
                          formatCurrency(totais.total_pendente)
                        )}
                      </label>
                    </div>
                    <div className="flex items-center justify-center w-[28%]">
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
                        <MonetizationOnIcon /> Pago:{" "}
                        {loadingTotais ? (
                          <CircularProgress size={16} />
                        ) : (
                          formatCurrency(totais.total_pago)
                        )}
                      </label>
                    </div>
                    <div className="flex items-center justify-center  w-[30%]">
                      <label
                        className="flex w-[100%] items-center justify-center text-xs gap-4 font-bold"
                        style={{
                          backgroundColor: "#9D4B5B",
                          color: "white",
                          borderRadius: "10px",
                          padding: "10px",
                        }}
                      >
                        <MonetizationOnIcon /> Total:{" "}
                        {loadingTotais ? (
                          <CircularProgress size={16} />
                        ) : (
                          formatCurrency(totais.total_geral)
                        )}
                      </label>
                    </div>
                  </>
                )}
              </div>
              {!mostrarServicos && (
                <>
                  <div className="flex gap-2 flex-wrap w-full items-center justify-center md:justify-start">
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Pesquisar"
                      autoComplete="off"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      sx={{
                        width: { xs: "72%", sm: "50%", md: "40%", lg: "40%" },
                      }}
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
                      onClick={handleAbrirModalCadastro}
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
                    {loading ? (
                      <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
                        <TableLoading />
                        <label className="text-xs text-primary">
                          Carregando Informações !
                        </label>
                      </div>
                    ) : contasPagar.length > 0 ? (
                      <>
                        <TableComponent
                          headers={headerContasPagar}
                          rows={contasPagarem(contasPagar)}
                          actionsLabel={"Ações"}
                          actionCalls={{
                            view: (row) => handleVisualizarParcelas(row),
                            delete: (row) =>
                              handleDeleteConta(row.id || row._id),
                          }}
                          pagination={true}
                          forceShowDelete={true}
                          totalRows={totalRegistros}
                          page={paginaAtual}
                          rowsPerPage={itensPorPagina}
                          onPageChange={(newPage) => {
                            fetchContasPagarComPaginacao(
                              newPage,
                              itensPorPagina,
                            );
                          }}
                          onRowsPerPageChange={(newRowsPerPage) => {
                            setItensPorPagina(newRowsPerPage);
                            fetchContasPagarComPaginacao(1, newRowsPerPage);
                          }}
                        />
                      </>
                    ) : (
                      <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                        <TableLoading />
                        <label className="text-sm">
                          {termoBusca
                            ? `Nenhum resultado encontrado para "${termoBusca}"`
                            : "Nenhuma conta encontrada!"}
                        </label>
                      </div>
                    )}
                  </div>
                </>
              )}
              <CentralModal
                tamanhoTitulo={"81%"}
                maxHeight={"90vh"}
                top={"20%"}
                left={"28%"}
                width={"500px"}
                icon={<AddCircleOutline fontSize="small" />}
                open={cadastroUsuario}
                onClose={FecharCadastroUsuario}
                title="Cadastrar Conta"
              >
                <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
                  {loadingPrestadores || loadingCategorias ? (
                    <div className="flex justify-center items-center h-40">
                      <CircularProgress />
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-4 mb-4">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={tipoCusto === "fixo"}
                              onChange={() => setTipoCusto("fixo")}
                              color="primary"
                            />
                          }
                          label="Custo Fixo"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={tipoCusto === "variavel"}
                              onChange={() => setTipoCusto("variavel")}
                              color="primary"
                            />
                          }
                          label="Custo Variável"
                        />
                      </div>

                      <div className="mt-4 flex gap-3 flex-wrap">
                        {/* Campo Nome */}
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Nome"
                          name="nome"
                          value={nomeConta}
                          onChange={(e) => setNomeConta(e.target.value)}
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "95%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Article />
                              </InputAdornment>
                            ),
                          }}
                        />

                        {tipoCusto === "fixo" && (
                          <>
                            <TextField
                              fullWidth
                              variant="outlined"
                              size="small"
                              label="Data Início"
                              type="date"
                              value={dataInicio}
                              onChange={(e) => setDataInicio(e.target.value)}
                              sx={{
                                width: {
                                  xs: "100%",
                                  sm: "50%",
                                  md: "40%",
                                  lg: "47%",
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
                              label="Data Fim"
                              type="date"
                              value={dataFim}
                              onChange={(e) => setDataFim(e.target.value)}
                              sx={{
                                width: {
                                  xs: "100%",
                                  sm: "50%",
                                  md: "40%",
                                  lg: "45%",
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
                          </>
                        )}

                        {/* Campo de Data (para custo variável) */}
                        {tipoCusto === "variavel" && (
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Data"
                            type="date"
                            value={dataVariavel}
                            onChange={(e) => setDataVariavel(e.target.value)}
                            sx={{
                              width: {
                                xs: "100%",
                                sm: "50%",
                                md: "40%",
                                lg: "45%",
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
                        )}

                        <Autocomplete
                          fullWidth
                          options={categoriasAtivas}
                          getOptionLabel={(option) => option.nome}
                          value={
                            categoriasAtivas.find(
                              (cat) => cat.id === categoriaSelecionada,
                            ) || null
                          }
                          onChange={(event, newValue) => {
                            setCategoriaSelecionada(
                              newValue ? newValue.id : "",
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              size="small"
                              label="Categoria"
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
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "47%",
                            },
                          }}
                          disabled={loadingCategorias}
                          freeSolo={false}
                          noOptionsText="Nenhuma categoria encontrada"
                        />

                        <TextField
                          fullWidth
                          variant="outlined"
                          type="number"
                          size="small"
                          label="Valor Mensal"
                          value={valor}
                          onChange={(e) => setValor(e.target.value)}
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "45%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MonetizationOn />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <Autocomplete
                          fullWidth
                          options={prestadoresAtivos}
                          getOptionLabel={(option) => option.nome}
                          value={
                            prestadoresAtivos.find(
                              (prest) => prest.id === prestadorSelecionado,
                            ) || null
                          }
                          onChange={(event, newValue) => {
                            setPrestadorSelecionado(
                              newValue ? newValue.id : "",
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              size="small"
                              label="Prestador"
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
                              }}
                            />
                          )}
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "95%",
                            },
                          }}
                          disabled={loadingPrestadores}
                          freeSolo={false}
                          noOptionsText="Nenhum prestador encontrado"
                        />
                      </div>

                      <div className="flex w-[96%] items-end justify-end mt-2 ">
                        <ButtonComponent
                          startIcon={<AddCircleOutline fontSize="small" />}
                          title={"Cadastrar"}
                          subtitle={"Cadastrar"}
                          buttonSize="large"
                          disabled={
                            !validarCampos() ||
                            loading ||
                            loadingPrestadores ||
                            loadingCategorias
                          }
                          onClick={handleCadastrar}
                        />
                      </div>
                    </>
                  )}
                </div>
              </CentralModal>

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
                    {/* Filtro por Data Início */}
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
                          md: "100%",
                          lg: "47%",
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

                    {/* Filtro por Data Fim */}
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
                          md: "100%",
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

                    <Autocomplete
                      fullWidth
                      options={categoriasCadastradas}
                      getOptionLabel={(option) => option.nome}
                      value={
                        categoriasCadastradas.find(
                          (cat) => cat.id === categoriaFiltro,
                        ) || null
                      }
                      onChange={(event, newValue) => {
                        setCategoriaFiltro(newValue ? newValue.id : "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          label="Categoria"
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
                        width: {
                          xs: "100%",
                          sm: "100%",
                          md: "100%",
                          lg: "48%",
                        },
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
                          md: "100%",
                          lg: "47%",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TransformIcon />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="">Todos Status</MenuItem>
                      <MenuItem value="1">Pendente</MenuItem>
                      <MenuItem value="2">Pago</MenuItem>
                      <MenuItem value="3">Em Andamento</MenuItem>
                    </TextField>
                    {/* Botões de Ação */}
                    <div className="flex w-full justify-between gap-2 mt-2">
                      <ButtonComponent
                        title={"Limpar Filtros"}
                        buttonSize="large"
                        onClick={() => {
                          setDataInicioFiltro("");
                          setDataFimFiltro("");
                          setCategoriaFiltro("");
                          setStatusPagamentoFiltro("");
                        }}
                        variant="outlined"
                      />

                      <ButtonComponent
                        startIcon={<SearchIcon fontSize="small" />}
                        title={"Aplicar Filtros"}
                        subtitle={"Aplicar"}
                        buttonSize="large"
                        onClick={FecharFiltro}
                      />
                    </div>
                  </div>
                </div>
              </CentralModal>

              <ModalLateral
                open={modalParcelas}
                handleClose={() => {
                  setModalParcelas(false);
                  setParcelasEditando({});
                  setParcelasConta([]);
                }}
                tituloModal={`Parcelas - ${contaEditando?.nome || ""}`}
                icon={<Article />}
                tamanhoTitulo="75%"
                conteudo={
                  <div
                    className="flex flex-col gap-4 w-full"
                    style={{ maxHeight: "500px", overflow: "auto" }}
                  >
                    {loadingParcelas ? (
                      <div className="flex justify-center items-center h-40">
                        <CircularProgress />
                      </div>
                    ) : parcelasConta.length === 0 ? (
                      <div className="text-center text-gray-500 p-4">
                        Nenhuma parcela encontrada
                      </div>
                    ) : (
                      parcelasConta.map((parcela) => {
                        if (!parcela || !parcela.id) return null;

                        const isCustoVariavel = parcela.custo_variavel || false;
                        const parcelaEditando =
                          parcelasEditando[parcela.id] || parcela;
                        const estaEditando = !!parcelasEditando[parcela.id];
                        const carregando = loadingParcelas[parcela.id] || false;

                        const statusValue = parcelaEditando.status || 1;
                        const isStatusPago = statusValue === 2;
                        const isStatusEmAndamento = statusValue === 3;

                        const statusText = isStatusPago
                          ? "Pago"
                          : isStatusEmAndamento
                            ? "Em Andamento"
                            : "Pendente";

                        const statusColor = isStatusPago
                          ? "bg-green-100 text-green-800"
                          : isStatusEmAndamento
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800";

                        return (
                          <div
                            key={parcela.id}
                            className="w-full border border-gray-300 rounded-lg p-4 bg-white relative"
                            style={{
                              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            {/* Cabeçalho */}
                            <div className="w-full flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                              <div className="flex items-center gap-3">
                                <label className="text-sm text-primary font-bold">
                                  {parcela.descricao ||
                                    (isCustoVariavel
                                      ? "Pagamento Único"
                                      : `Parcela`)}
                                </label>
                                <span
                                  className={`px-2 py-1 text-xs rounded ${statusColor}`}
                                >
                                  {statusText}
                                </span>
                              </div>
                            </div>

                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* 🔥 CAMPO DO PRESTADOR - APARECE APENAS QUANDO TEM PRESTADOR */}
                              {contaEditando?.prestador_nome && (
                                <div className="col-span-1 md:col-span-2 mb-2">
                                  <TextField
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    label="Prestador"
                                    value={contaEditando.prestador_nome}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Person />
                                        </InputAdornment>
                                      ),
                                      readOnly: true,
                                    }}
                                    disabled
                                    sx={{
                                      backgroundColor: "#f5f5f5",
                                      "& .MuiInputBase-input.Mui-disabled": {
                                        WebkitTextFillColor: "#666",
                                      },
                                    }}
                                  />
                                </div>
                              )}

                              {/* Data Vencimento */}
                              <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                label="Data Vencimento"
                                type="date"
                                value={formatDateForInput(
                                  parcela.data_vencimento,
                                )}
                                onChange={(e) =>
                                  handleParcelaChange(
                                    parcela.id,
                                    "data_vencimento",
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
                                InputLabelProps={{ shrink: true }}
                                disabled={isCustoVariavel}
                              />

                              {/* Data Pagamento */}
                              <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                label="Data Pagamento"
                                type="date"
                                value={formatDateForInput(
                                  parcelaEditando.data_pagamento,
                                )}
                                onChange={(e) =>
                                  handleParcelaChange(
                                    parcela.id,
                                    "data_pagamento",
                                    e.target.value || null,
                                  )
                                }
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <DateRange />
                                    </InputAdornment>
                                  ),
                                }}
                                InputLabelProps={{ shrink: true }}
                                disabled={isCustoVariavel && !isStatusPago}
                              />

                              {/* Valor */}
                              <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                label="Valor"
                                value={formatCurrency(parcela.valor)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Money />
                                    </InputAdornment>
                                  ),
                                  readOnly: true,
                                }}
                                disabled
                              />

                              {/* Status */}
                              <TextField
                                select
                                fullWidth
                                variant="outlined"
                                size="small"
                                label="Status"
                                value={parcelaEditando.status || 1}
                                onChange={(e) => {
                                  const novoStatus = parseInt(e.target.value);
                                  handleParcelaChange(
                                    parcela.id,
                                    "status",
                                    novoStatus,
                                  );

                                  if (
                                    novoStatus === 2 &&
                                    !parcelaEditando.data_pagamento
                                  ) {
                                    handleParcelaChange(
                                      parcela.id,
                                      "data_pagamento",
                                      new Date().toISOString().split("T")[0],
                                    );
                                  }

                                  if (novoStatus !== 2) {
                                    handleParcelaChange(
                                      parcela.id,
                                      "data_pagamento",
                                      null,
                                    );
                                  }
                                }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <TransformIcon />
                                    </InputAdornment>
                                  ),
                                }}
                              >
                                <MenuItem value={1}>Pendente</MenuItem>
                                <MenuItem value={2}>Pago</MenuItem>
                                <MenuItem value={3}>Em Andamento</MenuItem>
                              </TextField>
                            </div>

                            {/* Botão Salvar */}
                            <div className="flex justify-end mt-3">
                              <Button
                                variant="contained"
                                size="small"
                                disabled={!estaEditando || carregando}
                                startIcon={
                                  carregando ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <Save />
                                  )
                                }
                                onClick={() => handleUpdateParcela(parcela.id)}
                                sx={{
                                  backgroundColor: "#9D4B5B",
                                  "&:hover": { backgroundColor: "#7a3a48" },
                                  "&:disabled": { opacity: 0.7 },
                                }}
                              >
                                {carregando ? "Salvando..." : "Salvar"}
                              </Button>
                            </div>
                          </div>
                        );
                      })
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

export default ContasPagar;
