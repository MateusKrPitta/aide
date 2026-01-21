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
  InfoRounded,
  MonetizationOn,
  Money,
  Print,
  Save,
} from "@mui/icons-material";
import {
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
import { contasPagarTabela } from "../../../entities/class/contas";
import { deletarContas } from "../../../service/delete/contas";
import { atualizarParcelaContasPagar } from "../../../service/put/atualiza-parcela-contas-pagar";
import { atualizarContasPagar } from "../../../service/put/contas-pagar";
import { exportContasPagarToPDF } from "./imprimir";
import { buscarRelatorioPretadores } from "../../../service/get/relatorio-prestador";

const ContasPagar = () => {
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [tipoCusto, setTipoCusto] = useState("fixo");
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState(false);
  const [informacoes, setInformacoes] = useState(false);
  //const [listaPrestadores, setListaPrestadores] = useState([]);
  const [prestadorSelecionado, setPrestadorSelecionado] = useState("");
  const [nomeConta, setNomeConta] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [dataVariavel, setDataVariavel] = useState("");
  const [statusPagamento, setStatusPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [valor, setValor] = useState("");
  const [contasPagar, setContasPagar] = useState([]);
  //const [listaUsuarios, setListaUsuarios] = useState([]);
  const [contaEditando, setContaEditando] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [categoriasCadastradas, setCategoriasCadastradas] = useState([]);
  const [relatorios, setRelatorios] = useState([]);
  const [modalParcelas, setModalParcelas] = useState(false);
  const [parcelasConta, setParcelasConta] = useState([]);
  const [parcelasEditando, setParcelasEditando] = useState({});
  const [loadingParcelas, setLoadingParcelas] = useState({});
  const [termoBusca, setTermoBusca] = useState("");
  const [dataInicioFiltro, setDataInicioFiltro] = useState("");
  const [dataFimFiltro, setDataFimFiltro] = useState("");
  const [statusPagamentoFiltro, setStatusPagamentoFiltro] = useState("");
  const categoriasAtivas = categoriasCadastradas.filter(
    (categoria) => categoria.ativo,
  );

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

  const handleUpdateParcela = async (parcelaId) => {
    setLoadingParcelas((prev) => ({ ...prev, [parcelaId]: true }));

    try {
      const parcelaEditada = parcelasEditando[parcelaId];
      if (!parcelaEditada) {
        console.error("Parcela não encontrada no estado de edição");
        throw new Error("Parcela não encontrada");
      }

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

      setParcelasEditando((prev) => {
        const newState = { ...prev };
        delete newState[parcelaId];
        return newState;
      });
      const updatedContas = await buscarContasPagar();
      setContasPagar(updatedContas);
      const contaAtual = updatedContas.find(
        (c) => c.id === (contaEditando?.id || parcelasConta[0]?.conta_id),
      );
      if (contaAtual) {
        setParcelasConta((contaAtual.parcelas || []).filter((p) => p && p.id));
      }

      CustomToast({
        type: "success",
        message: "Parcela atualizada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar parcela:", error);
      CustomToast({
        type: "error",
        message: error.message || "Erro ao atualizar parcela",
      });
    } finally {
      setLoadingParcelas((prev) => ({ ...prev, [parcelaId]: false }));
    }
  };

  const handleVisualizarParcelas = (row) => {
    if (row.tipo === "Conta") {
      const conta = row.originalData || row;
      const parcelasFormatadas = (conta.parcelas || [])
        .filter((p) => p && p.id)
        .map((p) => ({
          ...p,
          tipo: "Conta",
        }));
      setParcelasConta(parcelasFormatadas);
    } else if (row.tipo === "Serviço") {
      const servico = row.originalData.servico || row.originalData;
      const parcelasServico = servico.parcelas || [];

      const parcelasFormatadas = parcelasServico.map((parcela) => ({
        id: parcela.id,
        conta_pagar_id: servico.id,
        descricao: `Parcela ${parcela.numero_parcela}/${servico.numero_parcelas}`,
        data_vencimento: parcela.data_pagamento,
        data_pagamento: parcela.data_pagamento,
        valor: parcela.valor_parcela,
        valor_prestador: parcela.valor_prestador,
        status: parcela.status_pagamento_prestador,
        status_pagamento_prestador: parcela.status_pagamento_prestador,
        forma_pagamento: servico.metodo_pagamento,
        tipo: "Serviço",
        originalData: row.originalData,
      }));

      setParcelasConta(parcelasFormatadas.filter((p) => p && p.id));
    }
    setModalParcelas(true);
  };

  const FecharFiltro = () => setFiltro(false);
  const Informacoes = (row) => {
    const conta = row.originalData || row;

    setContaEditando(conta);
    setNomeConta(conta.nome || "");
    setTipoCusto(conta.custo_fixo ? "fixo" : "variavel");
    setPrestadorSelecionado(conta.prestador_id || "");

    if (conta.custo_fixo) {
      setValor(conta.valor_mensal ? `R$ ${conta.valor_mensal}` : "");
    } else {
      setValor(conta.valor_total ? `R$ ${conta.valor_total}` : "");
    }

    setDataInicio(
      conta.data_inicio ? formatDateForInput(conta.data_inicio) : "",
    );
    setDataFim(conta.data_fim ? formatDateForInput(conta.data_fim) : "");
    setDataVariavel(
      conta.data_inicio ? formatDateForInput(conta.data_inicio) : "",
    );

    // Ajuste para contas variáveis
    if (conta.custo_variavel) {
      // Para contas variáveis, pegamos o status da primeira parcela (se existir)
      const statusParcela = conta.parcelas?.[0]?.status || 1;
      setStatusPagamento(
        statusParcela === 1
          ? "pendente"
          : statusParcela === 2
            ? "pago"
            : "andamento",
      );
    } else {
      // Para contas fixas, usamos o status_geral
      setStatusPagamento(
        conta.status_geral === 1
          ? "pendente"
          : conta.status_geral === 2
            ? "andamento"
            : "pago",
      );
    }

    setCategoriaSelecionada(conta.categoria_id || "");

    const formaPagamento = conta.parcelas?.[0]?.forma_pagamento || "";
    setFormaPagamento(formaPagamento);

    setInformacoes(true);
  };

  const contasFiltradas = useMemo(() => {
    return contasPagar.filter((conta) => {
      const buscaMatch =
        !termoBusca ||
        conta.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        (conta.prestador?.nome &&
          conta.prestador.nome
            .toLowerCase()
            .includes(termoBusca.toLowerCase()));

      const dataInicioMatch =
        !dataInicioFiltro ||
        (conta.data_inicio &&
          new Date(conta.data_inicio) >=
            new Date(dataInicioFiltro + "T00:00:00"));

      const dataFimMatch =
        !dataFimFiltro ||
        (conta.data_inicio &&
          new Date(conta.data_inicio) <= new Date(dataFimFiltro + "T23:59:59"));

      const categoriaMatch =
        !categoriaFiltro || conta.categoria_id === categoriaFiltro;

      const statusMatch =
        !statusPagamentoFiltro ||
        (conta.status_geral &&
          parseInt(conta.status_geral) === parseInt(statusPagamentoFiltro));

      return (
        buscaMatch &&
        dataInicioMatch &&
        dataFimMatch &&
        categoriaMatch &&
        statusMatch
      );
    });
  }, [
    contasPagar,
    termoBusca,
    dataInicioFiltro,
    dataFimFiltro,
    categoriaFiltro,
    statusPagamentoFiltro,
  ]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0];
  };

  const dadosCombinados = useMemo(() => {
    return contasPagarTabela(contasPagar, relatorios);
  }, [contasPagar, relatorios]);

  const dadosFiltrados = useMemo(() => {
    return dadosCombinados.filter((item) => {
      const buscaMatch =
        !termoBusca ||
        item.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        (item.originalData.prestador?.nome &&
          item.originalData.prestador.nome
            .toLowerCase()
            .includes(termoBusca.toLowerCase()));

      const dataInicioMatch =
        !dataInicioFiltro ||
        (item.dataObj &&
          new Date(item.dataObj) >= new Date(dataInicioFiltro + "T00:00:00"));

      const dataFimMatch =
        !dataFimFiltro ||
        (item.dataObj &&
          new Date(item.dataObj) <= new Date(dataFimFiltro + "T23:59:59"));

      const categoriaMatch =
        !categoriaFiltro ||
        (item.tipo === "Conta"
          ? item.originalData.categoria_id === categoriaFiltro
          : item.originalData.servico?.servico_id === categoriaFiltro);

      let statusItem = "";
      if (item.tipo === "Conta") {
        statusItem =
          item.status === "Pendente" ? "1" : item.status === "Pago" ? "2" : "3";
      } else {
        statusItem = item.status === "Pendente" ? "1" : "2";
      }

      const statusMatch =
        !statusPagamentoFiltro || statusItem === statusPagamentoFiltro;

      return (
        buscaMatch &&
        dataInicioMatch &&
        dataFimMatch &&
        categoriaMatch &&
        statusMatch
      );
    });
  }, [
    dadosCombinados,
    termoBusca,
    dataInicioFiltro,
    dataFimFiltro,
    categoriaFiltro,
    statusPagamentoFiltro,
  ]);

  const { totalPendente, totalAndamento, totalPago } = useMemo(() => {
    let pendente = 0;
    let andamento = 0;
    let pago = 0;

    dadosFiltrados.forEach((item) => {
      const valorString = item.valor
        .replace("R$", "")
        .replace(".", "")
        .replace(",", ".");
      const valor = parseFloat(valorString) || 0;

      if (item.tipo === "Conta") {
        // Lógica para contas
        if (item.status === "Pendente") {
          pendente += valor;
        } else if (item.status === "Pago") {
          pago += valor;
        } else if (item.status === "Em Andamento") {
          andamento += valor;
        }
      } else if (item.tipo === "Serviço") {
        // Lógica para serviços de prestadores
        if (item.status === "Pendente") {
          pendente += valor;
        } else if (item.status === "Pago") {
          pago += valor;
        } else if (item.status === "Em Andamento") {
          andamento += valor;
        }
      }
    });

    return {
      totalPendente: pendente,
      totalAndamento: andamento,
      totalPago: pago,
      totalGeral: pendente + andamento + pago,
    };
  }, [dadosFiltrados]);

  const FecharCadastroUsuario = () => {
    limparFormulario();
    setCadastroUsuario(false);
  };

  const handleClosInformacoes = () => {
    limparFormulario();
    setInformacoes(false);
  };

  const validarCampos = () => {
    const camposObrigatorios = nomeConta && valor && categoriaSelecionada;

    if (tipoCusto === "fixo") {
      return camposObrigatorios && dataInicio;
    }

    if (tipoCusto === "variavel") {
      return camposObrigatorios && dataVariavel;
    }

    return false;
  };

  const handleSalvarEdicao = async () => {
    try {
      setLoading(true);

      if (!contaEditando) {
        throw new Error("Nenhuma conta selecionada para edição");
      }

      const dadosParaEnviar = {
        nome: nomeConta,
        custo_fixo: tipoCusto === "fixo",
        custo_variavel: tipoCusto === "variavel",
        prestador_id: prestadorSelecionado || null,
        categoria_id: categoriaSelecionada || null,
        data_inicio: tipoCusto === "fixo" ? dataInicio : dataVariavel,
        data_fim: tipoCusto === "fixo" ? dataFim : null,
        forma_pagamento: formaPagamento || null, // Adicione esta linha
      };

      // Adicione valores monetários conforme o tipo
      if (tipoCusto === "fixo") {
        dadosParaEnviar.valor_mensal = parseFloat(
          valor.replace("R$", "").replace(",", ".").trim(),
        );
        dadosParaEnviar.valor_total = null;
      } else {
        dadosParaEnviar.valor_total = parseFloat(
          valor.replace("R$", "").replace(",", ".").trim(),
        );
        dadosParaEnviar.valor_mensal = null;

        // Para contas variáveis, adicione o status convertido para número
        dadosParaEnviar.status_pagamento =
          statusPagamento === "pendente"
            ? 1
            : statusPagamento === "pago"
              ? 2
              : 3;
      }

      await atualizarContasPagar(dadosParaEnviar, contaEditando.id);

      // Se for conta variável, atualize também a primeira parcela
      if (tipoCusto === "variavel" && contaEditando.parcelas?.[0]?.id) {
        const statusNumerico =
          statusPagamento === "pendente"
            ? 1
            : statusPagamento === "pago"
              ? 2
              : 3;

        await atualizarParcelaContasPagar(contaEditando.parcelas[0].id, {
          status: statusNumerico,
          forma_pagamento: formaPagamento || null,
          data_pagamento:
            statusNumerico === 2
              ? new Date().toISOString().split("T")[0]
              : null,
        });
      }

      const updatedContas = await buscarContasPagar();
      setContasPagar(updatedContas);

      CustomToast({
        type: "success",
        message: "Conta atualizada com sucesso!",
      });

      setInformacoes(false);
    } catch (error) {
      console.error("Erro ao atualizar conta:", error);
      CustomToast({
        type: "error",
        message: error.message || "Erro ao atualizar conta",
      });
    } finally {
      setLoading(false);
    }
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

      const dadosParaEnviar = {
        nome: nomeConta,
        custo_fixo: tipoCusto === "fixo",
        custo_variavel: tipoCusto === "variavel",
        data_inicio: dataInicioFormatada,
        data_fim: tipoCusto === "fixo" ? dataFim : null,
        valor_mensal: valorNumerico,
        valor_total: valorTotal,
        prestador_id: prestadorSelecionado || null,
        status_pagamento: statusPagamento || null,
        forma_pagamento: formaPagamento || null,
        categoria_id: categoriaSelecionada || null,
      };

      await criarContasPagar(dadosParaEnviar);

      CustomToast({
        type: "success",
        message: "Conta cadastrada com sucesso!",
      });

      const updatedContas = await buscarContasPagar();
      setContasPagar(updatedContas);
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
      setContasPagar((prevContas) =>
        prevContas.filter((conta) => conta.id !== id),
      );
      const updatedContas = await buscarContasPagar();
      setContasPagar(updatedContas);
      CustomToast({ type: "success", message: "Conta excluída com sucesso!" });
    } catch (error) {
      CustomToast({
        type: "error",
        message: error.response?.data?.message || "Erro ao excluir conta",
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarRelatorioPrestadores = async () => {
    try {
      setLoading(true);
      const response = await buscarRelatorioPretadores();
      const dadosFormatados = response.data.map((item) => {
        const totalServico = item.servicos.reduce(
          (acc, servico) => acc + parseFloat(servico.valor_total),
          0,
        );

        const totalComissao = item.servicos.reduce(
          (acc, servico) => acc + parseFloat(servico.comissao),
          0,
        );

        const data = new Date(item.created_at);
        const dataFormatada = data.toLocaleDateString("pt-BR");

        const hasPendingPayment = item.servicos.some((servico) =>
          servico.parcelas.some(
            (parcela) => parcela.status_pagamento_prestador === 2,
          ),
        );

        const status = hasPendingPayment ? "Pendente" : "Pago";

        return {
          id: item.id,
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
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contasResponse, categoriasResponse] = await Promise.all([
          buscarContasPagar(),
          buscarPretadores(),
          buscarCategoria(),
        ]);

        setContasPagar(contasResponse);
        setCategoriasCadastradas(categoriasResponse.data || []);
      } catch (error) {
        CustomToast({
          type: "error",
          message: "Erro ao carregar dados",
        });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (modalParcelas && contasPagar.length > 0) {
      const contaAtual = contasPagar.find(
        (c) => c.id === (contaEditando?.id || parcelasConta[0]?.conta_id),
      );
      if (contaAtual) {
        setParcelasConta((contaAtual.parcelas || []).filter((p) => p && p.id));
      }
    }
  }, [contasPagar, modalParcelas, contaEditando?.id, parcelasConta]);

  useEffect(() => {
    buscarRelatorioPrestadores();
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
          <HeaderPerfil pageTitle="Contas à Pagar" />

          <div className=" items-center justify-center lg:justify-start w-full flex mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="hidden md:block md:w-[60%] lg:w-[15%]">
              <HeaderFinanceiro />
            </div>
            <div className="w-[100%] itens-center mt-2 ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[80%]">
              <div className="flex items-center gap-2 w-full mb-3">
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
                    {formatCurrency(totalPendente)}
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
                    <MonetizationOnIcon /> Total Pago:{" "}
                    {formatCurrency(totalPago)}
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
                    <MonetizationOnIcon /> Total:{" "}
                    {formatCurrency(totalAndamento + totalPendente + totalPago)}
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
                <ButtonComponent
                  startIcon={<AddCircleOutline fontSize="small" />}
                  title={"Cadastrar"}
                  subtitle={"Cadastrar"}
                  buttonSize="large"
                  onClick={() => setCadastroUsuario(true)}
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
                    exportContasPagarToPDF(
                      contasPagar,
                      {
                        totalPendente,
                        totalAndamento,
                        totalPago,
                        totalGeral: totalPendente + totalAndamento + totalPago,
                      },
                      {
                        dataInicio: dataInicioFiltro,
                        dataFim: dataFimFiltro,
                        status: statusPagamentoFiltro,
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
              <div className="w-full flex justify-center mb-4">
                {loading ? (
                  <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
                    <TableLoading />
                    <label className="text-xs text-primary">
                      Carregando Informações !
                    </label>
                  </div>
                ) : contasFiltradas.length > 0 ? (
                  <TableComponent
                    headers={headerContasPagar}
                    rows={dadosFiltrados}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      edit: (row) =>
                        row.podeEditar && Informacoes(row.originalData),
                      delete: (row) =>
                        row.podeExcluir && handleDeleteConta(row._id),
                      view: (row) => handleVisualizarParcelas(row),
                    }}
                  />
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
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "95%" },
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

                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Categoria"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "47%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Category />
                          </InputAdornment>
                        ),
                      }}
                      value={categoriaSelecionada}
                      onChange={(e) => setCategoriaSelecionada(e.target.value)}
                    >
                      <MenuItem value="">Selecione uma categoria</MenuItem>
                      {categoriasAtivas.map((categoria) => (
                        <MenuItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Valor Mensal"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "47%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MonetizationOn />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="flex w-[96%] items-end justify-end mt-2 ">
                    <ButtonComponent
                      startIcon={<AddCircleOutline fontSize="small" />}
                      title={"Cadastrar"}
                      subtitle={"Cadastrar"}
                      buttonSize="large"
                      disabled={!validarCampos() || loading}
                      onClick={handleCadastrar}
                    />
                  </div>
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

                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Categoria"
                      value={categoriaFiltro}
                      onChange={(e) => setCategoriaFiltro(e.target.value)}
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
                            <Category />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="">Todas Categorias</MenuItem>
                      {categoriasCadastradas.map((categoria) => (
                        <MenuItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </MenuItem>
                      ))}
                      {/* Adicione categorias específicas de serviços se necessário */}
                    </TextField>
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
                open={informacoes}
                handleClose={handleClosInformacoes}
                tituloModal="Editar Informações"
                icon={<InfoRounded />}
                tamanhoTitulo="75%"
                conteudo={
                  <div className="flex flex-wrap w-full items-center gap-4">
                    <div className="flex gap-4 ">
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

                    <div className="mt-1 flex gap-3 flex-wrap">
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

                      <TextField
                        select
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Categoria"
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
                              <Category />
                            </InputAdornment>
                          ),
                        }}
                        value={categoriaSelecionada}
                        onChange={(e) =>
                          setCategoriaSelecionada(e.target.value)
                        }
                      >
                        <MenuItem value="">Selecione uma categoria</MenuItem>
                        {categoriasCadastradas.map((categoria) => (
                          <MenuItem key={categoria.id} value={categoria.id}>
                            {categoria.nome}
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
                        onChange={(e) => setStatusPagamento(e.target.value)}
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
                              <TransformIcon />
                            </InputAdornment>
                          ),
                        }}
                      >
                        <MenuItem value="pendente">Pendente</MenuItem>
                        <MenuItem value="pago">Pago</MenuItem>
                        {/* Mostrar "Em Andamento" apenas para contas fixas */}
                        {tipoCusto === "fixo" && (
                          <MenuItem value="andamento">Em Andamento</MenuItem>
                        )}
                      </TextField>

                      {tipoCusto === "fixo" && (
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Valor Mensal"
                          value={valor}
                          onChange={(e) => setValor(e.target.value)}
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
                                <MonetizationOn />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}

                      {tipoCusto === "variavel" && (
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Valor Total"
                          value={valor}
                          onChange={(e) => setValor(e.target.value)}
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
                                <Money />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    </div>

                    <div className="flex w-[96%] items-end justify-end mt-2 ">
                      <ButtonComponent
                        startIcon={<Save fontSize="small" />}
                        title={"Salvar"}
                        subtitle={"Salvar"}
                        buttonSize="large"
                        onClick={handleSalvarEdicao}
                        disabled={loading}
                      />
                    </div>
                  </div>
                }
              />

              <ModalLateral
                open={modalParcelas}
                handleClose={() => {
                  setModalParcelas(false);
                  setParcelasEditando({});
                }}
                tituloModal="Parcelas da Conta"
                icon={<Article />}
                tamanhoTitulo="75%"
                conteudo={
                  <div
                    className="flex flex-col gap-4 w-full"
                    style={{ maxHeight: "500px", overflow: "auto" }}
                  >
                    {parcelasConta.length > 0 ? (
                      parcelasConta
                        .filter((parcela) => parcela && parcela.id)
                        .map((parcela) => {
                          const isRelatorio = parcela.tipo === "Serviço";
                          const parcelaEditando =
                            parcelasEditando[parcela.id] || parcela;
                          const estaEditando = !!parcelasEditando[parcela.id];
                          const carregando =
                            loadingParcelas[parcela.id] || false;

                          const statusValue = isRelatorio
                            ? parcela.status_pagamento_prestador
                            : parcela.status;

                          const statusText = isRelatorio
                            ? statusValue === 1
                              ? "Pago"
                              : "Pendente"
                            : statusValue === 2
                              ? "Pago"
                              : "Pendente";

                          const statusColor =
                            statusText === "Pago"
                              ? "bg-green-100 text-green-800"
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
                                <div className="flex items-center">
                                  <TextField
                                    label="Descrição"
                                    size="small"
                                    value={
                                      parcela.descricao ||
                                      `Parcela ${parcela.numero_parcela}`
                                    }
                                    onChange={(e) =>
                                      handleParcelaChange(
                                        parcela.id,
                                        "descricao",
                                        e.target.value,
                                      )
                                    }
                                    sx={{ width: 200 }}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Article />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  <span
                                    className={`px-2 py-1 text-xs ml-3 rounded ${statusColor}`}
                                  >
                                    {statusText}
                                  </span>
                                </div>
                              </div>

                              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                  label="Data Vencimento"
                                  type="date"
                                  value={formatDateForInput(
                                    parcela.data_vencimento ||
                                      parcela.data_pagamento,
                                  )}
                                  onChange={(e) =>
                                    handleParcelaChange(
                                      parcela.id,
                                      "data_vencimento",
                                      e.target.value,
                                    )
                                  }
                                  InputProps={{ startAdornment: <DateRange /> }}
                                  InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                  label="Data Pagamento"
                                  type="date"
                                  value={
                                    parcelaEditando.data_pagamento
                                      ? formatDateForInput(
                                          parcelaEditando.data_pagamento,
                                        )
                                      : ""
                                  }
                                  onChange={(e) =>
                                    handleParcelaChange(
                                      parcela.id,
                                      "data_pagamento",
                                      e.target.value,
                                    )
                                  }
                                  InputProps={{ startAdornment: <DateRange /> }}
                                  InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  disabled
                                  size="small"
                                  label={
                                    isRelatorio
                                      ? "Valor Prestador"
                                      : "Valor Mensal"
                                  }
                                  value={formatCurrency(
                                    isRelatorio
                                      ? parcela.valor_prestador ||
                                          parcela.originalData
                                            ?.valor_prestador ||
                                          parcela.valor_parcela
                                      : parcela.valor,
                                  )}
                                  InputProps={{ startAdornment: <Money /> }}
                                />

                                {isRelatorio ? (
                                  <TextField
                                    fullWidth
                                    variant="outlined"
                                    disabled
                                    size="small"
                                    label="Status"
                                    value={statusText}
                                    InputProps={{
                                      startAdornment: <TransformIcon />,
                                    }}
                                  />
                                ) : (
                                  <TextField
                                    select
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    label="Status"
                                    value={statusValue}
                                    onChange={(e) =>
                                      handleParcelaChange(
                                        parcela.id,
                                        "status",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    InputProps={{
                                      startAdornment: <TransformIcon />,
                                    }}
                                  >
                                    <MenuItem value={1}>Pendente</MenuItem>
                                    <MenuItem value={2}>Pago</MenuItem>
                                  </TextField>
                                )}
                              </div>

                              {!isRelatorio && (
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
                                    onClick={() =>
                                      handleUpdateParcela(parcela.id)
                                    }
                                    sx={{
                                      backgroundColor: "#9D4B5B",
                                      "&:hover": { backgroundColor: "#7a3a48" },
                                      "&:disabled": { opacity: 0.7 },
                                    }}
                                  >
                                    {carregando ? "Salvando..." : "Salvar"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          Nenhuma parcela encontrada
                        </p>
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

export default ContasPagar;
