import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ClearIcon from "@mui/icons-material/Clear";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteIcon from "@mui/icons-material/Delete";
import PaymentsIcon from "@mui/icons-material/Payments";
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
  Tabs,
  Tab,
  Chip,
  CircularProgress,
} from "@mui/material";
import Title from "../../title";
import ButtonComponent from "../../button";
import LogoutIcon from "@mui/icons-material/Logout";
import CustomToast from "../../toast";
import { useNotifications } from "../../../context/NotificationContext";

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
  width: 450,
  maxHeight: 550,
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
};

const HeaderPerfil = ({ pageTitle = "Dashboard" }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    loading: contextLoading, 
    unreadCount, 
    markAsRead, 
    clearNotifications, 
    clearAll 
  } = useNotifications();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);
  const [notificationTab, setNotificationTab] = useState(0);

  const userName = sessionStorage.getItem("nome");

  const formatarData = (dataStr) => {
    if (!dataStr) return "Data não informada";
    try {
      const data = new Date(dataStr);
      if (isNaN(data.getTime())) return "Data inválida";
      return data.toLocaleDateString("pt-BR");
    } catch {
      return "Data inválida";
    }
  };

  // Removidas as funções redundantes de verificação e busca
  // Tudo agora é gerenciado pelo NotificationContext

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotifOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
    
    // Marcar aba atual como lida
    const tipos = ["contas", "servicos", "contasReceber"];
    markAsRead(tipos[notificationTab]);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setNotificationTab(newValue);
  };

  const handleOpenLogoutConfirm = () => setOpenLogoutConfirm(true);
  const handleCloseLogoutConfirm = () => setOpenLogoutConfirm(false);

  const confirmLogout = async () => {
    handleCloseLogoutConfirm();
    sessionStorage.clear();
    navigate("/");
    CustomToast({ type: "success", message: "Logout realizado com sucesso!" });
  };

  const clearNotificationsByType = (type) => {
    clearNotifications(type);
    const tipoLabel = {
      contas: "contas a pagar",
      servicos: "serviços",
      contasReceber: "contas a receber",
    }[type];

    CustomToast({
      type: "success",
      message: `Notificações de ${tipoLabel} limpas com sucesso!`,
    });
  };

  const clearAllNotifications = () => {
    clearAll();
    CustomToast({
      type: "success",
      message: "Todas as notificações foram limpas!",
    });
  };

  // Removidas funções de busca locais

  const getCurrentNotifications = () => {
    switch (notificationTab) {
      case 0:
        return notifications.contas;
      case 1:
        return notifications.servicos;
      case 2:
        return notifications.contasReceber;
      default:
        return [];
    }
  };

  const getCurrentNotificationCount = () => {
    switch (notificationTab) {
      case 0:
        return notifications.contas.length;
      case 1:
        return notifications.servicos.length;
      case 2:
        return notifications.contasReceber.length;
      default:
        return 0;
    }
  };

  const getCurrentLoading = () => {
    return contextLoading;
  };



  const renderContaNotification = (notification) => (
    <ListItem button key={notification.id}>
      <ListItemText
        primary={
          <Typography
            style={{
              fontWeight: notification.read ? "normal" : "bold",
            }}
          >
            {notification.text}
          </Typography>
        }
        secondary={
          <Box sx={{ mt: 0.5 }}>
            <Typography component="div" variant="body2" color="textSecondary">
              {notification.details.descricao}
              <br />
              <strong>Vencimento:</strong> {notification.details.vencimento}
              <br />
              <strong>Valor:</strong> {notification.details.valor}
            </Typography>
            <Typography
              component="div"
              variant="caption"
              color="error"
              style={{ marginTop: 4 }}
            >
              {notification.time}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );

  const renderServicoNotification = (notification) => (
    <ListItem button key={notification.id}>
      <ListItemText
        primary={
          <Typography
            style={{
              fontWeight: notification.read ? "normal" : "bold",
            }}
          >
            {notification.text}
          </Typography>
        }
        secondary={
          <Box sx={{ mt: 0.5 }}>
            <Typography component="div" variant="body2" color="textSecondary">
              {notification.details.descricao}
              <br />
              <strong>Cliente:</strong> {notification.details.cliente}
              <br />
              {notification.details.prestador && (
                <>
                  <strong>Prestador:</strong> {notification.details.prestador}
                  <br />
                </>
              )}
              <strong>Vencimento:</strong> {notification.details.vencimento}
              <br />
              <strong>Valor:</strong> {notification.details.valor}
            </Typography>
            <Typography
              component="div"
              variant="caption"
              color="error"
              style={{ marginTop: 4 }}
            >
              {notification.time}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );

  const renderContaReceberNotification = (notification) => (
    <ListItem button key={notification.id}>
      <ListItemText
        primary={
          <Typography
            style={{
              fontWeight: notification.read ? "normal" : "bold",
            }}
          >
            {notification.text}
          </Typography>
        }
        secondary={
          <Box sx={{ mt: 0.5 }}>
            <Typography component="div" variant="body2" color="textSecondary">
              {notification.details.descricao}
              <br />
              <strong>Vencimento:</strong> {notification.details.vencimento}
              <br />
              <strong>Valor:</strong> {notification.details.valor}
            </Typography>
            <Typography
              component="div"
              variant="caption"
              color="error"
              style={{ marginTop: 4 }}
            >
              {notification.time}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );

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
              <label
                className="cursor-pointer p-1"
                style={{ color: "#9D4B5B" }}
              >
                <AccountCircleIcon />
              </label>
              <span className="text-xs text-primary font-bold ">
                {userName || "Usuário"}
              </span>

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
            <button
              className="cursor-pointer p-1"
              style={{ color: "#9D4B5B", background: "none", border: "none" }}
              onClick={handleMenuOpen}
            >
              <AccountCircleIcon />
            </button>
          </div>
        </div>
      </div>

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
          {unreadCount > 0 && (
            <Button
              startIcon={<DeleteIcon />}
              onClick={clearAllNotifications}
              size="small"
              color="error"
              style={{ textTransform: "none" }}
            >
              Limpar Todas
            </Button>
          )}
        </div>

        <Divider />

        <Tabs
          value={notificationTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label={`Contas a Pagar (${notifications.contas.length})`}
            id="notification-tab-0"
          />
          <Tab
            label={`Serviços (${notifications.servicos.length})`}
            id="notification-tab-1"
          />
          <Tab
            label={`Contas a Receber (${notifications.contasReceber.length})`}
            id="notification-tab-2"
          />
        </Tabs>

        <Divider />

        {getCurrentNotificationCount() > 0 && (
          <div style={{ padding: "8px 16px", textAlign: "right" }}>
            <Button
              startIcon={<DeleteIcon />}
              onClick={() => {
                const tipoMap = {
                  0: "contas",
                  1: "servicos",
                  2: "contasReceber",
                };
                clearNotificationsByType(tipoMap[notificationTab]);
              }}
              size="small"
              color="error"
              style={{ textTransform: "none" }}
            >
              Limpar{" "}
              {notificationTab === 0
                ? "Contas a Pagar"
                : notificationTab === 1
                  ? "Serviços"
                  : "Contas a Receber"}
            </Button>
          </div>
        )}

        {getCurrentLoading() ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={30} />
          </Box>
        ) : getCurrentNotificationCount() > 0 ? (
          <List style={{ padding: 0 }}>
            {getCurrentNotifications().map((notification) => {
              if (notification.type === "conta") {
                return renderContaNotification(notification);
              } else if (notification.type === "servico") {
                return renderServicoNotification(notification);
              } else if (notification.type === "conta_receber") {
                return renderContaReceberNotification(notification);
              }
              return null;
            })}
          </List>
        ) : (
          <Typography
            variant="body2"
            style={{ padding: "16px", color: "gray", textAlign: "center" }}
          >
            Nenhuma{" "}
            {notificationTab === 0
              ? "conta a pagar"
              : notificationTab === 1
                ? "serviço"
                : "conta a receber"}{" "}
            vencida
          </Typography>
        )}
      </Menu>

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
