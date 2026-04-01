import React, { useEffect, useState, useCallback } from "react";
import MenuMobile from "../../components/menu-mobile";
import HeaderPerfil from "../../components/navbars/perfil";
import Navbar from "../../components/navbars/header";
import { motion } from "framer-motion";
import { InputAdornment, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";
import TableLoading from "../../components/loading/loading-table/loading";
import TableComponent from "../../components/table";
import { palestraCursosLista } from "../../entities/header/palestra-curso";
import CadastrarPalestra from "./cadastrar-palestra";
import EditarPalestra from "./editar-palestra";
import { buscarPalestraCurso } from "../../service/get/palestra-curso";
import CustomToast from "../../components/toast";
import { cadastrosPalestraCurso } from "../../entities/class/palestra-cursos";
import { deletarPalestra } from "../../service/delete/palestra";

const PalestrasCursos = () => {
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [efeito, setEfeito] = useState(false);
  const [palestraEditando, setPalestraEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lista, setLista] = useState([]);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
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
    async (currentPage, currentPerPage, search) => {
      try {
        setLoading(true);
        const response = await buscarPalestraCurso(
          currentPage,
          currentPerPage,
          search,
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
    buscarPalestras(page, rowsPerPage, debouncedSearchTerm);
  }, [page, rowsPerPage, debouncedSearchTerm, buscarPalestras]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleDeletar = async (id) => {
    try {
      setLoading(true);
      await deletarPalestra(id);
      if (lista.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        buscarPalestras(page, rowsPerPage, debouncedSearchTerm);
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
              <div className="flex gap-2 flex-wrap w-full justify-center md:justify-start">
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Pesquisar"
                  autoComplete="off"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ width: { xs: "72%", sm: "50%", md: "40%", lg: "40%" } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <CadastrarPalestra
                  onSuccess={() =>
                    buscarPalestras(1, rowsPerPage, debouncedSearchTerm)
                  }
                />
              </div>
              <div className="w-full flex justify-center">
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
