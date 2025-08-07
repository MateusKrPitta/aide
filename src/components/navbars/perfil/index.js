import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ClearIcon from "@mui/icons-material/Clear";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Modal,
  Box,
  Menu,
  MenuItem,
  Typography,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import Title from "../../title";
import ButtonComponent from "../../button";
import LogoutIcon from "@mui/icons-material/Logout";
import CustomToast from "../../toast";
import { buscarContasPagar } from "../../../service/get/contas-pagar";
import { buscarContasReceber } from "../../../service/get/contas-receber";
import { buscarRelatorioPalestras } from "../../../service/get/relatorio-palestra-cursos";
import { buscarRelatorioPretadores } from "../../../service/get/relatorio-prestador";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 3,
  p: 4,
};

const notificationStyle = {
  position: "absolute",
  top: "50px",
  right: "20px",
  width: 350,
  maxHeight: 400,
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
};

const HeaderPerfil = ({ pageTitle = "Dashboard" }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [contasPagar, setContasPagar] = useState([]);
  const [contasReceber, setContasReceber] = useState([]);
  const [relatorioPrestador, setRelatorioPrestador] = useState([]);
  const [relatorioPalestra, setRelatorioPalestra] = useState([]);
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);
  const userName = sessionStorage.getItem("nome");
  const [notifications, setNotifications] = useState([]);

  const checkParcelasVencidas = () => {
    const now = new Date();
    const novasNotificacoes = [];
    const today = now.toISOString().split("T")[0];

    contasPagar.forEach((conta) => {
      conta.parcelas.forEach((parcelas) => {
        const vencimentoDate = new Date(parcelas.data_vencimento);
        const vencimentoStr = vencimentoDate.toISOString().split("T")[0];

        if (vencimentoStr <= today && parcelas.status_pagamento === 1) {
          novasNotificacoes.push({
            id: `pagar-${conta.id}-${parcelas.id}`,
            text: `Conta a pagar "${conta.nome}" vencida`,
            details: `Parcela: ${
              parcelas.descricao
            } | Vencimento: ${vencimentoDate.toLocaleDateString()} | Valor: R$ ${
              parcelas.valor
            }`,
            read: false,
            time: "Vencida",
            type: "conta_pagar",
          });
        }
      });
    });

    contasReceber.forEach((conta) => {
      conta.parcelas.forEach((parcela) => {
        const dataVencimento = new Date(parcela.data_vencimento);
        if (dataVencimento <= now && parcela.status_pagamento !== 1) {
          novasNotificacoes.push({
            id: `receber-${conta.id}-${parcela.id}`,
            text: `Conta a receber "${conta.nome}" vencida`,
            details: `Parcela: ${
              parcela.descricao
            } | Vencimento: ${dataVencimento.toLocaleDateString()} | Valor: R$ ${
              parcela.valor
            }`,
            read: false,
            time: "Vencida",
            type: "conta_receber",
          });
        }
      });
    });

    relatorioPalestra.forEach((palestra) => {
      palestra.parcelas.forEach((parcela) => {
        const dataVencimento = new Date(parcela.data_vencimento);
        if (dataVencimento <= now && parcela.status_pagamento !== "2") {
          novasNotificacoes.push({
            id: `palestra-${palestra.id}-${parcela.id}`,
            text: `Palestra/Curso "${palestra.nome}" vencida`,
            details: `Parcela ${
              parcela.numero_parcela
            } | Vencimento: ${dataVencimento.toLocaleDateString()} | Valor: R$ ${
              parcela.valor
            }`,
            read: false,
            time: "Vencida",
            type: "palestra",
          });
        }
      });
    });

    relatorioPrestador.forEach((prestador) => {
      prestador.servicos.forEach((servico) => {
        servico.parcelas.forEach((parcela) => {
          const dataPagamento = new Date(parcela.data_pagamento);

          if (
            parcela.status_pagamento_prestador === 2 &&
            dataPagamento <= now
          ) {
            novasNotificacoes.push({
              id: `prestador-${prestador.id}-${servico.id}-${parcela.id}`,
              text: `Pagamento pendente para ${prestador.prestador.nome}`,
              details: `Serviço: ${servico.servico.nome} | Parcela ${
                parcela.numero_parcela
              } | Vencimento: ${dataPagamento.toLocaleDateString()} | Valor: R$ ${
                parcela.valor_prestador
              }`,
              read: false,
              time: "Vencida",
              type: "prestador",
              meta: {
                prestadorId: prestador.id,
                servicoId: servico.id,
                parcelaId: parcela.id,
              },
            });
          }
        });
      });
    });

    setNotifications((prev) => {
      const existingIds = prev.map((n) => n.id);
      const toAdd = novasNotificacoes.filter(
        (n) => !existingIds.includes(n.id)
      );
      return [...toAdd, ...prev];
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotifOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);

    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleOpenLogoutConfirm = () => setOpenLogoutConfirm(true);
  const handleCloseLogoutConfirm = () => setOpenLogoutConfirm(false);

  const confirmLogout = async () => {
    handleCloseLogoutConfirm();
    sessionStorage.clear();
    navigate("/");
    CustomToast({ type: "success", message: "Logout realizado com sucesso!" });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    CustomToast({
      type: "success",
      message: "Notificações limpas com sucesso!",
    });
  };

  const buscarContasPagarRelatorio = async () => {
    try {
      setLoading(true);
      const response = await buscarContasPagar();
      setContasPagar(response.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar contas a pagar",
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarContasReceberRelatorio = async () => {
    try {
      setLoading(true);
      const response = await buscarContasReceber();
      setContasReceber(response.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar contas a receber",
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarContasRelatorioPalestra = async () => {
    try {
      setLoading(true);
      const response = await buscarRelatorioPalestras();
      setRelatorioPalestra(response.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar palestras/cursos",
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarContasRelatorioPrestador = async () => {
    try {
      setLoading(true);
      const response = await buscarRelatorioPretadores();
      setRelatorioPrestador(response.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar prestadores",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await buscarContasPagarRelatorio();
      await buscarContasReceberRelatorio();
      await buscarContasRelatorioPalestra();
      await buscarContasRelatorioPrestador();
    };

    fetchData();

    const intervalId = setInterval(fetchData, 4 * 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (
      contasPagar.length > 0 ||
      contasReceber.length > 0 ||
      relatorioPalestra.length > 0 ||
      relatorioPrestador.length > 0
    ) {
      checkParcelasVencidas();
    }
  }, [contasPagar, contasReceber, relatorioPalestra, relatorioPrestador]);

  return (
    <>
      <div className="hidden lg:flex justify-end w-full h-8">
        <div
          className="flex items-center justify-between pl-3 pr-4 w-[100%] h-20 bg-cover bg-no-repeat rounded-bl-lg"
          style={{ backgroundColor: "#9D4B5B" }}
        >
          <div className="w-[100%] items-star flex itens-center flex-wrap gap-4 p-2">
            <h1 className="flex items-start text-2xl font-bold text-white w-[80%]">
              {pageTitle}
            </h1>

            <div
              className="w-[15%] flex items-center justify-start text-white gap-2"
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: 3,
              }}
            >
              <a className="cursor-pointer p-1" style={{ color: "#9D4B5B" }}>
                <AccountCircleIcon />
              </a>
              <span className="text-xs text-primary font-bold ">
                {userName || "Usuário"}
              </span>

              {/* Ícone de notificações */}
              <IconButton
                onClick={handleNotifOpen}
                size="small"
                style={{ color: "#9D4B5B" }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </div>
          </div>
          <div
            className="w-[3%] flex justify-center items-center"
            style={{ backgroundColor: "white", borderRadius: "50px" }}
          >
            <a onClick={handleMenuOpen} className="cursor-pointer p-1">
              <LogoutIcon fontSize="small" />
            </a>
          </div>
        </div>
      </div>

      {/* Menu de logout */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        className="p-4"
      >
        <MenuItem
          onClick={handleOpenLogoutConfirm}
          title="Sair do sistema"
          className="flex items-center gap-2"
        >
          <LogoutIcon fontSize="small" className="text-red" /> Sair
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleNotifClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{ style: notificationStyle }}
      >
        <div
          style={{
            padding: "8px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            style={{ fontWeight: "bold" }}
          >
            Notificações
          </Typography>
          {notifications.length > 0 && (
            <Button
              startIcon={<DeleteIcon />}
              onClick={clearAllNotifications}
              size="small"
              color="error"
              style={{ textTransform: "none" }}
            >
              Limpar
            </Button>
          )}
        </div>
        <Divider />

        {notifications.length > 0 ? (
          <List style={{ padding: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem button>
                  <ListItemText
                    primary={notification.text}
                    secondary={
                      <>
                        <Typography component="div" variant="body2">
                          {notification.details}
                        </Typography>
                        <Typography
                          component="div"
                          variant="caption"
                          color="textSecondary"
                        >
                          {notification.time}
                        </Typography>
                      </>
                    }
                    style={{
                      color: notification.read
                        ? "inherit"
                        : "rgba(0, 0, 0, 0.87)",
                      fontWeight: notification.read ? "normal" : "bold",
                    }}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography
            variant="body2"
            style={{ padding: "16px", color: "gray", textAlign: "center" }}
          >
            Nenhuma notificação
          </Typography>
        )}
      </Menu>

      {/* Modal de confirmação de logout */}
      <Modal
        open={openLogoutConfirm}
        aria-labelledby="logout-modal-title"
        aria-describedby="logout-modal-description"
      >
        <Box sx={style}>
          <div className="flex justify-between">
            <Typography id="logout-modal-title" variant="h6" component="h2">
              <Title
                conteudo={"Confirmação de Logout"}
                fontSize={"18px"}
                fontWeight={"700"}
                color={"black"}
              />
            </Typography>
            <button
              className="text-red"
              title="Fechar"
              onClick={handleCloseLogoutConfirm}
            >
              <ClearIcon />
            </button>
          </div>
          <Typography id="logout-modal-description" sx={{ mt: 2 }}>
            <Title
              conteudo={"Tem certeza de que deseja sair?"}
              fontSize={"15px"}
              fontWeight={"500"}
            />
          </Typography>
          <div className="flex gap-2 justify-end mt-4">
            <ButtonComponent
              subtitle={"Confirmar Logout"}
              title={"SIM"}
              onClick={confirmLogout}
            />
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default HeaderPerfil;
