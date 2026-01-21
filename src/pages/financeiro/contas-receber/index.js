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
  Print,
  StarOutlineSharp,
} from "@mui/icons-material";
import {
  IconButton,
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
import ParcelasContasReceber from "./parcelas";
import { buscarRelatorioPretadores } from "../../../service/get/relatorio-prestador";
import { buscarPalestraCurso } from "../../../service/get/palestra-curso";

const ContasReceber = () => {
  const [informacoes, setInformacoes] = useState(false);
  const [tipoCusto, setTipoCusto] = useState("fixo");
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState(false);
  const [parcelas, setParcelas] = useState(false);
  const [categoriasCadastradas, setCategoriasCadastradas] = useState([]);
  const [contasReceberVi, setContasReceberVi] = useState([]);
  const [nome, setNome] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [quantidadeParcelas, setQuantidadeParcelas] = useState("");
  const [valorMensal, setValorMensal] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [parcelasEditando, setParcelasEditando] = useState({});
  const [loadingParcelas, setLoadingParcelas] = useState({});
  const [prestadores, setPrestadores] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");

  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

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

  const VisualizarParcelas = (conta) => {
    setContaSelecionada(conta);
    setParcelas(true);
  };

  const FecharFiltro = () => setFiltro(false);

  const LimparFiltros = () => {
    setFiltroDataInicio("");
    setFiltroDataFim("");
    setFiltroCategoria("");
    setFiltroStatus("");
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deletarContasReceber(id);
      await buscarContas();
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
    setNome(conta.nome);
    setCategoriaId(conta.categoria_id || "");
    const dataOriginal = conta.data_inicio || conta.data;
    const dataParaInput = dataOriginal.includes("/")
      ? dataOriginal.split("/").reverse().join("-")
      : dataOriginal.split("T")[0];
    setDataInicio(dataParaInput);
    const tipo =
      conta.tipo === "Custo Fixo" || conta.custo_fixo ? "fixo" : "variavel";
    setTipoCusto(tipo);
    if (tipo === "fixo") {
      setQuantidadeParcelas(conta.quantidade_parcelas || "");
      setValorMensal(
        conta.valor_mensal ||
          conta.valor?.replace("R$ ", "").replace(",", ".") ||
          "",
      );
    } else {
      setValorTotal(
        conta.valor_total ||
          conta.valor?.replace("R$ ", "").replace(",", ".") ||
          "",
      );
    }
    setFormaPagamento(conta.forma_pagamento || "");
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const tiposPalestraUnicos = useMemo(() => {
    const tipos = new Set();
    contasReceberVi.forEach((item) => {
      if (item.tipoOrigem === "Palestra/Curso" && item.categoria) {
        tipos.add(item.categoria);
      }
    });
    return Array.from(tipos);
  }, [contasReceberVi]);

  const mapearDadosParaTabela = (
    dadosContas,
    dadosPrestadores,
    dadosPalestras,
  ) => {
    const contasMapeadas = dadosContas.map((conta) => {
      const tipo = conta.custo_fixo ? "Custo Fixo" : "Custo Variável";
      const dataFormatada = new Date(conta.data_inicio).toLocaleDateString(
        "pt-BR",
      );
      const valor = conta.custo_fixo
        ? `R$ ${parseFloat(conta.valor_mensal).toFixed(2).replace(".", ",")}`
        : `R$ ${parseFloat(conta.valor_total).toFixed(2).replace(".", ",")}`;
      const categoria = conta.categoria_id
        ? categoriasCadastradas.find((cat) => cat.id === conta.categoria_id)
            ?.nome
        : conta.categoria || `ID ${conta.categoria_id}`;
      let statusGeral = calcularStatusContas(conta);
      return {
        ...conta,
        id: conta.id,
        tipoOrigem: "Conta à Receber",
        nome: conta.nome,
        data: dataFormatada,
        categoria: categoria,
        valor: valor,
        status: statusGeral,
        tipo: tipo,
        data_inicio: conta.data_inicio,
        valor_mensal: conta.valor_mensal,
        valor_total: conta.valor_total,
        custo_fixo: conta.custo_fixo,
        forma_pagamento: conta.forma_pagamento,
      };
    });

    const palestrasMapeadas = dadosPalestras.map((palestra) => {
      const dataFormatada = new Date(palestra.data).toLocaleDateString("pt-BR");
      const valor = `R$ ${parseFloat(palestra.valor)
        .toFixed(2)
        .replace(".", ",")}`;

      let statusGeral = "Pendente";
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Se não tem parcelas, usa o status direto da palestra
      if (!palestra.parcelas || palestra.parcelas.length === 0) {
        statusGeral = palestra.status_pagamento === "2" ? "Pago" : "Pendente";
      }
      // Se tem parcelas, verifica o status de cada uma
      else {
        const todasPagas = palestra.parcelas.every(
          (p) => p.status_pagamento === "2",
        );
        const nenhumaPaga = palestra.parcelas.every(
          (p) => p.status_pagamento === "1",
        );
        const algumasPagas = !todasPagas && !nenhumaPaga;

        // Verifica se há parcelas vencidas não pagas
        const parcelasVencidasNaoPagas = palestra.parcelas.some((p) => {
          const dataVencimento = new Date(p.data_vencimento);
          dataVencimento.setHours(0, 0, 0, 0);
          return dataVencimento < hoje && p.status_pagamento === "1";
        });

        if (todasPagas) {
          statusGeral = "Pago";
        } else if (parcelasVencidasNaoPagas) {
          statusGeral = "Pendente";
        } else if (algumasPagas) {
          statusGeral = "Andamento";
        } else {
          statusGeral = "Pendente";
        }
      }

      return {
        ...palestra,
        id: palestra.id,
        tipoOrigem: "Palestra/Curso",
        nome: `${palestra.nome} (${palestra.cliente?.nome || "Sem cliente"})`,
        data: dataFormatada,
        categoria: palestra.tipoPalestra?.nome || "Palestra/Curso",
        valor: valor,
        status: statusGeral,
        tipo: "Palestra/Curso",
        data_inicio: palestra.data,
        valor_total: palestra.valor,
      };
    });

    const prestadoresMapeados = dadosPrestadores.flatMap((prestador) =>
      prestador.servicos.map((servico) => {
        const dataFormatada = servico.data_pagamento
          ? new Date(servico.data_pagamento).toLocaleDateString("pt-BR")
          : new Date(servico.data_inicio).toLocaleDateString("pt-BR");

        // Calcular o valor total da comissão somando todas as parcelas
        const valorComissaoTotal =
          servico.parcelas?.reduce((total, parcela) => {
            return total + parseFloat(parcela.valor_comissao || 0);
          }, 0) || 0;

        const valor = `R$ ${valorComissaoTotal.toFixed(2).replace(".", ",")}`;

        let statusGeral = "Pendente";
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (servico.parcelas && servico.parcelas.length > 0) {
          // Verifica se há parcelas vencidas não pagas
          const parcelasVencidasNaoPagas = servico.parcelas.some((parcela) => {
            const dataVencimento = new Date(parcela.data_pagamento);
            dataVencimento.setHours(0, 0, 0, 0);
            return (
              dataVencimento < hoje && parcela.status_pagamento_comissao !== 1
            );
          });

          // Verifica se todas as parcelas estão pagas
          const todasPagas = servico.parcelas.every(
            (parcela) => parcela.status_pagamento_comissao === 1,
          );

          if (parcelasVencidasNaoPagas) {
            // Se houver qualquer parcela vencida não paga, status é Pendente
            statusGeral = "Pendente";
          } else if (todasPagas) {
            // Se todas as parcelas estão pagas
            statusGeral = "Pago";
          } else {
            // Caso contrário, verifica se há parcelas pagas e pendentes
            const temParcelasPagas = servico.parcelas.some(
              (parcela) => parcela.status_pagamento_comissao === 1,
            );
            const temParcelasPendentes = servico.parcelas.some(
              (parcela) => parcela.status_pagamento_comissao !== 1,
            );

            if (temParcelasPagas && temParcelasPendentes) {
              statusGeral = "Andamento";
            } else if (temParcelasPendentes) {
              statusGeral = "Pendente";
            }
          }
        }

        return {
          ...servico,
          id: servico.id,
          tipoOrigem: "Prestador",
          nome: `${servico.servico.nome} (${prestador.prestador.nome})`,
          data: dataFormatada,
          categoria: prestador.prestador.nome,
          valor: valor,
          status: statusGeral,
          tipo: "Serviço Prestador",
          data_inicio: servico.data_pagamento || servico.data_inicio,
          valor_total: valorComissaoTotal,
        };
      }),
    );

    return [...contasMapeadas, ...palestrasMapeadas, ...prestadoresMapeados];
  };

  const calcularStatusContas = (conta) => {
    let statusGeral = "Pendente";
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (conta.parcelas && conta.parcelas.length > 0) {
      // 1. Verifica primeiro se há parcelas vencidas não pagas (prioridade máxima)
      const parcelasVencidasNaoPagas = conta.parcelas.some((p) => {
        const dataVencimento = new Date(p.data_vencimento || p.data_pagamento);
        dataVencimento.setHours(0, 0, 0, 0);
        return dataVencimento < hoje && p.status_pagamento === 2;
      });

      if (parcelasVencidasNaoPagas) {
        return "Pendente"; // Se tiver qualquer parcela vencida não paga
      }

      // 2. Verifica se todas as parcelas estão pagas
      const todasPagas = conta.parcelas.every((p) => p.status_pagamento === 1);
      if (todasPagas) {
        return "Pago";
      }

      // 3. Verifica se há parcelas pendentes vencidas (que não foram capturadas no primeiro if)
      const parcelasPendentesVencidas = conta.parcelas.some((p) => {
        const dataVencimento = new Date(p.data_vencimento || p.data_pagamento);
        dataVencimento.setHours(0, 0, 0, 0);
        return dataVencimento < hoje && p.status_pagamento === 2;
      });

      if (parcelasPendentesVencidas) {
        return "Pendente";
      }

      // 4. Verifica se há parcelas pendentes não vencidas
      const parcelasPendentesNaoVencidas = conta.parcelas.some(
        (p) => p.status_pagamento === 2,
      );

      // 5. Verifica se há parcelas pagas
      const temParcelasPagas = conta.parcelas.some(
        (p) => p.status_pagamento === 1,
      );

      if (temParcelasPagas && parcelasPendentesNaoVencidas) {
        return "Andamento"; // Algumas pagas, outras pendentes mas não vencidas
      }

      if (parcelasPendentesNaoVencidas) {
        return "Pendente"; // Todas pendentes mas não vencidas
      }

      return "Pendente"; // Fallback
    } else {
      // Para contas sem parcelas (custo variável)
      if (!conta.custo_fixo) {
        const dataVencimento = new Date(conta.data_inicio);
        dataVencimento.setHours(0, 0, 0, 0);

        if (conta.status_pagamento === 1) {
          return "Pago";
        } else if (dataVencimento < hoje) {
          return "Pendente";
        }
        return "Pendente";
      }
      return "Pendente"; // Fallback para contas fixas sem parcelas
    }
  };

  const buscarContas = async () => {
    try {
      setLoading(true);
      const [dadosContas, dadosPrestadores, dadosPalestras] = await Promise.all(
        [
          buscarContasReceber(),
          buscarRelatorioPretadores(),
          buscarPalestraCurso(),
        ],
      );
      const dadosMapeados = mapearDadosParaTabela(
        dadosContas || [],
        dadosPrestadores?.data || [],
        dadosPalestras?.data || [],
      );
      setContasReceberVi(dadosMapeados);
    } catch (error) {
      console.error("Erro no componente:", error);
      CustomToast({
        type: "error",
        message: "Erro ao buscar dados financeiros",
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarServicosPrestador = async () => {
    try {
      setLoading(true);
      const response = await buscarRelatorioPretadores();
      setPrestadores(response.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar tipos de palestra",
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarPalestrasCursos = async () => {
    try {
      setLoading(true);
      const response = await buscarPalestraCurso();
      setPrestadores(response.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar tipos de palestra",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const carregarDados = async () => {
      await buscarCategoriaCadastradas();
      await buscarContas();
      await buscarServicosPrestador();
      await buscarPalestrasCursos();
    };
    carregarDados();
  }, []);

  const filtrarDados = (dados) => {
    let dadosFiltrados = dados;

    if (termoBusca) {
      dadosFiltrados = dadosFiltrados.filter((item) =>
        item.nome.toLowerCase().includes(termoBusca.toLowerCase()),
      );
    }

    if (filtroDataInicio) {
      dadosFiltrados = dadosFiltrados.filter((item) => {
        const dataItem = new Date(item.data_inicio);
        const dataInicioFiltro = new Date(filtroDataInicio);
        return dataItem >= dataInicioFiltro;
      });
    }

    if (filtroDataFim) {
      dadosFiltrados = dadosFiltrados.filter((item) => {
        const dataItem = new Date(item.data_inicio);
        const dataFimFiltro = new Date(filtroDataFim);
        return dataItem <= dataFimFiltro;
      });
    }

    if (filtroCategoria) {
      dadosFiltrados = dadosFiltrados.filter((item) => {
        if (filtroCategoria.startsWith("cat-")) {
          // Filtro para categorias normais
          const categoriaId = parseInt(filtroCategoria.replace("cat-", ""));
          return (
            item.tipoOrigem === "Conta à Receber" &&
            item.categoria_id === categoriaId
          );
        } else if (filtroCategoria.startsWith("palestra-")) {
          // Filtro para tipos de palestra
          const tipoPalestra = filtroCategoria.replace("palestra-", "");
          return (
            item.tipoOrigem === "Palestra/Curso" &&
            item.categoria === tipoPalestra
          );
        }
        return false;
      });
    }

    if (filtroStatus) {
      dadosFiltrados = dadosFiltrados.filter(
        (item) => item.status === filtroStatus,
      );
    }

    return dadosFiltrados;
  };

  const dadosFiltrados = useMemo(() => {
    return filtrarDados(contasReceberVi);
  }, [
    contasReceberVi,
    termoBusca,
    filtroDataInicio,
    filtroDataFim,
    filtroCategoria,
    filtroStatus,
  ]);

  const calcularTotais = (dados) => {
    let totalPago = 0;
    let totalPendente = 0;
    let totalAndamento = 0;

    dados.forEach((item) => {
      if (item.tipoOrigem === "Conta à Receber") {
        // Para contas à receber normais
        const valorNumerico = parseFloat(
          item.valor.replace("R$ ", "").replace(".", "").replace(",", "."),
        );

        if (item.status === "Pago") {
          totalPago += valorNumerico;
        } else if (item.status === "Pendente") {
          totalPendente += valorNumerico;
        } else if (item.status === "Andamento") {
          totalAndamento += valorNumerico;
        }
      } else if (item.tipoOrigem === "Palestra/Curso") {
        // Para palestras/cursos
        if (item.parcelas && item.parcelas.length > 0) {
          item.parcelas.forEach((parcela) => {
            const valorParcela = parseFloat(parcela.valor);
            if (parcela.status_pagamento === "2") {
              // 2 = Pago
              totalPago += valorParcela;
            } else {
              totalPendente += valorParcela;
            }
          });
        } else {
          // Se não tem parcelas, verifica o status direto do item
          const valorNumerico = parseFloat(
            item.valor_total ||
              item.valor.replace("R$ ", "").replace(".", "").replace(",", "."),
          );
          if (item.status_pagamento === "2") {
            // 2 = Pago
            totalPago += valorNumerico;
          } else {
            totalPendente += valorNumerico;
          }
        }
      } else if (item.tipoOrigem === "Prestador") {
        // Para prestadores de serviço
        if (item.parcelas && item.parcelas.length > 0) {
          item.parcelas.forEach((parcela) => {
            const valorComissao = parseFloat(parcela.valor_comissao || 0);
            if (parcela.status_pagamento_comissao === 1) {
              // 1 = Pago
              totalPago += valorComissao;
            } else {
              totalPendente += valorComissao;
            }
          });
        } else {
          const valorNumerico = parseFloat(
            item.valor_total ||
              item.valor.replace("R$ ", "").replace(".", "").replace(",", "."),
          );
          if (item.status_pagamento_comissao === 1) {
            // 1 = Pago
            totalPago += valorNumerico;
          } else {
            totalPendente += valorNumerico;
          }
        }
      }
    });

    return {
      totalPago,
      totalPendente,
      totalAndamento,
      totalGeral: totalPago + totalPendente + totalAndamento,
    };
  };

  const totais = useMemo(
    () => calcularTotais(dadosFiltrados),
    [dadosFiltrados],
  );

  // Format the values to Brazilian currency format
  const formatarMoeda = (valor) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

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
                    <MonetizationOnIcon /> Total Pago:{" "}
                    {formatarMoeda(totais.totalPago)}
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
                    <MonetizationOnIcon /> Total:{" "}
                    {formatarMoeda(totais.totalGeral)}
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
              <div className="w-full flex itens-center  justify-center">
                {loading ? (
                  <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
                    <TableLoading />
                    <label className="text-xs text-primary">
                      Carregando Informações !
                    </label>
                  </div>
                ) : dadosFiltrados.length > 0 ? (
                  <TableComponent
                    headers={headerContasReceber}
                    rows={dadosFiltrados}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      view: (row) => VisualizarParcelas(row),
                      edit: (row) => Informacoes(row),
                      delete: (row) => handleDelete(row.id),
                    }}
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
              <CadastrarContaReceber
                cadastroUsuario={cadastroUsuario}
                setCadastroUsuario={setCadastroUsuario}
                categoriasCadastradas={categoriasCadastradas}
                onCadastroSuccess={buscarContas}
              />
              <EditarContaREceber
                informacoes={informacoes}
                handleClosInformacoes={handleCloseInformacoesInfo}
                contaSelecionada={contaSelecionada}
                categoriasCadastradas={categoriasCadastradas}
                onUpdateSuccess={buscarContas}
              />
              <ParcelasContasReceber
                parcelas={parcelas}
                contaSelecionada={contaSelecionada}
                setContaSelecionada={setContaSelecionada}
                handleClosParcelas={() => {
                  setParcelas(false);
                  buscarContas();
                }}
                onClose={buscarContas}
                parcelasEditando={parcelasEditando}
                setParcelasEditando={setParcelasEditando}
                loadingParcelas={loadingParcelas}
                setLoadingParcelas={setLoadingParcelas}
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
                        {/* Categorias normais */}
                        {categoriasCadastradas.map((categoria) => (
                          <MenuItem
                            key={`cat-${categoria.id}`}
                            value={`cat-${categoria.id}`}
                          >
                            {categoria.nome}
                          </MenuItem>
                        ))}
                        {/* Tipos de palestra/curso */}
                        {tiposPalestraUnicos.map((tipo, index) => (
                          <MenuItem
                            key={`palestra-${index}`}
                            value={`palestra-${tipo}`}
                          >
                            {tipo}
                          </MenuItem>
                        ))}
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
                        <MenuItem value="Andamento">Andamento</MenuItem>
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
                        title={"Pesquisar"}
                        subtitle={"Pesquisar"}
                        buttonSize="large"
                        onClick={() => setFiltro(false)}
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
