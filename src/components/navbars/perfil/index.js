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
import { buscarContasPagarPendente } from "../../../service/get/contas-pagar-pendente";
import { buscarServicoPendente } from "../../../service/get/servico-pendente";
import { buscarContasReceberPendente } from "../../../service/get/contas-receber-pendente";
import { buscarContasReceberComissaoPendente } from "../../../service/get/contas-receber-comissao-pendente";

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [parcelasPendentes, setParcelasPendentes] = useState([]);
  const [servicosPendentes, setServicosPendentes] = useState([]);
  const [contasReceberPendentes, setContasReceberPendentes] = useState([]);
  const [comissoesPendentes, setComissoesPendentes] = useState([]);
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);
  const [notificationTab, setNotificationTab] = useState(0);
  const [loading, setLoading] = useState({
    contas: false,
    servicos: false,
    contasReceber: false,
    comissoes: false,
  });

  const userName = sessionStorage.getItem("nome");
  const [notifications, setNotifications] = useState({
    contas: [],
    servicos: [],
    contasReceber: [],
    comissoes: [],
  });

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

  const verificarComissoesVencidas = useCallback(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const novasNotificacoesComissoes = [];

    const processarItemComissao = (item, origem = "comissao") => {
      try {
        if (!item.data_vencimento && !item.data_pagamento) {
          console.log("Item sem data de vencimento:", item);
          return;
        }

        const dataVencimento = item.data_vencimento || item.data_pagamento;
        const vencimentoDate = new Date(dataVencimento);

        if (isNaN(vencimentoDate.getTime())) {
          console.error("Data inválida:", dataVencimento);
          return;
        }

        vencimentoDate.setHours(0, 0, 0, 0);
        const diffTime = vencimentoDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          const diasAtraso = Math.abs(diffDays);
          const dataFormatada = formatarData(dataVencimento);

          const servicoNome =
            item.servico?.nome ||
            item.servico_nome ||
            item.nome_servico ||
            "Serviço não identificado";

          const prestadorNome =
            item.prestador?.nome ||
            item.prestador_nome ||
            "Prestador não informado";

          const clienteNome =
            item.cliente?.nome || item.cliente_nome || "Cliente não informado";

          const valorComissao = parseFloat(
            item.valor_comissao || item.valor || 0,
          ).toFixed(2);

          let urgencia = "normal";
          let corUrgencia = "warning";

          if (diasAtraso >= 30) {
            urgencia = "critico";
            corUrgencia = "error";
          } else if (diasAtraso >= 15) {
            urgencia = "alto";
            corUrgencia = "error";
          } else if (diasAtraso >= 7) {
            urgencia = "medio";
            corUrgencia = "warning";
          }

          novasNotificacoesComissoes.push({
            id: `comissao-${item.id || Date.now()}-${Math.random()}`,
            text: `💰 Comissão vencida: ${servicoNome}`,
            details: {
              prestador: prestadorNome,
              cliente: clienteNome,
              vencimento: dataFormatada,
              valor: `R$ ${valorComissao}`,
              diasAtraso,
              urgencia,
            },
            read: false,
            time: `Vencida há ${diasAtraso} ${diasAtraso === 1 ? "dia" : "dias"}`,
            type: "comissao",
            categoria: "Comissões",
            urgencia,
            corUrgencia,
            dadosCompletos: item,
          });
        }
      } catch (error) {
        console.error("Erro ao processar item de comissão:", error, item);
      }
    };

    if (Array.isArray(comissoesPendentes)) {
      comissoesPendentes.forEach((item) => processarItemComissao(item));
    } else if (comissoesPendentes?.data?.comissoes) {
      comissoesPendentes.data.comissoes.forEach((item) =>
        processarItemComissao(item),
      );
    } else if (comissoesPendentes?.comissoes) {
      comissoesPendentes.comissoes.forEach((item) =>
        processarItemComissao(item),
      );
    } else if (comissoesPendentes?.data) {
      Object.values(comissoesPendentes.data).forEach((item) => {
        if (Array.isArray(item)) {
          item.forEach((subItem) => processarItemComissao(subItem));
        } else {
          processarItemComissao(item);
        }
      });
    }

    novasNotificacoesComissoes.sort((a, b) => {
      const prioridade = { critico: 0, alto: 1, medio: 2, normal: 3 };
      if (prioridade[a.urgencia] !== prioridade[b.urgencia]) {
        return prioridade[a.urgencia] - prioridade[b.urgencia];
      }
      return b.details.diasAtraso - a.details.diasAtraso;
    });

    if (novasNotificacoesComissoes.length > 0) {
      setNotifications((prev) => ({
        ...prev,
        comissoes: [...novasNotificacoesComissoes, ...prev.comissoes],
      }));
    }
  }, [comissoesPendentes]);

  const verificarParcelasVencidas = useCallback(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const novasNotificacoesContas = [];

    (parcelasPendentes || []).forEach((parcela) => {
      const vencimentoDate = new Date(parcela.data_vencimento);
      vencimentoDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil(
        (vencimentoDate - now) / (1000 * 60 * 60 * 24),
      );

      if (diffDays < 0 && parcela.status === "Pendente") {
        const diasAtraso = Math.abs(diffDays);
        novasNotificacoesContas.push({
          id: `conta-${parcela.id}`,
          text: `💰 Conta vencida: "${parcela.nome_conta}"`,
          details: {
            descricao: parcela.descricao_parcela,
            vencimento: vencimentoDate.toLocaleDateString(),
            valor: `R$ ${parcela.valor.toFixed(2)}`,
            diasAtraso,
          },
          read: false,
          time: `Vencida há ${diasAtraso} ${diasAtraso === 1 ? "dia" : "dias"}`,
          type: "conta",
          categoria: parcela.categoria,
        });
      }
    });

    setNotifications((prev) => ({
      ...prev,
      contas: [...novasNotificacoesContas, ...prev.contas],
    }));
  }, [parcelasPendentes]);

  const verificarServicosVencidos = useCallback(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const novasNotificacoesServicos = [];

    (servicosPendentes || []).forEach((servico) => {
      try {
        const vencimentoDate = new Date(servico.data_vencimento);
        vencimentoDate.setHours(0, 0, 0, 0);

        const diffTime = vencimentoDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const nomeServico =
          servico.nome ||
          servico.servico_nome ||
          servico.tipo ||
          "Serviço sem nome";

        const valorServico = servico.valor || 0;
        const statusServico = (servico.status || "pendente").toLowerCase();
        const clienteNome = servico.cliente_nome || "Não informado";
        const prestadorNome = servico.prestador_nome || "";

        if (diffDays < 0 && statusServico === "pendente") {
          const diasAtraso = Math.abs(diffDays);
          const detalhesPrestador = prestadorNome
            ? `Prestador: ${prestadorNome}`
            : "";

          novasNotificacoesServicos.push({
            id: `servico-${servico.id || Date.now()}-${Math.random()}`,
            text: `🔧 Serviço vencido: "${nomeServico}"`,
            details: {
              descricao: servico.descricao || "Sem descrição",
              cliente: clienteNome,
              prestador: prestadorNome,
              vencimento: vencimentoDate.toLocaleDateString(),
              valor: `R$ ${typeof valorServico === "number" ? valorServico.toFixed(2) : valorServico}`,
              diasAtraso,
            },
            read: false,
            time: `Vencido há ${diasAtraso} ${diasAtraso === 1 ? "dia" : "dias"}`,
            type: "servico",
            categoria: servico.categoria || "Serviços",
          });
        }
      } catch (error) {
        console.error("Erro ao processar serviço:", error, servico);
      }
    });

    if (novasNotificacoesServicos.length > 0) {
      setNotifications((prev) => ({
        ...prev,
        servicos: [...novasNotificacoesServicos, ...prev.servicos],
      }));
    }
  }, [servicosPendentes]);

  const verificarContasReceberVencidas = useCallback(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const novasNotificacoesContasReceber = [];

    (contasReceberPendentes || []).forEach((parcela) => {
      try {
        const normalizarData = (dataStr) => {
          if (!dataStr) return null;
          let dataCorrigida = dataStr.replace(/ GM$/, " GMT");
          const data = new Date(dataCorrigida);

          if (isNaN(data.getTime())) {
            const partes = dataStr.split(" ");
            if (partes.length >= 5) {
              const meses = {
                Jan: 0,
                Feb: 1,
                Mar: 2,
                Apr: 3,
                May: 4,
                Jun: 5,
                Jul: 6,
                Aug: 7,
                Sep: 8,
                Oct: 9,
                Nov: 10,
                Dec: 11,
              };
              const mes = meses[partes[1]];
              const dia = parseInt(partes[2]);
              const ano = parseInt(partes[3]);
              if (mes !== undefined && !isNaN(dia) && !isNaN(ano)) {
                return new Date(ano, mes, dia);
              }
            }
            return null;
          }
          return data;
        };

        const vencimentoDate = normalizarData(parcela.data_vencimento);

        if (!vencimentoDate) {
          console.error("Data inválida:", parcela.data_vencimento);
          return;
        }

        vencimentoDate.setHours(0, 0, 0, 0);
        const diffTime = vencimentoDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const dataFormatada = vencimentoDate.toLocaleDateString("pt-BR");

        if (diffDays < 0) {
          const diasAtraso = Math.abs(diffDays);
          novasNotificacoesContasReceber.push({
            id: `conta-receber-${parcela.id}-${Date.now()}`,
            text: `📋 Conta a receber vencida: "${parcela.nome}"`,
            details: {
              descricao: parcela.descricao,
              vencimento: dataFormatada,
              valor: `R$ ${parseFloat(parcela.valor).toFixed(2)}`,
              diasAtraso,
            },
            read: false,
            time: `Vencido há ${diasAtraso} ${diasAtraso === 1 ? "dia" : "dias"}`,
            type: "conta_receber",
            categoria: "Contas a Receber",
          });
        }
      } catch (error) {
        console.error("Erro ao processar conta a receber:", error, parcela);
      }
    });

    if (novasNotificacoesContasReceber.length > 0) {
      setNotifications((prev) => ({
        ...prev,
        contasReceber: [
          ...novasNotificacoesContasReceber,
          ...prev.contasReceber,
        ],
      }));
    }
  }, [contasReceberPendentes]);

  const unreadCount =
    notifications.contas.filter((n) => !n.read).length +
    notifications.servicos.filter((n) => !n.read).length +
    notifications.contasReceber.filter((n) => !n.read).length +
    notifications.comissoes.filter((n) => !n.read).length;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotifOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);

    setNotifications((prev) => ({
      contas: prev.contas.map((n) => ({ ...n, read: true })),
      servicos: prev.servicos.map((n) => ({ ...n, read: true })),
      contasReceber: prev.contasReceber.map((n) => ({ ...n, read: true })),
      comissoes: prev.comissoes.map((n) => ({ ...n, read: true })),
    }));
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
    setNotifications((prev) => ({
      ...prev,
      [type]: [],
    }));

    const tipoLabel = {
      contas: "contas a pagar",
      servicos: "serviços",
      contasReceber: "contas a receber",
      comissoes: "comissões",
    }[type];

    CustomToast({
      type: "success",
      message: `Notificações de ${tipoLabel} limpas com sucesso!`,
    });
  };

  const clearAllNotifications = () => {
    setNotifications({
      contas: [],
      servicos: [],
      contasReceber: [],
      comissoes: [],
    });
    CustomToast({
      type: "success",
      message: "Todas as notificações foram limpas!",
    });
  };

  const buscarParcelasPendentes = async () => {
    setLoading((prev) => ({ ...prev, contas: true }));
    try {
      const response = await buscarContasPagarPendente();
      const parcelas = response?.parcelas || [];
      setParcelasPendentes(parcelas);
      return parcelas;
    } catch (error) {
      console.error("Erro ao buscar parcelas pendentes:", error);
      setParcelasPendentes([]);
    } finally {
      setLoading((prev) => ({ ...prev, contas: false }));
    }
  };

  const buscarServicosPendentes = async () => {
    setLoading((prev) => ({ ...prev, servicos: true }));
    try {
      const response = await buscarServicoPendente();

      let todasPendencias = [];

      if (response?.data?.pendencias) {
        todasPendencias = response.data.pendencias;
      } else if (response?.pendencias) {
        todasPendencias = response.pendencias;
      } else if (Array.isArray(response)) {
        todasPendencias = response;
      } else if (response?.data && Array.isArray(response.data)) {
        todasPendencias = response.data;
      }

      const servicosFiltrados = todasPendencias.filter((item) => {
        const isServico =
          item.tipo === "prestador" ||
          item.origem === "prestador" ||
          item.tipo?.toLowerCase() === "serviço" ||
          item.tipo?.toLowerCase() === "servico";

        const isNotConta =
          item.tipo !== "conta_fixa" &&
          item.tipo !== "conta_variavel" &&
          item.origem !== "conta_pagar_fixa" &&
          item.origem !== "conta_pagar_variavel";

        return isServico && isNotConta;
      });

      setServicosPendentes(servicosFiltrados);
      return servicosFiltrados;
    } catch (error) {
      console.error("Erro ao buscar serviços pendentes:", error);
      setServicosPendentes([]);
    } finally {
      setLoading((prev) => ({ ...prev, servicos: false }));
    }
  };

  const buscarContasReceberPendentesFn = async () => {
    setLoading((prev) => ({ ...prev, contasReceber: true }));
    try {
      const response = await buscarContasReceberPendente();
      const parcelas = response?.data || [];
      setContasReceberPendentes(parcelas);
      return parcelas;
    } catch (error) {
      console.error("Erro ao buscar contas a receber pendentes:", error);
      CustomToast({
        type: "error",
        message: error.message || "Erro ao buscar contas a receber pendentes",
      });
      setContasReceberPendentes([]);
    } finally {
      setLoading((prev) => ({ ...prev, contasReceber: false }));
    }
  };

  const buscarComissoesPendentes = async () => {
    setLoading((prev) => ({ ...prev, comissoes: true }));

    try {
      const response = await buscarContasReceberComissaoPendente();

      let comissoes = [];

      if (response?.data?.comissoes) {
        comissoes = response.data.comissoes;
      } else if (response?.data?.data?.comissoes) {
        comissoes = response.data.data.comissoes;
      } else if (response?.comissoes) {
        comissoes = response.comissoes;
      } else if (response?.data?.pendencias) {
        comissoes = response.data.pendencias.filter(
          (item) =>
            item.origem === "comissao_servico" || item.tipo === "comissao",
        );
      } else if (Array.isArray(response)) {
        comissoes = response;
      } else if (response?.data && Array.isArray(response.data)) {
        comissoes = response.data;
      }

      const comissoesPendentesFiltradas = comissoes.filter((item) => {
        const status =
          item.status || item.status_pagamento || item.status_codigo;
        return status === "pendente" || status === 1 || status === "Pendente";
      });

      setComissoesPendentes(comissoesPendentesFiltradas);

      return comissoesPendentesFiltradas;
    } catch (error) {
      console.error("Erro ao buscar comissões pendentes:", error);

      if (error.response?.status === 500) {
        CustomToast({
          type: "error",
          message: "Erro ao carregar comissões pendentes",
        });
      }

      setComissoesPendentes([]);
    } finally {
      setLoading((prev) => ({ ...prev, comissoes: false }));
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        buscarParcelasPendentes(),
        buscarServicosPendentes(),
        buscarContasReceberPendentesFn(),
        buscarComissoesPendentes(),
      ]);
    };

    fetchAllData();

    const intervalId = setInterval(fetchAllData, 4 * 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (parcelasPendentes.length > 0) {
      verificarParcelasVencidas();
    }
  }, [parcelasPendentes, verificarParcelasVencidas]);

  useEffect(() => {
    if (servicosPendentes.length > 0) {
      verificarServicosVencidos();
    }
  }, [servicosPendentes, verificarServicosVencidos]);

  useEffect(() => {
    if (contasReceberPendentes.length > 0) {
      verificarContasReceberVencidas();
    }
  }, [contasReceberPendentes, verificarContasReceberVencidas]);

  useEffect(() => {
    if (comissoesPendentes.length > 0) {
      verificarComissoesVencidas();
    }
  }, [comissoesPendentes, verificarComissoesVencidas]);

  const getCurrentNotifications = () => {
    switch (notificationTab) {
      case 0:
        return notifications.contas;
      case 1:
        return notifications.servicos;
      case 2:
        return notifications.contasReceber;
      case 3:
        return notifications.comissoes;
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
      case 3:
        return notifications.comissoes.length;
      default:
        return 0;
    }
  };

  const getCurrentLoading = () => {
    switch (notificationTab) {
      case 0:
        return loading.contas;
      case 1:
        return loading.servicos;
      case 2:
        return loading.contasReceber;
      case 3:
        return loading.comissoes;
      default:
        return false;
    }
  };

  const renderComissaoNotification = (notification) => (
    <ListItem
      button
      key={notification.id}
      sx={{
        backgroundColor: notification.read
          ? "transparent"
          : notification.urgencia === "critico"
            ? "#ffebee"
            : notification.urgencia === "alto"
              ? "#fff3e0"
              : notification.urgencia === "medio"
                ? "#fff8e1"
                : "transparent",
        "&:hover": {
          backgroundColor:
            notification.urgencia === "critico"
              ? "#ffcdd2"
              : notification.urgencia === "alto"
                ? "#ffe0b2"
                : notification.urgencia === "medio"
                  ? "#ffecb3"
                  : "#f5f5f5",
        },
      }}
    >
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography
              style={{
                fontWeight: notification.read ? "normal" : "bold",
                fontSize: "0.95rem",
              }}
            >
              {notification.text}
            </Typography>
            {notification.urgencia === "critico" && (
              <Chip
                label="Crítico"
                size="small"
                color="error"
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
            )}
            {notification.urgencia === "alto" && (
              <Chip
                label="Alto"
                size="small"
                color="error"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
            )}
            {notification.urgencia === "medio" && (
              <Chip
                label="Médio"
                size="small"
                color="warning"
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
            )}
          </Box>
        }
        secondary={
          <Box sx={{ mt: 0.5 }}>
            <Typography component="div" variant="body2" color="textSecondary">
              <strong>Prestador:</strong> {notification.details.prestador}
              <br />
              <strong>Cliente:</strong> {notification.details.cliente}
              <br />
              <strong>Vencimento:</strong> {notification.details.vencimento}
              <br />
              <strong>Valor:</strong> {notification.details.valor}
            </Typography>
            <Typography
              component="div"
              variant="caption"
              sx={{
                color:
                  notification.urgencia === "critico"
                    ? "error.main"
                    : notification.urgencia === "alto"
                      ? "error.light"
                      : notification.urgencia === "medio"
                        ? "warning.main"
                        : "warning.light",
                fontWeight: "bold",
                marginTop: 1,
              }}
            >
              {notification.time}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );

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
          <Tab
            label={`Comissões (${notifications.comissoes.length})`}
            id="notification-tab-3"
            icon={<PaymentsIcon fontSize="small" />}
            iconPosition="start"
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
                  3: "comissoes",
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
                  : notificationTab === 2
                    ? "Contas a Receber"
                    : "Comissões"}
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
              if (notification.type === "comissao") {
                return renderComissaoNotification(notification);
              } else if (notification.type === "conta") {
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
                : notificationTab === 2
                  ? "conta a receber"
                  : "comissão"}{" "}
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
