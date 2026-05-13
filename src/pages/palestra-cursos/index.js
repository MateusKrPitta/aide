import React, { useEffect, useState, useCallback } from "react";
import MenuMobile from "../../components/menu-mobile";
import HeaderPerfil from "../../components/navbars/perfil";
import Navbar from "../../components/navbars/header";
import { motion } from "framer-motion";
import { Autocomplete, InputAdornment, TextField } from "@mui/material";
import { Search, FilterList, FilterListOff, Print } from "@mui/icons-material";
import TableLoading from "../../components/loading/loading-table/loading";
import TableComponent from "../../components/table";
import { palestraCursosLista } from "../../entities/header/palestra-curso";
import CadastrarPalestra from "./cadastrar-palestra";
import EditarPalestra from "./editar-palestra";
import { buscarPalestraCurso } from "../../service/get/palestra-curso";
import { listarTiposPalestra } from "../../service/get/tipo-palestra";
import CustomToast from "../../components/toast";
import { cadastrosPalestraCurso } from "../../entities/class/palestra-cursos";
import { deletarPalestra } from "../../service/delete/palestra";
import { MenuItem, Select, FormControl, InputLabel, Button, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

const PalestrasCursos = () => {
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [efeito, setEfeito] = useState(false);
  const [palestraEditando, setPalestraEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lista, setLista] = useState([]);

  // Novos estados para filtros
  const [tipoPalestraId, setTipoPalestraId] = useState("");
  const [statusPagamento, setStatusPagamento] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [tiposPalestra, setTiposPalestra] = useState([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    if (showFiltersModal) {
      const fetchTipos = async () => {
        try {
          const response = await listarTiposPalestra(true);
          if (response && response.data) {
            setTiposPalestra(response.data);
          }
        } catch (error) {
          console.error("Erro ao buscar tipos de palestra:", error);
        }
      };
      fetchTipos();
    }
  }, [showFiltersModal]);

  useEffect(() => {
    if (searchTerm === "") {
      setDebouncedSearchTerm("");
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleEditar = (id) => {
    const palestraParaEditar = lista.find((item) => item.id === id);
    setPalestraEditando(palestraParaEditar);
    setEditando(true);
  };

  const handleSalvarEdicao = (palestraAtualizada) => {
    setLista(
      lista.map((item) =>
        item.id === palestraAtualizada.id ? palestraAtualizada : item,
      ),
    );
    setEditando(false);
    buscarPalestras(page, rowsPerPage, debouncedSearchTerm);
    setPalestraEditando(null);
  };

  const handleCancelarEdicao = () => {
    setEditando(false);
    setPalestraEditando(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setEfeito(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const buscarPalestras = useCallback(
    async (currentPage, currentPerPage, search, filters = {}) => {
      try {
        setLoading(true);
        const response = await buscarPalestraCurso(
          currentPage,
          currentPerPage,
          search,
          filters
        );

        if (response.success && response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            const palestrasFormatadas = cadastrosPalestraCurso(
              response.data.data,
            );
            setLista(palestrasFormatadas);
            setTotalRows(parseInt(response.data.total) || 0);
          } else if (Array.isArray(response.data)) {
            const palestrasFormatadas = cadastrosPalestraCurso(response.data);
            setLista(palestrasFormatadas);
            setTotalRows(response.data.length);
          }
        } else {
          setLista([]);
          setTotalRows(0);
        }
      } catch (error) {
        console.error("Erro ao buscar palestras:", error);
        setLista([]);
        setTotalRows(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const filters = {
      tipo_palestra_id: tipoPalestraId,
      status_pagamento: statusPagamento,
      data_inicio: dataInicio,
      data_fim: dataFim,
    };
    buscarPalestras(page, rowsPerPage, debouncedSearchTerm, filters);
  }, [page, rowsPerPage, debouncedSearchTerm, tipoPalestraId, statusPagamento, dataInicio, dataFim, buscarPalestras]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const limpiarFiltros = () => {
    setSearchTerm("");
    setTipoPalestraId("");
    setStatusPagamento("");
    setDataInicio("");
    setDataFim("");
    setPage(1);
    setShowFiltersModal(false);
  };

  const handleDeletar = async (id) => {
    try {
      setLoading(true);
      await deletarPalestra(id);
      if (lista.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        const filters = {
          tipo_palestra_id: tipoPalestraId,
          status_pagamento: statusPagamento,
          data_inicio: dataInicio,
          data_fim: dataFim,
        };
        buscarPalestras(page, rowsPerPage, debouncedSearchTerm, filters);
      }
    } catch (error) {
      CustomToast({
        type: "error",
        message: error.response?.data?.message || "Erro ao excluir palestra",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = async () => {
    try {
      setLoading(true);
      const filters = {
        tipo_palestra_id: tipoPalestraId,
        status_pagamento: statusPagamento,
        data_inicio: dataInicio,
        data_fim: dataFim,
      };
      
      // Busca uma quantidade maior para impressão (ex: 1000 registros)
      const response = await buscarPalestraCurso(1, 1000, debouncedSearchTerm, filters);
      let dadosParaImprimir = [];
      
      if (response.success && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          dadosParaImprimir = cadastrosPalestraCurso(response.data.data);
        } else if (Array.isArray(response.data)) {
          dadosParaImprimir = cadastrosPalestraCurso(response.data);
        }
      }

      if (dadosParaImprimir.length === 0) {
        CustomToast({ type: "warning", message: "Nenhum dado encontrado para imprimir." });
        return;
      }

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Relatório de Palestras e Cursos</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #9D4B5B; color: white; text-transform: uppercase; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              h2 { color: #9D4B5B; margin-bottom: 5px; }
              .header { text-align: center; border-bottom: 2px solid #9D4B5B; padding-bottom: 10px; margin-bottom: 20px; }
              .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #777; }
              @media print {
                .no-print { display: none; }
                th { background-color: #9D4B5B !important; color: white !important; -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Relatório de Palestras e Cursos</h2>
              <p>Data de emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
            <table>
              <thead>
                <tr>
                  ${palestraCursosLista.map(h => `<th>${h.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${dadosParaImprimir.map(row => `
                  <tr>
                    ${palestraCursosLista.map(h => `<td>${row[h.key] || '-'}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">
              <p>Sistema Aidê - Gestão de Palestras e Cursos</p>
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
      CustomToast({ type: "error", message: "Erro ao gerar relatório para impressão." });
    } finally {
      setLoading(false);
    }
  };

  const filtersActive = tipoPalestraId || statusPagamento || dataInicio || dataFim;

  return (
    <div className="flex w-full">
      <Navbar />

      <div className="flex ml-0 flex-col gap-3 w-full items-end just">
        <MenuMobile />
        <motion.div
          style={{ width: "100%" }}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.9 }}
        >
          <HeaderPerfil pageTitle="Palestras e Cursos" />

          <div className="items-center justify-center lg:justify-start w-full mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="w-[100%] itens-center mt-2 ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[95%]">
              <div className="flex gap-2 flex-wrap w-full justify-center md:justify-start items-center">
                <TextField
                  variant="outlined"
                  size="small"
                  label="Pesquisar"
                  autoComplete="off"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ width: { xs: "72%", sm: "50%", md: "40%", lg: "30%" } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Tooltip title="Filtros Avançados">
                  <IconButton 
                    onClick={() => setShowFiltersModal(true)}
                    color={filtersActive ? "primary" : "default"}
                  >
                    <FilterList />
                  </IconButton>
                </Tooltip>

                {filtersActive && (
                  <Tooltip title="Limpar Filtros">
                    <IconButton onClick={limpiarFiltros} color="error">
                      <FilterListOff />
                    </IconButton>
                  </Tooltip>
                )}

                <CadastrarPalestra
                  onSuccess={() =>
                    buscarPalestras(1, rowsPerPage, debouncedSearchTerm, {
                      tipo_palestra_id: tipoPalestraId,
                      status_pagamento: statusPagamento,
                      data_inicio: dataInicio,
                      data_fim: dataFim,
                    })
                  }
                />
              </div>

              <div className="w-full flex justify-center mt-4">
                {loading ? (
                  <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
                    <TableLoading />
                    <label className="text-xs text-primary">
                      Carregando Informações!
                    </label>
                  </div>
                ) : lista.length > 0 ? (
                  <TableComponent
                    headers={palestraCursosLista}
                    rows={lista}
                    actionsLabel={"Ações"}
                    forceShowDelete={true}
                    pagination={true}
                    totalRows={totalRows}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    actionCalls={{
                      edit: (row) => handleEditar(row.id),
                      delete: (row) => handleDeletar(row.id),
                    }}
                  />
                ) : (
                  <div className="text-center flex items-center mt-28 w-full h-full justify-center gap-5 flex-col text-primary">
                    <label className="text-sm">
                      Nenhuma palestra encontrada!
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Filtros */}
      <Dialog 
        open={showFiltersModal} 
        onClose={() => setShowFiltersModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="text-primary font-bold">Filtros Avançados</DialogTitle>
        <DialogContent dividers>
          <div className="flex flex-col gap-5 mt-2">
            <Autocomplete
              fullWidth
              size="small"
              options={tiposPalestra}
              getOptionLabel={(option) => option.nome || ""}
              value={tiposPalestra.find(t => t.id === tipoPalestraId) || null}
              onChange={(event, newValue) => setTipoPalestraId(newValue ? newValue.id : "")}
              renderInput={(params) => <TextField {...params} label="Tipo de Palestra" />}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Status Pagamento</InputLabel>
              <Select
                value={statusPagamento}
                label="Status Pagamento"
                onChange={(e) => setStatusPagamento(e.target.value)}
              >
                <MenuItem value=""><em>Todos</em></MenuItem>
                <MenuItem value="1">Pago</MenuItem>
                <MenuItem value="2">Pendente</MenuItem>
                <MenuItem value="3">Cancelado</MenuItem>
              </Select>
            </FormControl>

            <div className="flex gap-4">
              <TextField
                fullWidth
                type="date"
                size="small"
                label="Data Início"
                InputLabelProps={{ shrink: true }}
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />

              <TextField
                fullWidth
                type="date"
                size="small"
                label="Data Fim"
                InputLabelProps={{ shrink: true }}
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="justify-between px-6 pb-4">
          <Button onClick={limpiarFiltros} color="error" variant="outlined">Limpar Filtros</Button>
          <div className="flex gap-2">
            <Button 
              onClick={handleImprimir} 
              variant="outlined" 
              startIcon={<Print />}
              className="text-primary border-primary"
            >
              Imprimir
            </Button>
            <Button onClick={() => setShowFiltersModal(false)} variant="contained" className="bg-primary text-white px-6">Aplicar</Button>
          </div>
        </DialogActions>
      </Dialog>

      {/* Modal de edição */}
      {editando && (
        <EditarPalestra
          open={editando}
          onClose={handleCancelarEdicao}
          onSave={handleSalvarEdicao}
          palestra={palestraEditando}
        />
      )}
    </div>
  );
};

export default PalestrasCursos;
