import React, { useEffect, useState } from "react";
import MenuMobile from "../../components/menu-mobile";
import HeaderPerfil from "../../components/navbars/perfil";
import Navbar from "../../components/navbars/header";
import { motion } from "framer-motion";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  AddCircle,
  AddCircleOutline,
  AddCircleOutlineOutlined,
  Article,
  DateRange,
  Edit,
  Numbers,
  Person,
  Search,
  Work,
  AttachMoney,
  Close,
} from "@mui/icons-material";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import ButtonComponent from "../../components/button";
import CentralModal from "../../components/modal-central";
import TableLoading from "../../components/loading/loading-table/loading";
import TableComponent from "../../components/table";
import ModalLateral from "../../components/modal-lateral";
import { palestraCursosLista } from "../../entities/header/palestra-curso";
import ButtonClose from "../../components/buttons/button-close";

const PalestrasCursos = () => {
  const [editando, setEditando] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [efeito, setEfeito] = useState(false);
  const [cadastro, setCadastro] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState("");
  const [selectedLectures, setSelectedLectures] = useState([]);
  const [valor, setValor] = useState("");

  const [lista, setLista] = useState([
    {
      id: 1,
      cliente: "Lojas ACME",
      data: "20/05/2025",
      local: "Hotel Nova Andradina",
      horário: "10:00",
    },
    {
      id: 2,
      cliente: "Clinica Vital",
      data: "20/05/2025",
      local: "Hotel Nova Andradina",
      horário: "13:00",
    },
    {
      id: 3,
      cliente: "Indústria Têxtil LTDA",
      data: "20/05/2025",
      local: "Hotel Nova Andradina",
      horário: "11:00",
    },
  ]);

  const handleCloseEdicao = () => {
    setEditando(false);
  };

  const EditarOpcao = () => {
    setEditando(true);
  };

  const FecharCadastro = () => {
    setCadastro(false);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const handleAddLecture = () => {
    if (selectedLecture) {
      setSelectedLectures([
        ...selectedLectures,
        {
          id: Date.now(),
          name: selectedLecture,
          price: valor || 0,
          date: "",
          time: "",
        },
      ]);
      setSelectedLecture("");
      setValor("");
    }
  };

  const handleRemoveLecture = (id) => {
    setSelectedLectures(
      selectedLectures.filter((lecture) => lecture.id !== id)
    );
  };

  const handleValorChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setValor(value);
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
                  sx={{ width: { xs: "72%", sm: "50%", md: "40%", lg: "40%" } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <ButtonComponent
                  startIcon={<AddCircleOutlineOutlined fontSize="small" />}
                  title={"Cadastrar"}
                  subtitle={"Cadastrar"}
                  buttonSize="large"
                  onClick={() => setCadastro(true)}
                />
              </div>
              <div className="w-full flex">
                {loading ? (
                  <TableLoading />
                ) : lista.length > 0 ? (
                  <TableComponent
                    headers={palestraCursosLista}
                    rows={lista}
                    actionsLabel={"Ações"}
                    actionCalls={{
                      edit: EditarOpcao,
                      delete: "",
                    }}
                  />
                ) : (
                  <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                    <TableLoading />
                    <label className="text-sm">Serviço não encontrado!</label>
                  </div>
                )}
              </div>
            </div>
          </div>
          <CentralModal
            tamanhoTitulo={"81%"}
            maxHeight={"90vh"}
            top={"20%"}
            left={"28%"}
            width={"550px"}
            icon={<AddCircleOutline fontSize="small" />}
            open={cadastro}
            onClose={FecharCadastro}
            title="Cadastrar Palestra ou Curso"
          >
            <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
              <div className="mt-4 flex gap-3 flex-wrap">
                <Box className="flex w-full items-center justify-start">
                  <BottomNavigation
                    showLabels
                    className="w-[95%] flex flex-wrap"
                    value={activeStep}
                    onChange={(event, newValue) => handleStepChange(newValue)}
                    sx={{
                      width: "fit-content",
                      border: "1px solid #9D4B5B",
                      backgroundColor: "#9D4B5B",
                      height: "100%",
                      borderRadius: 2,
                      paddingX: "24px",
                      paddingY: "12px",
                      gap: "24px",
                    }}
                  >
                    {[
                      { label: "Cliente", icon: <Person /> },
                      { label: "Trabalho", icon: <Work /> },
                      { label: "Documentos", icon: <Article /> },
                    ].map((item, index) => (
                      <BottomNavigationAction
                        key={index}
                        label={item.label}
                        icon={item.icon}
                        sx={{
                          minWidth: activeStep === index ? "180px" : "100px",
                          height: "45px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "8px",
                          color: activeStep === index ? "#9D4B5B" : "#ffffff",
                          backgroundColor:
                            activeStep === index ? "#ffffff" : "#9D4B5B",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor:
                              activeStep === index ? "#ffffff" : "#cf7889",
                          },
                          "&.Mui-selected": {
                            color: "#9D4B5B",
                          },
                        }}
                      />
                    ))}
                  </BottomNavigation>
                </Box>
                {activeStep === 0 && (
                  <div className="flex w-full flex-wrap gap-3 font-bold mt-4">
                    <motion.div
                      style={{ width: "100%" }}
                      initial="hidden"
                      animate="visible"
                      variants={fadeIn}
                      transition={{ duration: 0.9 }}
                    >
                      <div className="flex w-full gap-2 items-center">
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Nome"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "72%",
                              sm: "50%",
                              md: "40%",
                              lg: "60%",
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
                        <ButtonComponent
                          startIcon={<AddCircle fontSize="small" />}
                          title={"Adicionar"}
                          subtitle={"Adicionar"}
                          buttonSize="large"
                        />
                      </div>
                    </motion.div>
                  </div>
                )}
                {activeStep === 1 && (
                  <div className="flex w-full flex-wrap gap-3 font-bold mt-4">
                    <motion.div
                      style={{ width: "100%" }}
                      initial="hidden"
                      animate="visible"
                      variants={fadeIn}
                      transition={{ duration: 0.9 }}
                    >
                      <div className="flex w-[95%] items-center gap-3 flex-wrap">
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Horário"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "45%",
                              sm: "50%",
                              md: "40%",
                              lg: "30%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <QueryBuilderIcon />
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
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "51%",
                              sm: "50%",
                              md: "40%",
                              lg: "33%",
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
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Seções"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "30%",
                              sm: "50%",
                              md: "40%",
                              lg: "30%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Numbers />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          select
                          fullWidth
                          label="Selecione a palestra ou curso"
                          value={selectedLecture}
                          onChange={(e) => setSelectedLecture(e.target.value)}
                          sx={{
                            width: {
                              xs: "66%",
                              sm: "50%",
                              md: "40%",
                              lg: "40%",
                            },
                          }}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Article />
                              </InputAdornment>
                            ),
                          }}
                        >
                          <MenuItem value="">Selecione</MenuItem>
                          <MenuItem value="Treinamento 01">
                            Treinamento 01
                          </MenuItem>
                          <MenuItem value="Curso Avançado">
                            Curso Avançado
                          </MenuItem>
                          <MenuItem value="Workshop">Workshop</MenuItem>
                        </TextField>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Valor"
                          value={valor}
                          onChange={handleValorChange}
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "50%",
                              sm: "50%",
                              md: "40%",
                              lg: "30%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoney />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <ButtonComponent
                          startIcon={<AddCircle fontSize="small" />}
                          title={"Adicionar"}
                          subtitle={"Adicionar"}
                          buttonSize="large"
                          onClick={handleAddLecture}
                        />
                      </div>

                      {selectedLectures.length > 0 && (
                        <div className="mt-4 w-[95%]">
                          <label className="font-bold text-xs mb-2">
                            Palestras/Cursos Selecionados:
                          </label>
                          <div className="space-y-2">
                            {selectedLectures.map((lecture) => (
                              <div
                                key={lecture.id}
                                className="flex justify-between items-center p-2 border rounded"
                              >
                                <div>
                                  <span className="font-medium">
                                    {lecture.name}
                                  </span>
                                  <span className="ml-2 text-gray-600">
                                    R$ {parseFloat(lecture.price).toFixed(2)}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    handleRemoveLecture(lecture.id)
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Close />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
                {activeStep === 2 && (
                  <div className="flex w-full flex-wrap gap-3 font-bold mt-4">
                    <motion.div
                      style={{ width: "100%" }}
                      initial="hidden"
                      animate="visible"
                      variants={fadeIn}
                      transition={{ duration: 0.9 }}
                    >
                      <div className="flex w-full flex-col gap-4">
                        {/* Input para upload de arquivos */}
                        <input
                          type="file"
                          id="document-upload"
                          accept=".pdf"
                          multiple
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            setSelectedDocuments((prev) => [
                              ...prev,
                              ...files.map((file) => ({
                                name: file.name,
                                file: file,
                              })),
                            ]);
                          }}
                        />
                        <div className="w-[40%]">
                          <ButtonComponent
                            startIcon={
                              <AddCircleOutlineOutlined fontSize="small" />
                            }
                            title={"Adicionar Documentos"}
                            subtitle={"Adicionar Documentos"}
                            buttonSize="large"
                            onClick={() =>
                              document.getElementById("document-upload").click()
                            }
                          />
                        </div>
                        {/* Botão para acionar o input file */}

                        {/* Lista de documentos adicionados */}
                        <div className="flex flex-col w-[95%] gap-2 mt-2">
                          {selectedDocuments.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border border-primary rounded"
                            >
                              <div className="flex items-center gap-2">
                                <Article fontSize="small" />
                                <label className="text-xs">{doc.name}</label>
                              </div>
                              <ButtonClose
                                funcao={() => {
                                  setSelectedDocuments((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  );
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </CentralModal>

          <ModalLateral
            open={editando}
            width={{
              xs: "400px",
              lg: "550px",
            }}
            handleClose={handleCloseEdicao}
            tituloModal="Editar Informações"
            icon={<Edit />}
            tamanhoTitulo="75%"
            conteudo={
              <div
                className="w-full flex-col flex items-start gap-3 "
                style={{ maxHeight: "500px", overflow: "auto" }}
              >
                <Box className="flex w-full items-center justify-start">
                  <BottomNavigation
                    showLabels
                    className="w-[95%] flex-wrap"
                    value={activeStep}
                    onChange={(event, newValue) => handleStepChange(newValue)}
                    sx={{
                      width: "fit-content",
                      border: "1px solid #9D4B5B",
                      backgroundColor: "#9D4B5B",
                      height: "100%",
                      borderRadius: 2,
                      paddingX: "24px",
                      paddingY: "12px",
                      gap: "24px",
                    }}
                  >
                    {[
                      { label: "Cliente", icon: <Person /> },
                      { label: "Trabalho", icon: <Work /> },
                      { label: "Documentos", icon: <Article /> },
                    ].map((item, index) => (
                      <BottomNavigationAction
                        key={index}
                        label={item.label}
                        icon={item.icon}
                        sx={{
                          minWidth: activeStep === index ? "180px" : "100px",
                          height: "45px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "8px",
                          color: activeStep === index ? "#9D4B5B" : "#ffffff",
                          backgroundColor:
                            activeStep === index ? "#ffffff" : "#9D4B5B",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor:
                              activeStep === index ? "#ffffff" : "#cf7889",
                          },
                          "&.Mui-selected": {
                            color: "#9D4B5B",
                          },
                        }}
                      />
                    ))}
                  </BottomNavigation>
                </Box>
                {activeStep === 0 && (
                  <div className="flex w-full flex-wrap gap-3 font-bold mt-4">
                    <motion.div
                      style={{ width: "100%" }}
                      initial="hidden"
                      animate="visible"
                      variants={fadeIn}
                      transition={{ duration: 0.9 }}
                    >
                      <div className="flex w-full gap-2 items-center">
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Nome"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "72%",
                              sm: "50%",
                              md: "40%",
                              lg: "60%",
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
                        <ButtonComponent
                          startIcon={<AddCircle fontSize="small" />}
                          title={"Adicionar"}
                          subtitle={"Adicionar"}
                          buttonSize="large"
                        />
                      </div>
                    </motion.div>
                  </div>
                )}
                {activeStep === 1 && (
                  <div className="flex w-full flex-wrap gap-3 font-bold mt-4">
                    <motion.div
                      style={{ width: "100%" }}
                      initial="hidden"
                      animate="visible"
                      variants={fadeIn}
                      transition={{ duration: 0.9 }}
                    >
                      <div className="flex w-[100%] items-center gap-3 flex-wrap">
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Horário"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "41%",
                              sm: "50%",
                              md: "40%",
                              lg: "30%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <QueryBuilderIcon />
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
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "55%",
                              sm: "50%",
                              md: "40%",
                              lg: "33%",
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
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Seções"
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "30%",
                              sm: "50%",
                              md: "40%",
                              lg: "30%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Numbers />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          select
                          fullWidth
                          label="Selecione a palestra ou curso"
                          value={selectedLecture}
                          onChange={(e) => setSelectedLecture(e.target.value)}
                          sx={{
                            width: {
                              xs: "65%",
                              sm: "50%",
                              md: "40%",
                              lg: "40%",
                            },
                          }}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Article />
                              </InputAdornment>
                            ),
                          }}
                        >
                          <MenuItem value="">Selecione</MenuItem>
                          <MenuItem value="Treinamento 01">
                            Treinamento 01
                          </MenuItem>
                          <MenuItem value="Curso Avançado">
                            Curso Avançado
                          </MenuItem>
                          <MenuItem value="Workshop">Workshop</MenuItem>
                        </TextField>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Valor"
                          value={valor}
                          onChange={handleValorChange}
                          autoComplete="off"
                          sx={{
                            width: {
                              xs: "50%",
                              sm: "50%",
                              md: "40%",
                              lg: "30%",
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoney />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <ButtonComponent
                          startIcon={<AddCircle fontSize="small" />}
                          title={"Adicionar"}
                          subtitle={"Adicionar"}
                          buttonSize="large"
                          onClick={handleAddLecture}
                        />
                      </div>

                      {selectedLectures.length > 0 && (
                        <div className="mt-4 w-[95%]">
                          <label className="font-bold text-xs mb-2">
                            Palestras/Cursos Selecionados:
                          </label>
                          <div className="space-y-2">
                            {selectedLectures.map((lecture) => (
                              <div
                                key={lecture.id}
                                className="flex justify-between items-center p-2 border rounded"
                              >
                                <div>
                                  <span className="font-medium">
                                    {lecture.name}
                                  </span>
                                  <span className="ml-2 text-gray-600">
                                    R$ {parseFloat(lecture.price).toFixed(2)}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    handleRemoveLecture(lecture.id)
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Close />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
                {activeStep === 2 && (
                  <div className="flex w-full flex-wrap gap-3 font-bold mt-4">
                    <motion.div
                      style={{ width: "100%" }}
                      initial="hidden"
                      animate="visible"
                      variants={fadeIn}
                      transition={{ duration: 0.9 }}
                    >
                      <div className="flex w-full flex-col gap-4">
                        {/* Input para upload de arquivos */}
                        <input
                          type="file"
                          id="document-upload"
                          accept=".pdf"
                          multiple
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            setSelectedDocuments((prev) => [
                              ...prev,
                              ...files.map((file) => ({
                                name: file.name,
                                file: file,
                              })),
                            ]);
                          }}
                        />
                        <div className="w-[40%]">
                          <ButtonComponent
                            startIcon={
                              <AddCircleOutlineOutlined fontSize="small" />
                            }
                            title={"Adicionar Documentos"}
                            subtitle={"Adicionar Documentos"}
                            buttonSize="large"
                            onClick={() =>
                              document.getElementById("document-upload").click()
                            }
                          />
                        </div>
                        {/* Botão para acionar o input file */}

                        {/* Lista de documentos adicionados */}
                        <div className="flex flex-col w-[95%] gap-2 mt-2">
                          {selectedDocuments.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border border-primary rounded"
                            >
                              <div className="flex items-center gap-2">
                                <Article fontSize="small" />
                                <label className="text-xs">{doc.name}</label>
                              </div>
                              <ButtonClose
                                funcao={() => {
                                  setSelectedDocuments((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  );
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            }
          />
        </motion.div>
      </div>
    </div>
  );
};

export default PalestrasCursos;
