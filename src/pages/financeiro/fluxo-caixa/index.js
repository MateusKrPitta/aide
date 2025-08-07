import React, { useEffect, useState } from "react";
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
  Person,
  Person2,
  Print,
  Save,
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

const FluxoCaixa = () => {
  const [cadastroUsuario, setCadastroUsuario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assunto, setAssunto] = useState("");
  const [observacao, setObservacao] = useState("");
  const [valor, setValor] = useState("");
  const [modalEdicaoAberta, setModalEdicaoAberta] = useState(false);
  const [tipo, setTipo] = useState("1");
  const [categoriaId, setCategoriaId] = useState("");
  const [categoriasCadastradas, setCategoriasCadastradas] = useState([]);
  const [fluxo, setFluxo] = useState([]);

  const [filtrosAtivos, setFiltrosAtivos] = useState(false);

  const limparFiltros = () => {
    setFiltros({
      dataInicio: "",
      dataFim: "",
      tipoFiltro: "",
      categoriaFiltro: "",
    });
    setFiltrosAtivos(false);
    buscarFluxo();
  };

  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    tipoFiltro: "",
    categoriaFiltro: "",
  });
  const [filtro, setFiltro] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const calcularTotais = () => {
    const entradas = fluxo
      .filter((item) => item.tipo === 1)
      .reduce((total, item) => total + parseFloat(item.valor), 0);

    const saidas = fluxo
      .filter((item) => item.tipo === 2)
      .reduce((total, item) => total + parseFloat(item.valor), 0);

    const saldo = entradas - saidas;

    return {
      entradas: entradas.toFixed(2).replace(".", ","),
      saidas: saidas.toFixed(2).replace(".", ","),
      saldo: saldo.toFixed(2).replace(".", ","),
    };
  };

  const totais = calcularTotais();
  const FecharFiltro = () => setFiltro(false);
  const FecharCadastroUsuario = () => {
    resetarCampos();
    setCadastroUsuario(false);
  };

  const handleDeletarFluxo = async (itemId) => {
    try {
      setLoading(true);

      const id = typeof itemId === "object" ? itemId.id : itemId;
      await deletarFluxoCaixa(id);
      CustomToast({
        type: "success",
        message: "Lançamento excluído com sucesso!",
      });
      buscarFluxo();
    } catch (error) {
      CustomToast({
        type: "error",
        message: error.message || "Erro ao excluir lançamento",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (item) => {
    setItemEditando(item);
    setAssunto(item.assunto);
    setObservacao(item.observacao || "");
    setValor(item.valorOriginal || item.valor.replace("R$ ", ""));
    setTipo(item.tipo === "Entrada" ? "1" : "2");
    setCategoriaId(item.categoriaId || "");
    setModalEdicaoAberta(true);
  };

  const handleAtualizarFluxo = async () => {
    try {
      setLoading(true);

      const valorNumerico =
        typeof valor === "string"
          ? parseFloat(valor.replace("R$ ", "").replace(",", "."))
          : valor;

      const dadosAtualizacao = {
        tipo: parseInt(tipo),
        assunto,
        observacao,
        categoria_id: parseInt(categoriaId),
        valor: valorNumerico,
      };

      await atualizarFluxoCaixa(dadosAtualizacao, itemEditando.id);

      CustomToast({
        type: "success",
        message: "Lançamento atualizado com sucesso!",
      });

      resetarCampos();
      buscarFluxo();
    } catch (error) {
      CustomToast({
        type: "error",
        message: error.message || "Erro ao atualizar lançamento",
      });
    } finally {
      setLoading(false);
    }
  };

  const camposPreenchidos = () => {
    return (
      assunto.trim() !== "" &&
      valor.trim() !== "" &&
      categoriaId !== "" &&
      tipo !== ""
    );
  };

  const resetarCampos = () => {
    setAssunto("");
    setObservacao("");
    setValor("");
    setTipo("1");
    setCategoriaId("");
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
        (categoria) => categoria.ativo
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

  const buscarFluxo = async () => {
    try {
      setLoading(true);
      const response = await buscarFluxoCaixa();
      setFluxo(response);
    } catch (error) {
      console.error("Erro ao buscar fluxo:", error);
      const errorMessage =
        error.response?.data?.message || "Erro ao buscar fluxo de caixa";
      CustomToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCadastrarFluxo = async () => {
    try {
      setLoading(true);

      const valorFormatado = parseFloat(
        valor.replace("R$ ", "").replace(",", ".")
      );

      await criarFluxoCaixa(
        parseInt(tipo),
        assunto,
        observacao,
        parseInt(categoriaId),
        valorFormatado
      );

      CustomToast({
        type: "success",
        message: "Lançamento cadastrado com sucesso!",
      });

      setAssunto("");
      setObservacao("");
      setValor("");
      setTipo("1");
      setCategoriaId("");
      setCadastroUsuario(false);
      buscarFluxo();
    } catch (error) {
      CustomToast({
        type: "error",
        message:
          error.response?.data?.message || "Erro ao cadastrar lançamento",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    buscarCategoriaCadastradas();
    buscarFluxo();
  }, []);
  const formatarDadosParaTabela = (dados) => {
    if (!Array.isArray(dados)) return [];

    return dados.map((item) => ({
      id: item.id,
      tipo:
        item.tipo === 1
          ? "Entrada"
          : item.tipo === 2
          ? "Saída"
          : "Desconhecido",
      data: item.created_at
        ? new Date(item.created_at).toLocaleDateString("pt-BR")
        : "-",
      assunto: item.assunto || "-",
      observacao: item.observacao || "-",
      categoria: item.categoria?.nome || "Sem categoria",
      categoriaId: item.categoria?.id || null,
      valor: item.valor
        ? `R$ ${parseFloat(item.valor).toFixed(2).replace(".", ",")}`
        : "R$ 0,00",
      valorOriginal: item.valor,
    }));
  };

  const aplicarFiltros = (dados) => {
    if (!Array.isArray(dados)) return [];

    const temFiltros =
      filtros.dataInicio ||
      filtros.dataFim ||
      filtros.tipoFiltro ||
      filtros.categoriaFiltro;

    if (!temFiltros) return dados;

    return dados.filter((item) => {
      const dataItem = new Date(item.created_at);
      const dataInicio = filtros.dataInicio
        ? new Date(filtros.dataInicio)
        : null;
      const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null;

      const filtroData =
        (!dataInicio || dataItem >= dataInicio) &&
        (!dataFim || dataItem <= new Date(dataFim.setHours(23, 59, 59)));

      const filtroTipo =
        !filtros.tipoFiltro ||
        (filtros.tipoFiltro === "entrada" && item.tipo === 1) ||
        (filtros.tipoFiltro === "saida" && item.tipo === 2);

      const filtroCategoria =
        !filtros.categoriaFiltro ||
        item.categoria_id.toString() === filtros.categoriaFiltro;

      return filtroData && filtroTipo && filtroCategoria;
    });
  };
  useEffect(() => {
    const temFiltros =
      filtros.dataInicio ||
      filtros.dataFim ||
      filtros.tipoFiltro ||
      filtros.categoriaFiltro;
    setFiltrosAtivos(temFiltros);
  }, [filtros]);

  const dadosFormatados = formatarDadosParaTabela(aplicarFiltros(fluxo));
  const gerarPDF = () => {
    setLoading(true);

    Promise.all([import("jspdf"), import("jspdf-autotable")])
      .then(([jsPDFModule, autoTableModule]) => {
        const { jsPDF } = jsPDFModule;
        const doc = new jsPDF();

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("Relatório de Fluxo de Caixa", 14, 10);

        doc.setFontSize(10);
        doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 16);

        if (filtrosAtivos) {
          let periodo = "Período: ";
          if (filtros.dataInicio)
            periodo += `${new Date(filtros.dataInicio).toLocaleDateString(
              "pt-BR"
            )} `;
          if (filtros.dataFim)
            periodo += `até ${new Date(filtros.dataFim).toLocaleDateString(
              "pt-BR"
            )}`;
          doc.text(periodo, 14, 22);
        }

        const headers = [["Tipo", "Data", "Descrição", "Categoria", "Valor"]];

        const data = dadosFormatados.map((item) => [
          item.tipo,
          item.data,
          item.assunto + (item.observacao ? ` (${item.observacao})` : ""),
          item.categoria,
          item.valor,
        ]);

        autoTableModule.default(doc, {
          head: headers,
          body: data,
          startY: 28,
          styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: "linebreak",
          },
          columnStyles: {
            4: { halign: "right" },
          },
          headStyles: {
            fontStyle: "bold",
            textColor: 0,
          },
          didDrawPage: (data) => {
            doc.setFontSize(8);
            doc.text(
              `Página ${data.pageNumber}`,
              doc.internal.pageSize.width - 14,
              doc.internal.pageSize.height - 5
            );
          },
        });

        doc.save(`fluxo-caixa-${new Date().toISOString().slice(0, 10)}.pdf`);
      })
      .catch((error) => {
        console.error("Erro ao gerar PDF:", error);
        CustomToast({
          type: "error",
          message: "Erro ao gerar o relatório",
        });
      })
      .finally(() => {
        setLoading(false);
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
          <HeaderPerfil pageTitle="Fluxo de Caixa" />

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
                    <MonetizationOnIcon /> Total Entradas: R$ {totais.entradas}
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
                    <MonetizationOnIcon /> Total Saídas: {totais.saidas}
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
                ) : fluxo.length > 0 ? (
                  <TableComponent
                    headers={headerAide}
                    rows={dadosFormatados}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      edit: (row) => handleEditar(row),
                      delete: (id) => handleDeletarFluxo(id),
                    }}
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

              <CentralModal
                tamanhoTitulo={"81%"}
                maxHeight={"90vh"}
                top={"20%"}
                left={"28%"}
                width={"500px"}
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
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "40%" },
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
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "50%" },
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
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "93%" },
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
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "45%" },
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

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Valor"
                      type="number"
                      name="valor"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "40%" },
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

                  <div className="flex w-[96%] items-end justify-end mt-2 ">
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
                      label="Tipo"
                      value={filtros.tipoFiltro}
                      onChange={(e) =>
                        setFiltros({ ...filtros, tipoFiltro: e.target.value })
                      }
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "45%" },
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
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "50%" },
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
                    <div className="flex items-end gap-2 justify-end w-full">
                      <ButtonComponent
                        startIcon={<SearchIcon fontSize="small" />}
                        title={"Pesquisar"}
                        subtitle={"Pesquisar"}
                        buttonSize="large"
                        onClick={() => {
                          buscarFluxo();
                          setFiltro(false);
                        }}
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
                  setModalEdicaoAberta(false);
                }}
                tituloModal="Editar Lançamento"
                icon={<Save />}
                tamanhoTitulo="75%"
                conteudo={
                  <div className="flex flex-wrap w-full items-center gap-4">
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Tipo"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "40%" },
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
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "50%" },
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
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "93%" },
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
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "45%" },
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

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Valor"
                      name="valor"
                      type="number"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      autoComplete="off"
                      sx={{
                        width: { xs: "100%", sm: "50%", md: "40%", lg: "40%" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Money />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <div className="flex w-[96%] items-end justify-end mt-2">
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
