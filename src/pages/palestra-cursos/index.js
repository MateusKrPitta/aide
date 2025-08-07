import React, { useEffect, useState } from "react";
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

  const handleEditar = (id) => {
    const palestraParaEditar = lista.find((item) => item.id === id);

    setPalestraEditando(palestraParaEditar);
    buscarPalestras();
    setEditando(true);
  };

  const handleSalvarEdicao = (palestraAtualizada) => {
    setLista(
      lista.map((item) =>
        item.id === palestraAtualizada.id ? palestraAtualizada : item
      )
    );
    setEditando(false);
    buscarPalestras();
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

  const buscarPalestras = async () => {
    try {
      setLoading(true);
      const response = await buscarPalestraCurso();
      const palestrasFormatadas = cadastrosPalestraCurso(response.data);
      setLista(palestrasFormatadas);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar palestras",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    buscarPalestras();
  }, []);

  const filteredList = lista.filter((item) =>
    Object.values(item).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDeletar = async (id) => {
    try {
      setLoading(true);
      await deletarPalestra(id);

      buscarPalestras();
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

      <div className="flex ml-0 flex-col gap-3 w-full items-end  just">
        <MenuMobile />
        <motion.div
          style={{ width: "100%" }}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.9 }}
        >
          <HeaderPerfil pageTitle="Palestras e Cursos" />

          <div className=" items-center justify-center lg:justify-start w-full mt-[95px] gap-2 flex-wrap md:items-start pl-2">
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
                <CadastrarPalestra onSuccess={buscarPalestras} />
              </div>
              <div className="w-full flex justify-center">
                {loading ? (
                  <div className="w-full flex items-center h-[300px] flex-col gap-3 justify-center">
                    <TableLoading />
                    <label className="text-xs text-primary">
                      Carregando Informações !
                    </label>
                  </div>
                ) : filteredList.length > 0 ? (
                  <>
                    <TableComponent
                      headers={palestraCursosLista}
                      rows={filteredList}
                      actionsLabel={"Ações"}
                      actionCalls={{
                        edit: (row) => handleEditar(row.id),
                        delete: (row) => handleDeletar(row.id),
                      }}
                    />
                    {editando && (
                      <EditarPalestra
                        open={editando}
                        onClose={handleCancelarEdicao}
                        onSave={handleSalvarEdicao}
                        palestra={palestraEditando}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center flex items-center mt-28 w-full h-full justify-center gap-5 flex-col text-primary">
                    {lista.length === 0 ? (
                      <div className="flex w-full flex-col mt-12 gap-2 justify-center itens-center">
                        <TableLoading />
                        <label className="text-sm">
                          Nenhuma palestra encontrada!
                        </label>
                      </div>
                    ) : (
                      <label className="text-sm flex  mt-12 flex-col gap-2">
                        <TableLoading />
                        Nenhuma palestra encontrada!
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PalestrasCursos;
