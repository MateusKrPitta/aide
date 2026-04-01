import React, { useEffect, useState } from "react";
import Navbar from "../../../components/navbars/header";
import HeaderPerfil from "../../../components/navbars/perfil";
import ButtonComponent from "../../../components/button";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
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
  Money,
  Print,
  Save,
  Refresh,
  CheckCircle,
  Pending,
  Edit,
  Person,
} from "@mui/icons-material";
import { IconButton, InputAdornment, MenuItem, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";
import TableLoading from "../../../components/loading/loading-table/loading";
import TableComponent from "../../../components/table";
import HeaderFinanceiro from "../../../components/navbars/financeiro";
import { headerAide } from "../../../entities/header/financeiro/aide";
import CustomToast from "../../../components/toast";
import { buscarCategoria } from "../../../service/get/categoria";
import { criarFluxoCaixa } from "../../../service/post/fluxo-caixa";
import { buscarFluxoCaixa } from "../../../service/get/fluxo-caixa";
import { deletarFluxoCaixa } from "../../../service/delete/fluxo-caixa";
import { atualizarFluxoCaixa } from "../../../service/put/fluxo-caixa";
import { buscarTotalFluxoCaixa } from "../../../service/get/total-fluxo-caixa";
import { cadastrosFluxoCaixa } from "../../../entities/class/fluxo-caixa";

const FluxoCaixa = () => {
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTotais, setLoadingTotais] = useState(false);
  const [origem, setOrigem] = useState("movimentacao");
  const [assunto, setAssunto] = useState("");
  const [observacao, setObservacao] = useState("");
  const [prestador, setPrestador] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [valor, setValor] = useState("");
  const [modalEdicaoAberta, setModalEdicaoAberta] = useState(false);
  const [tipo, setTipo] = useState("1");
  const [categoriaId, setCategoriaId] = useState("");
  const [categoriasCadastradas, setCategoriasCadastradas] = useState([]);
  const [status, setStatus] = useState("1");
  const [totais, setTotais] = useState({
    total_entradas: 0,
    total_saidas: 0,
    saldo: 0,
    periodo: {
      data_inicio: null,
      data_fim: null,
    },
  });

  const [fluxoData, setFluxoData] = useState({
    data: [],
    total: 0,
    perPage: 10,
    page: 1,
    lastPage: 1,
  });

  const [filtrosAtivos, setFiltrosAtivos] = useState(false);
  const [pesquisa, setPesquisa] = useState("");

  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    tipoFiltro: "",
    categoriaFiltro: "",
    statusFiltro: "",
    origemFiltro: "",
  });
  const [filtro, setFiltro] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  const formatarValorParaExibicao = (valor) => {
    if (!valor) return "";

    if (typeof valor === "number") {
      return valor.toFixed(2).replace(".", ",");
    }

    const valorStr = valor.toString();
    const apenasNumeros = valorStr.replace(/\D/g, "");
    if (!apenasNumeros) return "";

    const numero = parseFloat(apenasNumeros) / 100;
    return numero.toFixed(2).replace(".", ",");
  };

  const converterValorParaNumero = (valor) => {
    if (!valor) return 0;
    if (typeof valor === "number") return valor;

    let valorStr = valor.toString();

    valorStr = valorStr.replace(/R\$\s*/g, "");

    valorStr = valorStr.replace(/\./g, "");

    valorStr = valorStr.replace(",", ".");

    valorStr = valorStr.replace(/[^\d.-]/g, "");

    const numero = parseFloat(valorStr);

    return isNaN(numero) ? 0 : numero;
  };

  const buscarTotais = async () => {
    try {
      setLoadingTotais(true);

      const params = {};

      if (filtros.dataInicio) {
        params.data_inicio = filtros.dataInicio;
      }

      if (filtros.dataFim) {
        params.data_fim = filtros.dataFim;
      }

      if (filtros.categoriaFiltro) {
        params.categoria_id = filtros.categoriaFiltro;
      }

      if (filtros.origemFiltro) {
        params.origem = filtros.origemFiltro;
      }

      if (!filtros.dataInicio && !filtros.dataFim) {
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDiaMes = new Date(
          hoje.getFullYear(),
          hoje.getMonth() + 1,
          0,
        );

        params.data_inicio = primeiroDiaMes.toISOString().split("T")[0];
        params.data_fim = ultimoDiaMes.toISOString().split("T")[0];
      }

      const response = await buscarTotalFluxoCaixa(params);

      setTotais({
        total_entradas: response.total_entradas || 0,
        total_saidas: response.total_saidas || 0,
        saldo: response.saldo || 0,
        periodo: response.periodo || {
          data_inicio: null,
          data_fim: null,
        },
      });
    } catch (error) {
      console.error("Erro ao buscar totais:", error);
    } finally {
      setLoadingTotais(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: "",
      dataFim: "",
      tipoFiltro: "",
      categoriaFiltro: "",
      statusFiltro: "",
      origemFiltro: "",
    });
    setPesquisa("");
    setFiltrosAtivos(false);
    buscarFluxo(1, fluxoData.perPage);
    buscarTotais();
  };

  const FecharFiltro = () => setFiltro(false);

  const FecharCadastroUsuario = () => {
    resetarCampos();
    setCadastroUsuario(false);
  };

  const handleDeletarFluxo = async (item) => {
    if (!item.podeExcluir) {
      CustomToast({
        type: "warning",
        message:
          "Este item não pode ser excluído! Apenas movimentações manuais podem ser excluídas.",
      });
      return;
    }

    try {
      setLoading(true);

      let id;
      let descricao = "este item";

      if (typeof item === "object" && item !== null) {
        id = item.id;
        descricao = item.descricao || "este item";
      } else {
        id = item;
      }

      if (!id) {
        CustomToast({
          type: "error",
          message: "ID do item não encontrado",
        });
        return;
      }

      await deletarFluxoCaixa(id);

      await buscarFluxo(fluxoData.page, fluxoData.perPage);
      await buscarTotais();

      CustomToast({
        type: "success",
        message: `${descricao} excluído com sucesso!`,
      });
    } catch (error) {
      console.error("🔴 Erro detalhado ao deletar:", error);
      CustomToast({
        type: "error",
        message: error.response?.data?.message || "Erro ao excluir item",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (item) => {
    setItemEditando(item);

    let origemItem = item.origem;

    if (!origemItem && item.id) {
      if (item.id.toString().startsWith("palestra_")) {
        origemItem = "palestra_curso";
      } else if (item.id.toString().startsWith("prestador_")) {
        origemItem = "pagamento_prestador";
      } else if (item.id.toString().startsWith("comissao_")) {
        origemItem = "comissao_receber";
      } else if (item.id.toString().startsWith("conta_receber_")) {
        origemItem = "conta_receber_variavel";
      } else if (item.id.toString().startsWith("conta_receber_parcela_")) {
        origemItem = "conta_receber_fixo";
      } else if (item.id.toString().startsWith("conta_pagar_")) {
        origemItem = "conta_pagar_variavel";
      } else if (item.id.toString().startsWith("conta_pagar_parcela_")) {
        origemItem = "conta_pagar_fixo";
      }
    }

    setOrigem(origemItem || "movimentacao");
    setAssunto(item.descricao);
    setObservacao(item.observacao || "");
    setPrestador(item.prestador_nome || "");

    if (item.data_vencimento) {
      const data = new Date(item.data_vencimento);
      const dataFormatada = data.toISOString().split("T")[0];
      setDataVencimento(dataFormatada);
    } else {
      setDataVencimento("");
    }

    const valorOriginal = item.valorOriginal || item.valor;
    setValor(formatarValorParaExibicao(valorOriginal));

    setTipo(item.tipo === "Entrada" ? "1" : "2");
    setCategoriaId(item.categoriaId || "");

    if (item.is_pago) {
      setStatus("2");
    } else {
      setStatus("1");
    }

    setModalEdicaoAberta(true);
  };

  const camposPreenchidos = () => {
    const valorPreenchido = valor && valor.replace(/\D/g, "").length > 0;

    return (
      assunto?.trim() !== "" &&
      valorPreenchido &&
      categoriaId !== "" &&
      tipo !== "" &&
      status !== ""
    );
  };

  const handleCadastrarFluxo = async () => {
    try {
      setLoading(true);

      const valorFormatado = converterValorParaNumero(valor);

      await criarFluxoCaixa(
        parseInt(tipo),
        assunto,
        observacao,
        parseInt(categoriaId),
        valorFormatado,
        2,
        dataVencimento || null,
      );

      resetarCampos();
      await buscarFluxo(1, fluxoData.perPage);
      await buscarTotais();

      CustomToast({
        type: "success",
        message: "Cadastrado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      CustomToast({
        type: "error",
        message: "Erro ao cadastrar",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAtualizarFluxo = async () => {
    try {
      setLoading(true);

      const valorNumerico = converterValorParaNumero(valor);

      if (valorNumerico <= 0 || isNaN(valorNumerico)) {
        CustomToast({
          type: "warning",
          message: "O valor deve ser maior que zero",
        });
        setLoading(false);
        return;
      }

      if (!itemEditando) {
        CustomToast({
          type: "error",
          message: "Nenhum item selecionado para edição",
        });
        setLoading(false);
        return;
      }

      let origemCorreta = origem;

      if (!origemCorreta || origemCorreta === "movimentacao") {
        const id = itemEditando.id?.toString() || "";
        if (id.startsWith("palestra_")) {
          origemCorreta = "palestra_curso";
        } else if (id.startsWith("prestador_")) {
          origemCorreta = "pagamento_prestador";
        } else if (id.startsWith("comissao_")) {
          origemCorreta = "comissao_receber";
        } else if (id.startsWith("conta_receber_parcela_")) {
          origemCorreta = "conta_receber_fixo";
        } else if (id.startsWith("conta_receber_")) {
          origemCorreta = "conta_receber_variavel";
        } else if (id.startsWith("conta_pagar_parcela_")) {
          origemCorreta = "conta_pagar_fixo";
        } else if (id.startsWith("conta_pagar_")) {
          origemCorreta = "conta_pagar_variavel";
        } else {
          origemCorreta = itemEditando.origem || "movimentacao";
        }
      }

      const dadosAtualizacao = {
        origem: origemCorreta,
      };

      switch (origemCorreta) {
        case "palestra_curso":
          dadosAtualizacao.valor = valorNumerico;
          dadosAtualizacao.data_vencimento = dataVencimento;

          let statusPalestra = parseInt(status);
          if (statusPalestra === 2) {
            dadosAtualizacao.status_pagamento = 1;
          } else {
            dadosAtualizacao.status_pagamento = 2;
          }
          break;

        case "comissao_receber":
          dadosAtualizacao.valor_comissao = valorNumerico;
          dadosAtualizacao.data_pagamento = dataVencimento;
          dadosAtualizacao.status_pagamento_comissao =
            parseInt(status) === 2 ? 2 : 1;
          break;

        case "pagamento_prestador":
          dadosAtualizacao.valor_prestador = valorNumerico;
          dadosAtualizacao.data_pagamento = dataVencimento;
          dadosAtualizacao.status_pagamento_prestador =
            parseInt(status) === 2 ? 2 : 1;
          break;

        case "conta_receber_variavel":
          dadosAtualizacao.valor_total = valorNumerico;
          dadosAtualizacao.data_inicio = dataVencimento;
          dadosAtualizacao.status = parseInt(status) === 2 ? 2 : 1;
          break;

        case "conta_receber_fixo":
          dadosAtualizacao.valor = valorNumerico;
          dadosAtualizacao.data_vencimento = dataVencimento;
          dadosAtualizacao.status_pagamento = parseInt(status) === 2 ? 2 : 1;
          break;

        case "conta_pagar_variavel":
          dadosAtualizacao.valor_total = valorNumerico;
          dadosAtualizacao.data_inicio = dataVencimento;
          dadosAtualizacao.status_geral = parseInt(status) === 2 ? 2 : 1;
          break;

        case "conta_pagar_fixo":
          dadosAtualizacao.valor = valorNumerico;
          dadosAtualizacao.data_vencimento = dataVencimento;
          dadosAtualizacao.status = parseInt(status) === 2 ? 2 : 1;
          break;

        case "movimentacao":
          dadosAtualizacao.tipo = parseInt(tipo);
          dadosAtualizacao.assunto = assunto;
          dadosAtualizacao.observacao = observacao;
          dadosAtualizacao.categoria_id = parseInt(categoriaId);
          dadosAtualizacao.valor = valorNumerico;
          dadosAtualizacao.status = parseInt(status);
          break;

        default:
          dadosAtualizacao.valor = valorNumerico;
          dadosAtualizacao.categoria_id = parseInt(categoriaId);
          dadosAtualizacao.status = parseInt(status);
      }

      await atualizarFluxoCaixa(dadosAtualizacao, itemEditando.id);

      resetarCampos();
      await buscarFluxo(fluxoData.page, fluxoData.perPage);
      await buscarTotais();

      CustomToast({
        type: "success",
        message: "Atualizado com sucesso!",
      });
    } catch (error) {
      console.error("❌ Erro detalhado:", error);
      CustomToast({
        type: "error",
        message:
          error.response?.data?.message || error.message || "Erro ao atualizar",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetarCampos = () => {
    setAssunto("");
    setObservacao("");
    setValor("");
    setTipo("1");
    setCategoriaId("");
    setStatus("1");
    setOrigem("movimentacao");
    setPrestador("");
    setDataVencimento("");
    setItemEditando(null);
    setModalEdicaoAberta(false);
    setCadastroUsuario(false);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const buscarCategoriaCadastradas = async () => {
    try {
      setLoading(true);
      const response = await buscarCategoria();
      const categoriasAtivas = response.data.filter(
        (categoria) => categoria.ativo,
      );
      setCategoriasCadastradas(categoriasAtivas || []);
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

  const buscarFluxo = async (page = 1, perPage = 10) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("perPage", perPage);

      if (filtros.tipoFiltro) {
        params.append("tipo", filtros.tipoFiltro);
      }

      if (filtros.dataInicio) {
        params.append("data_inicio", filtros.dataInicio);
      }

      if (filtros.dataFim) {
        params.append("data_fim", filtros.dataFim);
      }

      if (filtros.statusFiltro) {
        params.append("status", filtros.statusFiltro);
      }

      if (filtros.categoriaFiltro) {
        params.append("categoria_id", filtros.categoriaFiltro);
      }

      if (filtros.origemFiltro) {
        params.append("origem", filtros.origemFiltro);
      }

      if (pesquisa) {
        params.append("search", pesquisa);
      }

      const response = await buscarFluxoCaixa(params);

      setFluxoData({
        data: response.data || [],
        total: response.total || 0,
        perPage: response.perPage || perPage,
        page: response.page || page,
        lastPage: response.lastPage || 1,
      });
    } catch (error) {
      console.error("Erro ao buscar fluxo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    buscarFluxo(newPage, fluxoData.perPage);
  };

  const buscarTodosParaImpressao = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", 1);
      params.append("perPage", 1000000);

      const response = await buscarFluxoCaixa(params);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dados para impressão:", error);
      CustomToast({
        type: "error",
        message: "Erro ao gerar relatório",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const gerarPDF = async () => {
    setLoading(true);

    try {
      const todosDados = await buscarTodosParaImpressao();

      if (!todosDados || todosDados.length === 0) {
        CustomToast({
          type: "warning",
          message: "Nenhum dado encontrado para gerar o relatório",
        });
        setLoading(false);
        return;
      }

      const [jsPDFModule, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const { jsPDF } = jsPDFModule;
      const doc = new jsPDF();

      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.text("Relatório de Fluxo de Caixa", 14, 15);

      doc.setFontSize(10);
      doc.text(
        `Data de emissão: ${new Date().toLocaleDateString("pt-BR")}`,
        14,
        22,
      );

      doc.text(`Total de registros: ${todosDados.length}`, 14, 29);

      const dadosTabela = todosDados.map((item) => [
        item.status === "pago"
          ? "Pago"
          : item.status === "vencido"
            ? "Vencido"
            : "Pendente",
        item.tipo,
        new Date(item.data).toLocaleDateString("pt-BR"),
        item.descricao,
        item.categoria_nome || "Sem categoria",
        `R$ ${item.valor.toFixed(2).replace(".", ",")}`,
      ]);

      autoTableModule.default(doc, {
        head: [["Status", "Tipo", "Data", "Descrição", "Categoria", "Valor"]],
        body: dadosTabela,
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 60 },
          4: { cellWidth: 30 },
          5: { cellWidth: 25, halign: "right" },
        },
        headStyles: {
          fontStyle: "bold",
          textColor: 0,
          fillColor: [240, 240, 240],
        },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.text(
            `Página ${data.pageNumber}`,
            doc.internal.pageSize.width - 14,
            doc.internal.pageSize.height - 5,
          );
        },
      });

      const nomeArquivo = `fluxo-caixa-completo-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(nomeArquivo);

      CustomToast({
        type: "success",
        message: "Relatório gerado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    buscarFluxo(1, newPerPage);
  };

  const aplicarFiltros = () => {
    buscarFluxo(1, fluxoData.perPage);
    buscarTotais();
    setFiltro(false);
  };

  const formatarValor = (valor) => {
    return valor.toFixed(2).replace(".", ",");
  };

  const getSaldoColor = () => {
    if (totais.saldo > 0) return "#4CAF50";
    if (totais.saldo < 0) return "#F44336";
    return "#9D4B5B";
  };

  useEffect(() => {
    buscarCategoriaCadastradas();
    buscarFluxo(1, 10);
    buscarTotais();
  }, []);

  useEffect(() => {
    const temFiltros =
      filtros.dataInicio ||
      filtros.dataFim ||
      filtros.tipoFiltro ||
      filtros.categoriaFiltro ||
      filtros.statusFiltro ||
      filtros.origemFiltro ||
      pesquisa;
    setFiltrosAtivos(temFiltros);
  }, [filtros, pesquisa]);

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
          <HeaderPerfil pageTitle="Fluxo de Caixa" />

          <div className="items-center justify-center lg:justify-start w-full flex mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="hidden md:block md:w-[60%] lg:w-[15%]">
              <HeaderFinanceiro />
            </div>
            <div className="w-[100%] itens-center mt-2 ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[80%]">
              {/* Cards de Totais */}
              <div className="flex flex-wrap gap-4 w-full mb-6">
                {/* Card de Entradas */}
                <div
                  className="flex-1 min-w-[200px] bg-white rounded-lg shadow-md p-4 border-l-4"
                  style={{ borderLeftColor: "#4CAF50" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        Total Entradas
                      </p>
                      {loadingTotais ? (
                        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-800">
                          R$ {formatarValor(totais.total_entradas)}
                        </p>
                      )}
                    </div>
                    <div
                      className="p-3 rounded-full"
                      style={{ backgroundColor: "#E8F5E9" }}
                    >
                      <TrendingUpIcon style={{ color: "#4CAF50" }} />
                    </div>
                  </div>
                </div>

                {/* Card de Saídas */}
                <div
                  className="flex-1 min-w-[200px] bg-white rounded-lg shadow-md p-4 border-l-4"
                  style={{ borderLeftColor: "#F44336" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        Total Saídas
                      </p>
                      {loadingTotais ? (
                        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-800">
                          R$ {formatarValor(totais.total_saidas)}
                        </p>
                      )}
                    </div>
                    <div
                      className="p-3 rounded-full"
                      style={{ backgroundColor: "#FFEBEE" }}
                    >
                      <TrendingDownIcon style={{ color: "#F44336" }} />
                    </div>
                  </div>
                </div>

                {/* Card de Saldo */}
                <div
                  className="flex-1 min-w-[200px] bg-white rounded-lg shadow-md p-4 border-l-4"
                  style={{ borderLeftColor: getSaldoColor() }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Saldo</p>
                      {loadingTotais ? (
                        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
                      ) : (
                        <p
                          className="text-2xl font-bold"
                          style={{ color: getSaldoColor() }}
                        >
                          R$ {formatarValor(totais.saldo)}
                        </p>
                      )}
                    </div>
                    <div
                      className="p-3 rounded-full"
                      style={{ backgroundColor: "#F3E5F5" }}
                    >
                      <AccountBalanceIcon style={{ color: "#9D4B5B" }} />
                    </div>
                  </div>
                </div>

                {/* Botão para atualizar totais */}
                <div className="flex items-end">
                  <IconButton
                    title="Atualizar totais"
                    onClick={buscarTotais}
                    disabled={loadingTotais}
                    className="view-button w-10 h-10"
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
                    <Refresh
                      fontSize={"small"}
                      className={loadingTotais ? "animate-spin" : ""}
                    />
                  </IconButton>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap w-full items-center justify-center md:justify-start mb-4">
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
                  className="view-button w-10 h-10"
                  sx={{
                    color: filtrosAtivos ? "#9D4B5B" : "black",
                    border: "1px solid black",
                    backgroundColor: filtrosAtivos ? "#f0e6e8" : "transparent",
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
                  className="view-button w-10 h-10"
                  sx={{
                    color: "black",
                    border: "1px solid black",
                    "&:hover": {
                      color: "#fff",
                      backgroundColor: "#9D4B5B",
                      border: "1px solid black",
                    },
                  }}
                  onClick={gerarPDF}
                  disabled={loading}
                >
                  <Print fontSize={"small"} />
                </IconButton>
              </div>

              <div className="w-full flex">
                {loading ? (
                  <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
                    <TableLoading />
                    <label className="text-xs text-primary">
                      Carregando Informações !
                    </label>
                  </div>
                ) : fluxoData.data.length > 0 ? (
                  <TableComponent
                    headers={headerAide}
                    rows={cadastrosFluxoCaixa(fluxoData.data)}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      edit: (row) => handleEditar(row),
                      delete: (row) => handleDeletarFluxo(row),
                    }}
                    pagination={true}
                    totalRows={fluxoData.total}
                    page={fluxoData.page}
                    rowsPerPage={fluxoData.perPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handlePerPageChange}
                  />
                ) : (
                  <div className="text-center w-full flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                    <TableLoading />
                    <label className="text-sm">
                      Nenhum lançamento encontrado!
                    </label>
                  </div>
                )}
              </div>

              {/* Modal de Cadastro */}
              <CentralModal
                tamanhoTitulo={"81%"}
                maxHeight={"90vh"}
                top={"20%"}
                left={"28%"}
                width={"550px"}
                icon={<AddCircleOutline fontSize="small" />}
                open={cadastroUsuario}
                onClose={FecharCadastroUsuario}
                title="Cadastrar Entrada/Saída"
              >
                <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
                  <div className="mt-4 flex gap-3 flex-wrap">
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Tipo"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "47%", lg: "47%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TransformIcon />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="1">Entrada</MenuItem>
                      <MenuItem value="2">Saída</MenuItem>
                    </TextField>

                    {/* Data de Vencimento */}
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="date"
                      label="Data de Vencimento"
                      value={dataVencimento}
                      onChange={(e) => setDataVencimento(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "47%", lg: "47%" },
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
                      label="Assunto"
                      name="assunto"
                      value={assunto}
                      onChange={(e) => setAssunto(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "100%",
                          md: "100%",
                          lg: "100%",
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

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Observação"
                      name="observacao"
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "100%",
                          md: "100%",
                          lg: "100%",
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

                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Categoria"
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
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
                    >
                      {categoriasCadastradas.map((categoria) => (
                        <MenuItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </MenuItem>
                      ))}
                    </TextField>

                    {/* Campo Valor com máscara */}
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Valor (R$)"
                      name="valor"
                      type="text"
                      value={valor}
                      onChange={(e) => {
                        const valorDigitado = e.target.value;
                        const apenasNumeros = valorDigitado.replace(/\D/g, "");
                        if (apenasNumeros) {
                          const numero = parseFloat(apenasNumeros) / 100;
                          setValor(numero.toFixed(2).replace(".", ","));
                        } else {
                          setValor("");
                        }
                      }}
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "50%", lg: "50%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Money />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="flex w-[100%] items-end justify-end mt-2 ">
                    <ButtonComponent
                      startIcon={<AddCircleOutline fontSize="small" />}
                      title={"Cadastrar"}
                      subtitle={"Cadastrar"}
                      disabled={!camposPreenchidos()}
                      buttonSize="large"
                      onClick={handleCadastrarFluxo}
                    />
                  </div>
                </div>
              </CentralModal>

              {/* Modal de Filtro */}
              <CentralModal
                tamanhoTitulo={"81%"}
                maxHeight={"90vh"}
                top={"20%"}
                left={"28%"}
                width={"500px"}
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
                      value={filtros.dataInicio}
                      onChange={(e) =>
                        setFiltros({ ...filtros, dataInicio: e.target.value })
                      }
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
                      value={filtros.dataFim}
                      onChange={(e) =>
                        setFiltros({ ...filtros, dataFim: e.target.value })
                      }
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
                      label="Status"
                      value={filtros.statusFiltro}
                      onChange={(e) =>
                        setFiltros({ ...filtros, statusFiltro: e.target.value })
                      }
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "47%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {filtros.statusFiltro === "pago" ? (
                              <CheckCircle />
                            ) : filtros.statusFiltro === "pendente" ? (
                              <Pending />
                            ) : (
                              <FilterAlt />
                            )}
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="pendente">Pendente</MenuItem>
                      <MenuItem value="pago">Pago</MenuItem>
                    </TextField>

                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Tipo"
                      value={filtros.tipoFiltro}
                      onChange={(e) =>
                        setFiltros({ ...filtros, tipoFiltro: e.target.value })
                      }
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "49%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TransformIcon />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="entrada">Entrada</MenuItem>
                      <MenuItem value="saida">Saída</MenuItem>
                    </TextField>

                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Categoria"
                      value={filtros.categoriaFiltro}
                      onChange={(e) =>
                        setFiltros({
                          ...filtros,
                          categoriaFiltro: e.target.value,
                        })
                      }
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
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {categoriasCadastradas.map((categoria) => (
                        <MenuItem
                          key={categoria.id}
                          value={categoria.id.toString()}
                        >
                          {categoria.nome}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Tipo de Lançamento"
                      value={filtros.origemFiltro}
                      onChange={(e) =>
                        setFiltros({ ...filtros, origemFiltro: e.target.value })
                      }
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "49%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Category />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="movimentacao">
                        Movimentação Manual
                      </MenuItem>

                      {/* Contas a Receber */}
                      <MenuItem value="conta_receber_variavel">
                        Contas a Receber (Variável)
                      </MenuItem>
                      <MenuItem value="conta_receber_fixo">
                        Contas a Receber (Fixo - Parcelas)
                      </MenuItem>

                      {/* Contas a Pagar */}
                      <MenuItem value="conta_pagar_variavel">
                        Contas a Pagar (Variável)
                      </MenuItem>
                      <MenuItem value="conta_pagar_fixo">
                        Contas a Pagar (Fixo - Parcelas)
                      </MenuItem>

                      {/* Comissões e Prestadores */}
                      <MenuItem value="comissao_receber">
                        Comissões a Receber
                      </MenuItem>
                      <MenuItem value="pagamento_prestador">
                        Pagamentos a Prestadores
                      </MenuItem>

                      {/* Palestras */}
                      <MenuItem value="palestra_curso">
                        Palestras/Cursos
                      </MenuItem>
                    </TextField>

                    <div className="flex items-end gap-2 justify-end w-full">
                      <ButtonComponent
                        startIcon={<SearchIcon fontSize="small" />}
                        title={"Pesquisar"}
                        subtitle={"Pesquisar"}
                        buttonSize="large"
                        onClick={aplicarFiltros}
                      />
                      <ButtonComponent
                        startIcon={<FilterAlt fontSize="small" />}
                        title={"Limpar Filtros"}
                        subtitle={"Limpar Filtros"}
                        buttonSize="large"
                        onClick={limparFiltros}
                        disabled={!filtrosAtivos}
                      />
                    </div>
                  </div>
                </div>
              </CentralModal>

              <ModalLateral
                open={modalEdicaoAberta}
                handleClose={() => {
                  resetarCampos();
                  setModalEdicaoAberta(false);
                }}
                tituloModal="Editar Lançamento"
                icon={<Edit />}
                tamanhoTitulo="75%"
                conteudo={
                  <div className="flex flex-wrap w-full items-center gap-3">
                    {/* Campo Tipo - apenas leitura pois não deve mudar */}
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Tipo"
                      value={tipo}
                      disabled
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "48%", lg: "48%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TransformIcon />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="1">Entrada</MenuItem>
                      <MenuItem value="2">Saída</MenuItem>
                    </TextField>

                    {dataVencimento && (
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Data Vencimento"
                        type="date"
                        value={dataVencimento}
                        onChange={(e) => setDataVencimento(e.target.value)}
                        autoComplete="off"
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
                      />
                    )}

                    {/* Assunto - apenas leitura */}
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Assunto"
                      name="assunto"
                      disabled
                      value={assunto}
                      autoComplete="off"
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "100%",
                          md: "100%",
                          lg: "100%",
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

                    {/* Categoria - editável */}
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Categoria"
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "48%", lg: "48%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Category />
                          </InputAdornment>
                        ),
                      }}
                    >
                      {categoriasCadastradas.map((categoria) => (
                        <MenuItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </MenuItem>
                      ))}
                    </TextField>

                    {prestador && (
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Prestador"
                        value={prestador}
                        disabled
                        autoComplete="off"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "100%",
                            md: "100%",
                            lg: "100%",
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}

                    {/* Valor - editável com máscara */}
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Valor (R$)"
                      name="valor"
                      type="text"
                      value={valor}
                      onChange={(e) => {
                        const valorDigitado = e.target.value;
                        const apenasNumeros = valorDigitado.replace(/\D/g, "");
                        if (apenasNumeros) {
                          const numero = parseFloat(apenasNumeros) / 100;
                          setValor(numero.toFixed(2).replace(".", ","));
                        } else {
                          setValor("");
                        }
                      }}
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "48%", lg: "48%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Money />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <div className="flex w-[100%] items-end justify-end mt-2">
                      <ButtonComponent
                        startIcon={<Save fontSize="small" />}
                        title={"Salvar"}
                        onClick={handleAtualizarFluxo}
                        disabled={!camposPreenchidos()}
                        subtitle={"Salvar"}
                        buttonSize="large"
                      />
                    </div>
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

export default FluxoCaixa;
