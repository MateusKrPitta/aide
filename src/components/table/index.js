import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
} from "@mui/material";
import { TablePagination } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { maskCPF } from "../../utils/formatCPF";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { Print } from "@mui/icons-material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const TableComponent = ({
  rows,
  headers,
  actionCalls = {},
  actionsLabel,
  onRowChange,
  rowStyle,
  selectedCheckboxes,
  setSelectedCheckboxes,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageList, setPageList] = useState([]);
  const hasActions = Object.keys(actionCalls).length > 0;
  const actionTypes = Object.keys(actionCalls);

  let headersList = hasActions
    ? headers.concat([
        {
          key: "actions",
          label: actionsLabel,
        },
      ])
    : [...headers];

  const handleInputChange = (rowIndex, key, value) => {
    const updatedRows = [...pageList];
    updatedRows[rowIndex][key] = value;
    setPageList(updatedRows);
    onRowChange(updatedRows);
  };

  useEffect(() => {
    if (Array.isArray(rows)) {
      setPageList(rows);
    } else {
      console.error("As rows não são um array", rows);
      setPageList([]);
    }
  }, [rows]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderActions = (row, rowIndex) => {
    let actions = {
      confirm: row.status !== "Cadastrado" && (
        <IconButton
          onClick={() => actionCalls.confirm(row)}
          title="Confirmar Registro"
          className="confirm-button"
          sx={{
            color: "#BCDA72",
            border: "1px solid #BCDA72",
            "&:hover": {
              color: "#fff",
              backgroundColor: "#BCDA72",
              border: "1px solid #005a2a",
            },
          }}
        >
          <CheckCircleOutlineIcon fontSize={"small"} />
        </IconButton>
      ),
      view: (
        <IconButton
          onClick={() => actionCalls.view(row)}
          title="Visualizar Dados"
          className="view-button"
          sx={{
            color: "#9D4B5B",
            border: "1px solid #9D4B5B",
            "&:hover": {
              color: "#fff",
              backgroundColor: "#9D4B5B",
              border: "1px solid #9D4B5B",
            },
          }}
        >
          <VisibilityOutlinedIcon fontSize={"small"} />
        </IconButton>
      ),
      edit: row.tipo !== "Serviço" &&
        row.tipoOrigem !== "Prestador" &&
        row.tipo !== "Palestra/Curso" && (
          <IconButton
            onClick={() => actionCalls.edit(row)}
            title="Editar Dados"
            className="view-button"
            sx={{
              color: "#9D4B5B",
              border: "1px solid #9D4B5B",
              "&:hover": {
                color: "#fff",
                backgroundColor: "#9D4B5B",
                border: "1px solid #9D4B5B",
              },
            }}
          >
            <EditIcon fontSize={"small"} />
          </IconButton>
        ),
      delete: row.tipo !== "Serviço" &&
        row.tipoOrigem !== "Prestador" &&
        row.tipo !== "Palestra/Curso" && (
          <IconButton
            onClick={() => actionCalls.delete(row)}
            title="Excluir Registro"
            className="delete-button"
            sx={{
              color: "#9a0000",
              border: "1px solid #9a0000",
              "&:hover": {
                color: "#fff",
                backgroundColor: "#9a0000",
                border: "1px solid #b22222",
              },
            }}
          >
            <DeleteOutlineIcon fontSize={"small"} />
          </IconButton>
        ),
      tirar: (
        <IconButton
          onClick={() => actionCalls.tirar(rowIndex)}
          title="Excluir Registro"
          className="delete-button"
          sx={{
            color: "#9a0000",
            border: "1px solid #9a0000",
            "&:hover": {
              color: "#fff",
              backgroundColor: "#9a0000",
              border: "1px solid #b22222",
            },
          }}
        >
          <CloseIcon fontSize={"small"} />
        </IconButton>
      ),
      inactivate: (
        <IconButton
          onClick={() => actionCalls.inactivate(row)}
          title={row.ativo ? "Inativar Registro" : "Reativar Registro"}
          className="inactivate-button"
          sx={{
            color: row.ativo ? "#ff9800" : "#4caf50",
            border: `1px solid ${row.ativo ? "#ff9800" : "#4caf50"}`,
            "&:hover": {
              color: "#fff",
              backgroundColor: row.ativo ? "#ff9800" : "#4caf50",
              border: `1px solid ${row.ativo ? "#e68a00" : "#388e3c"}`,
            },
          }}
        >
          {row.ativo ? (
            <BlockOutlinedIcon fontSize="small" />
          ) : (
            <CheckCircleOutlineIcon fontSize="small" />
          )}
        </IconButton>
      ),

      print: (
        <IconButton
          onClick={() => actionCalls.print(row)}
          title="Imprimir"
          className="inactivate-button"
          sx={{
            color: "black",
            border: "1px solid black",
            "&:hover": {
              color: "#fff",
              backgroundColor: "#ff9800",
              border: "1px solid #e68a00",
            },
          }}
        >
          <Print fontSize={"small"} />
        </IconButton>
      ),
      option: (
        <IconButton
          onClick={() => actionCalls.option(row)}
          title="Iniciar Novo Contrato"
          className="view-button"
          sx={{
            color: "#BCDA72",
            border: "1px solid #BCDA72",
            "&:hover": {
              color: "#fff",
              backgroundColor: "#BCDA72",
              border: "1px solid #005a2a",
            },
          }}
        >
          <AddCircleOutlineIcon fontSize={"small"} />
        </IconButton>
      ),
      whatsapp: (
        <IconButton
          onClick={() => actionCalls.whatsapp(row)}
          title="Enviar mensagem no WhatsApp"
          className="whatsapp-button"
          sx={{
            color: "#25D366",
            border: "1px solid #25D366",
            "&:hover": {
              color: "#fff",
              backgroundColor: "#25D366",
              border: "1px solid #128C7E",
            },
          }}
        >
          <WhatsAppIcon fontSize={"small"} />
        </IconButton>
      ),
    };

    return actionTypes.map((action) => {
      const ActionButton = actions[action];
      return ActionButton ? <span key={action}>{ActionButton}</span> : null;
    });
  };

  const paginatedRows = pageList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  useEffect(() => {
    setPageList(rows);
  }, [rows]);

  return (
    <TableContainer
      component={Paper}
      style={{ maxHeight: "370px", overflowY: "auto" }}
      className="scrollbar"
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {headersList.map(
              ({ key, label, sort }) =>
                sort !== false && (
                  <TableCell
                    key={key}
                    style={{
                      fontWeight: "bold",
                      textAlign: key === "actions" ? "center" : "left",
                    }}
                  >
                    {label}
                  </TableCell>
                ),
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedRows.map((row, rowIndex) => (
            <TableRow key={row.id} style={rowStyle ? rowStyle(row) : {}}>
              {headersList.map(
                ({ key, label, sort, type }) =>
                  sort !== false &&
                  (key === "actions" && hasActions ? (
                    <TableCell
                      key={key}
                      style={{
                        display: "flex",
                        gap: 5,
                        justifyContent: "center",
                      }}
                    >
                      {renderActions(row, rowIndex)}
                    </TableCell>
                  ) : type === "checkbox" ? (
                    <TableCell key={key}>
                      <input
                        type="checkbox"
                        checked={selectedCheckboxes[row.produto] || false}
                        onChange={(e) => {
                          const updatedSelectedCheckboxes = {
                            ...selectedCheckboxes,
                          };
                          if (e.target.checked) {
                            updatedSelectedCheckboxes[row.produto] = true;
                          } else {
                            delete updatedSelectedCheckboxes[row.produto];
                          }
                          setSelectedCheckboxes(updatedSelectedCheckboxes);
                        }}
                      />
                    </TableCell>
                  ) : key === "tipo" ? (
                    <TableCell
                      key={key}
                      style={{
                        backgroundColor:
                          row.tipo === "entrada"
                            ? "#006b33"
                            : row.tipo === "saida"
                              ? "#ff0000"
                              : row.tipo === "desperdicio"
                                ? "#000000"
                                : "transparent",
                        color: "black",
                      }}
                    >
                      {row.tipo === "3" ? "Desperdício" : row[key]}
                    </TableCell>
                  ) : key === "entrada" ||
                    key === "estoqueInicial" ||
                    key === "estoqueFinal" ? (
                    <TableCell key={key}>
                      <TextField
                        type="number"
                        value={row[key] || ""}
                        onChange={(e) =>
                          handleInputChange(
                            page * rowsPerPage + rowIndex,
                            key,
                            e.target.value,
                          )
                        }
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                  ) : key === "cpf" ? (
                    <TableCell style={{ fontSize: "12px" }} key={key}>
                      {maskCPF(row[key])}
                    </TableCell>
                  ) : (
                    <TableCell style={{ fontSize: "12px" }} key={key}>
                      {row[key] || "-"}
                    </TableCell>
                  )),
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={pageList.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        labelRowsPerPage="Linhas por página"
      />
    </TableContainer>
  );
};

export default TableComponent;
