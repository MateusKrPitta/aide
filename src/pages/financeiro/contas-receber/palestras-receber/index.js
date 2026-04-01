import { InputAdornment, TextField } from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import {
  AddCircleOutline,
  Edit,
  Search,
  Work,
  Receipt,
} from "@mui/icons-material";
import { buscarContasReceberPalestra } from "../../../../service/get/contas-receber-palestra";
import { headerContasReceberPalestra } from "../../../../entities/header/financeiro/contas-receber-palestra";
import TableComponent from "../../../../components/table";
import TableLoading from "../../../../components/loading/loading-table/loading";
import CustomToast from "../../../../components/toast";
import ButtonComponent from "../../../../components/button";
import ModalLateral from "../../../../components/modal-lateral";
import { buscarContasReceberPalestraId } from "../../../../service/get/contas-receber-palestra-id";
import { atualizarStatusParcela } from "../../../../service/put/atualiza-parcela-palestra-receber";

const PalestrasReceber = () => {
  const [editando, setEditando] = useState(false);
  const [palestraSelecionada, setPalestraSelecionada] = useState(null);
  const [parcelas, setParcelas] = useState([]);
  const [parcelaEditando, setParcelaEditando] = useState(null);
  const [loadingParcela, setLoadingParcela] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    data: "",
    valor: "",
    status_pagamento: "",
    cliente_id: "",
    endereco: "",
    horario: "",
    secoes: "",
    tipo_pagamento: "",
    forma_pagamento: "",
    qtd_parcelas: "",
    primeira_data_parcela: "",
    tipo_palestra_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [pesquisar, setPesquisar] = useState("");
  const [palestras, setPalestras] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [totalItens, setTotalItens] = useState(0);
  const [dadosCarregados, setDadosCarregados] = useState(false);

  const formatarMoeda = (valor) => {
    if (!valor) return "R$ 0,00";
    const numero = typeof valor === "string" ? parseFloat(valor) : valor;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numero);
  };

  const formatarData = (data) => {
    if (!data) return "";
    const dataObj = new Date(data);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dataObj);
  };

  const getStatusChip = (status) => {
    const statusMap = {
      1: {
        label: "Pago",
        color: "success",
        bgColor: "bg-green-100 text-green-800",
      },
      2: {
        label: "Pendente",
        color: "warning",
        bgColor: "bg-yellow-100 text-yellow-800",
      },
      3: {
        label: "Cancelado",
        color: "error",
        bgColor: "bg-red-100 text-red-800",
      },
    };
    const statusInfo = statusMap[status] || {
      label: "Desconhecido",
      bgColor: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  const EditarOpcao = async (row) => {
    try {
      setLoadingDetalhes(true);
      setPalestraSelecionada(row);

      const response = await buscarContasReceberPalestraId(row.id);

      if (response && response.success && response.data) {
        const dados = response.data;

        setFormData({
          nome: dados.nome || "",
          data: dados.data ? dados.data.split("T")[0] : "",
          valor: dados.valor || "",
          status_pagamento: dados.status_pagamento?.toString() || "",
          cliente_id: dados.cliente_id?.toString() || "",
          endereco: dados.endereco || "",
          horario: dados.horario ? dados.horario.substring(0, 5) : "",
          secoes: dados.secoes?.toString() || "",
          tipo_pagamento: dados.tipo_pagamento?.toString() || "",
          forma_pagamento: dados.forma_pagamento || "",
          qtd_parcelas: dados.qtd_parcelas?.toString() || "",
          primeira_data_parcela: dados.primeira_data_parcela
            ? dados.primeira_data_parcela.split("T")[0]
            : "",
          tipo_palestra_id: dados.tipo_palestra_id?.toString() || "",
        });

        setParcelas(dados.parcelas || []);
        setEditando(true);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes da palestra:", error);
      CustomToast({
        type: "error",
        message: "Erro ao carregar detalhes da palestra",
      });
    } finally {
      setLoadingDetalhes(false);
    }
  };

  const handleCloseEdicao = () => {
    setEditando(false);
    setPalestraSelecionada(null);
    setParcelas([]);
    setParcelaEditando(null);
    setFormData({
      nome: "",
      data: "",
      valor: "",
      status_pagamento: "",
      cliente_id: "",
      endereco: "",
      horario: "",
      secoes: "",
      tipo_pagamento: "",
      forma_pagamento: "",
      qtd_parcelas: "",
      primeira_data_parcela: "",
      tipo_palestra_id: "",
    });
  };

  const handleStatusParcelaChange = async (parcelaId, novoStatus) => {
    try {
      setLoadingParcela(true);

      const response = await atualizarStatusParcela(parcelaId, novoStatus);

      if (response && response.success) {
        CustomToast({
          type: "success",
          message: "Status da parcela atualizado com sucesso!",
        });

        setParcelas((prevParcelas) =>
          prevParcelas.map((parcela) =>
            parcela.id === parcelaId
              ? { ...parcela, status_pagamento: novoStatus.toString() }
              : parcela,
          ),
        );

        setParcelaEditando(null);
      }
    } catch (error) {
      console.error("Erro ao atualizar status da parcela:", error);
    } finally {
      setLoadingParcela(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSalvarEdicao = async () => {
    try {
      setLoading(true);

      CustomToast({
        type: "success",
        message: "Palestra atualizada com sucesso!",
      });

      buscarPalestras(paginaAtual, itensPorPagina, pesquisar);
      handleCloseEdicao();
    } catch (error) {
      console.error("Erro ao atualizar palestra:", error);
      CustomToast({
        type: "error",
        message: "Erro ao atualizar palestra",
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarPalestras = useCallback(
    async (pagina = 1, limite = 10, busca = "") => {
      try {
        setLoading(true);

        const response = await buscarContasReceberPalestra(
          pagina,
          limite,
          busca,
        );

        if (response && response.success) {
          if (response.pagination) {
            setPalestras(response.data || []);
            setTotalItens(response.pagination.total || 0);
            setPaginaAtual(response.pagination.page || 1);
            setItensPorPagina(response.pagination.perPage || 10);
          } else {
            setPalestras(response.data || []);
            setTotalItens(response.data?.length || 0);
          }
          setDadosCarregados(true);
        } else {
          CustomToast({
            type: "error",
            message: response?.message || "Erro ao buscar palestras",
          });
          setPalestras([]);
          setTotalItens(0);
        }
      } catch (error) {
        console.error("Erro ao buscar palestras:", error);
        setPalestras([]);
        setTotalItens(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const formatarDadosParaTabela = (dados) => {
    if (!dados || !Array.isArray(dados)) {
      return [];
    }

    return dados.map((palestra) => {
      const valorFormatado = palestra.valor
        ? formatarMoeda(palestra.valor)
        : "R$ 0,00";

      const parcelasArray = palestra.parcelas || [];
      const totalParcelas = parcelasArray.length;
      const parcelasPagas = parcelasArray.filter(
        (p) => p.status_pagamento === "1",
      ).length;

      return {
        id: palestra.id,
        nome: palestra.nome || "Não informado",
        data: palestra.data ? formatarData(palestra.data) : "Não informado",
        valor: valorFormatado,
        valor_numerico: parseFloat(palestra.valor || 0),
        status: palestra.status_pagamento || "Não informado",
        cliente: palestra.cliente || "Não informado",
        parcelas: totalParcelas > 0 ? `${parcelasPagas}/${totalParcelas}` : "-",
      };
    });
  };

  const RenderParcelas = () => {
    if (!parcelas || parcelas.length === 0) {
      return (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Receipt className="text-gray-400 mb-2" sx={{ fontSize: 40 }} />
          <p className="text-gray-500">
            Nenhuma parcela cadastrada para esta palestra/curso.
          </p>
        </div>
      );
    }

    const valorTotal = parcelas.reduce(
      (acc, p) => acc + parseFloat(p.valor || 0),
      0,
    );
    const parcelasPagas = parcelas.filter(
      (p) => p.status_pagamento === "1",
    ).length;

    return (
      <div className="w-full">
        {/* Tabela de Parcelas */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Nº Parcela
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Valor
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Data Vencimento
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {parcelas.map((parcela) => (
                <tr key={parcela.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">
                    {parcela.numero_parcela}ª Parcela
                  </td>
                  <td className="py-3 px-4 text-green-600 font-medium">
                    {formatarMoeda(parcela.valor)}
                  </td>
                  <td className="py-3 px-4">
                    {parcela.data_vencimento
                      ? formatarData(parcela.data_vencimento)
                      : "Não informado"}
                  </td>
                  <td className="py-3 px-4">
                    {parcelaEditando === parcela.id ? (
                      <select
                        value={parcela.status_pagamento}
                        onChange={(e) =>
                          handleStatusParcelaChange(parcela.id, e.target.value)
                        }
                        disabled={loadingParcela}
                        className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onBlur={() => setParcelaEditando(null)}
                      >
                        <option value="1">Pago</option>
                        <option value="2">Pendente</option>
                        <option value="3">Cancelado</option>
                      </select>
                    ) : (
                      getStatusChip(parcela.status_pagamento)
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setParcelaEditando(parcela.id)}
                      disabled={loadingParcela}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      <Edit fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumo das Parcelas */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <span className="text-sm text-gray-600">Total de Parcelas</span>
              <p className="text-lg font-semibold">{parcelas.length}</p>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">Valor Total</span>
              <p className="text-lg font-semibold text-green-600">
                {formatarMoeda(valorTotal)}
              </p>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">Parcelas Pagas</span>
              <p className="text-lg font-semibold text-blue-600">
                {parcelasPagas} / {parcelas.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const palestrasFiltradas = React.useMemo(() => {
    if (!pesquisar.trim()) {
      return palestras;
    }

    const termo = pesquisar.toLowerCase();
    return palestras.filter((palestra) => {
      return (
        (palestra.nome && palestra.nome.toLowerCase().includes(termo)) ||
        (palestra.cliente && palestra.cliente.toLowerCase().includes(termo)) ||
        (palestra.status_pagamento &&
          palestra.status_pagamento.toLowerCase().includes(termo))
      );
    });
  }, [palestras, pesquisar]);

  useEffect(() => {
    if (!dadosCarregados) {
      buscarPalestras(1, itensPorPagina, "");
    }

    return () => {
    };
  }, [dadosCarregados, itensPorPagina, buscarPalestras]);

  const handlePageChange = (novaPagina) => {
    setPaginaAtual(novaPagina);
    buscarPalestras(novaPagina, itensPorPagina, pesquisar);
  };

  const handleRowsPerPageChange = (novoLimite) => {
    setItensPorPagina(novoLimite);
    setPaginaAtual(1);
    buscarPalestras(1, novoLimite, pesquisar);
  };

  useEffect(() => {
    if (!dadosCarregados) return;

    if (!pesquisar.trim()) {
      buscarPalestras(1, itensPorPagina, "");
      return;
    }

    const timeoutId = setTimeout(() => {
      buscarPalestras(1, itensPorPagina, pesquisar);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [pesquisar, itensPorPagina, buscarPalestras, dadosCarregados]);

  const handleViewPalestra = (row) => {
    console.log("Visualizar palestra:", row);
  };

  const handleDeletePalestra = (row) => {
    console.log("Deletar palestra:", row);
  };

  return (
    <div className="w-[100%] itens-center mt-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[100%]">
      <div className="flex gap-2 flex-wrap w-full justify-center md:justify-start mb-4">
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          label="Pesquisar"
          autoComplete="off"
          value={pesquisar}
          onChange={(e) => setPesquisar(e.target.value)}
          sx={{ width: { xs: "72%", sm: "50%", md: "40%", lg: "40%" } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          placeholder="Pesquise por nome, cliente ou status..."
          disabled={!dadosCarregados}
        />
      </div>

      <div className="w-full flex items-center justify-center">
        {loading ? (
          <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
            <TableLoading />
            <label className="text-xs text-primary">
              Carregando Palestras/Cursos...
            </label>
          </div>
        ) : palestrasFiltradas.length > 0 ? (
          <div className="w-full">
            <TableComponent
              headers={headerContasReceberPalestra}
              rows={formatarDadosParaTabela(palestrasFiltradas)}
              actionsLabel={"Ações"}
              actionCalls={{
                view: (row) => handleViewPalestra(row),
                edit: (row) => EditarOpcao(row),
                delete: (row) => handleDeletePalestra(row),
              }}
              pagination={true}
              totalRows={totalItens}
              page={paginaAtual}
              rowsPerPage={itensPorPagina}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </div>
        ) : (
          <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
            {dadosCarregados ? (
              <>
                <TableLoading />
                <label className="text-xs">
                  {pesquisar
                    ? "Nenhuma palestra encontrada com esse filtro!"
                    : "Nenhuma palestra/curso cadastrado!"}
                </label>
              </>
            ) : (
              <label className="text-xs">Aguarde, carregando dados...</label>
            )}
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <ModalLateral
        open={editando}
        handleClose={handleCloseEdicao}
        tituloModal={`Editar Palestra - ${palestraSelecionada?.nome || ""}`}
        icon={<Edit />}
        width={"700px"}
        tamanhoTitulo="75%"
        conteudo={
          <div className="w-full overflow-y-auto max-h-[calc(100vh-120px)] px-1">
            {loadingDetalhes ? (
              <div className="flex items-center justify-center h-64">
                <TableLoading />
                <label className="text-xs text-primary ml-2">
                  Carregando dados...
                </label>
              </div>
            ) : (
              <>
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-md font-semibold text-primary mb-3 flex items-center gap-2">
                    <Work fontSize="small" />
                    Dados da Palestra/Curso
                  </h3>
                  <div className="mt-4 flex gap-3 flex-wrap">
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Nome da Palestra/Curso"
                      name="nome"
                      autoComplete="off"
                      value={formData.nome}
                      onChange={(e) =>
                        handleInputChange("nome", e.target.value)
                      }
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "100%",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Work />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Data"
                      type="date"
                      name="data"
                      value={formData.data}
                      onChange={(e) =>
                        handleInputChange("data", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "48%",
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Valor"
                      name="valor"
                      type="number"
                      value={formData.valor}
                      onChange={(e) =>
                        handleInputChange("valor", e.target.value)
                      }
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "48%",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">R$</InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Status Pagamento"
                      name="status_pagamento"
                      value={formData.status_pagamento}
                      onChange={(e) =>
                        handleInputChange("status_pagamento", e.target.value)
                      }
                      select
                      SelectProps={{
                        native: true,
                      }}
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "48%",
                        },
                      }}
                    >
                      <option value="">Selecione</option>
                      <option value="1">Pago</option>
                      <option value="2">Pendente</option>
                      <option value="3">Cancelado</option>
                    </TextField>

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Endereço"
                      name="endereco"
                      value={formData.endereco}
                      onChange={(e) =>
                        handleInputChange("endereco", e.target.value)
                      }
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "48%",
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Horário"
                      name="horario"
                      type="time"
                      value={formData.horario}
                      onChange={(e) =>
                        handleInputChange("horario", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "48%",
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Seções"
                      name="secoes"
                      type="number"
                      value={formData.secoes}
                      onChange={(e) =>
                        handleInputChange("secoes", e.target.value)
                      }
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "48%",
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Tipo de Pagamento"
                      name="tipo_pagamento"
                      value={formData.tipo_pagamento}
                      onChange={(e) =>
                        handleInputChange("tipo_pagamento", e.target.value)
                      }
                      select
                      SelectProps={{
                        native: true,
                      }}
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "48%",
                        },
                      }}
                    >
                      <option value="">Selecione</option>
                      <option value="1">À vista</option>
                      <option value="2">Parcelado</option>
                    </TextField>

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Forma de Pagamento"
                      name="forma_pagamento"
                      value={formData.forma_pagamento}
                      onChange={(e) =>
                        handleInputChange("forma_pagamento", e.target.value)
                      }
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "48%",
                        },
                      }}
                    />

                    {formData.tipo_pagamento === "2" && (
                      <>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Quantidade de Parcelas"
                          name="qtd_parcelas"
                          type="number"
                          value={formData.qtd_parcelas}
                          onChange={(e) =>
                            handleInputChange("qtd_parcelas", e.target.value)
                          }
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "48%",
                            },
                          }}
                        />

                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Primeira Data da Parcela"
                          type="date"
                          name="primeira_data_parcela"
                          value={formData.primeira_data_parcela}
                          onChange={(e) =>
                            handleInputChange(
                              "primeira_data_parcela",
                              e.target.value,
                            )
                          }
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            width: {
                              xs: "100%",
                              sm: "50%",
                              md: "40%",
                              lg: "48%",
                            },
                          }}
                        />
                      </>
                    )}

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="ID do Cliente"
                      name="cliente_id"
                      value={formData.cliente_id}
                      onChange={(e) =>
                        handleInputChange("cliente_id", e.target.value)
                      }
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "48%",
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="ID Tipo Palestra"
                      name="tipo_palestra_id"
                      value={formData.tipo_palestra_id}
                      onChange={(e) =>
                        handleInputChange("tipo_palestra_id", e.target.value)
                      }
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "50%",
                          md: "40%",
                          lg: "48%",
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Seção de Parcelas */}
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-md font-semibold text-primary mb-3 flex items-center gap-2">
                    <Receipt fontSize="small" />
                    Gerenciamento de Parcelas
                  </h3>

                  <RenderParcelas />
                </div>

                {/* Botões de Ação */}
                <div className="flex w-[100%] items-end justify-end gap-3 mt-4 sticky bottom-0 bg-white py-3">
                  <ButtonComponent
                    variant="outlined"
                    title={"Cancelar"}
                    subtitle={"Cancelar"}
                    buttonSize="large"
                    onClick={handleCloseEdicao}
                  />
                  <ButtonComponent
                    startIcon={<AddCircleOutline fontSize="small" />}
                    title={"Salvar"}
                    subtitle={"Salvar"}
                    buttonSize="large"
                    onClick={handleSalvarEdicao}
                    loading={loading}
                  />
                </div>
              </>
            )}
          </div>
        }
      />
    </div>
  );
};

export default PalestrasReceber;
