import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { buscarContasPagarPendente } from "../service/get/contas-pagar-pendente";
import { buscarServicoPendente } from "../service/get/servico-pendente";
import { buscarContasReceberPendente } from "../service/get/contas-receber-pendente";
import CustomToast from "../components/toast";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications deve ser usado dentro de um NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    contas: [],
    servicos: [],
    contasReceber: [],
  });
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  const formatarData = (dataStr) => {
    if (!dataStr) return "Data não informada";
    try {
      const data = new Date(dataStr);
      return isNaN(data.getTime()) ? "Data inválida" : data.toLocaleDateString("pt-BR");
    } catch {
      return "Data inválida";
    }
  };

  const processarDados = useCallback((tipo, dados) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const novasNotificacoes = [];

    if (tipo === "contas") {
        (dados || []).forEach(parcela => {
            const vencimentoDate = new Date(parcela.data_vencimento);
            vencimentoDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((vencimentoDate - now) / (1000 * 60 * 60 * 24));
            if (diffDays < 0 && parcela.status === "Pendente") {
                novasNotificacoes.push({
                    id: `conta-${parcela.id}`,
                    text: `💰 Conta vencida: "${parcela.nome_conta}"`,
                    details: {
                        descricao: parcela.descricao_parcela,
                        vencimento: vencimentoDate.toLocaleDateString(),
                        valor: `R$ ${parcela.valor.toFixed(2)}`,
                        diasAtraso: Math.abs(diffDays)
                    },
                    read: false,
                    time: `Vencida há ${Math.abs(diffDays)} dias`,
                    type: "conta"
                });
            }
        });
    } else if (tipo === "servicos") {
        (dados || []).forEach(servico => {
            const vencimentoDate = new Date(servico.data_vencimento);
            vencimentoDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((vencimentoDate - now) / (1000 * 60 * 60 * 24));
            if (diffDays < 0 && (servico.status || "").toLowerCase() === "pendente") {
                novasNotificacoes.push({
                    id: `servico-${servico.id}-${Math.random()}`,
                    text: `🔧 Serviço vencido: "${servico.nome || servico.servico_nome || "Serviço"}"`,
                    details: {
                        cliente: servico.cliente_nome || "Não informado",
                        prestador: servico.prestador_nome || "",
                        vencimento: vencimentoDate.toLocaleDateString(),
                        valor: `R$ ${parseFloat(servico.valor || 0).toFixed(2)}`,
                        diasAtraso: Math.abs(diffDays)
                    },
                    read: false,
                    time: `Vencido há ${Math.abs(diffDays)} dias`,
                    type: "servico"
                });
            }
        });
    } else if (tipo === "contasReceber") {
        (dados || []).forEach(parcela => {
            const vencimentoDate = new Date(parcela.data_vencimento);
            if (isNaN(vencimentoDate.getTime())) return;
            vencimentoDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((vencimentoDate - now) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) {
                novasNotificacoes.push({
                    id: `conta-receber-${parcela.id}-${Math.random()}`,
                    text: `📋 Conta a receber vencida: "${parcela.nome}"`,
                    details: {
                        descricao: parcela.descricao,
                        vencimento: vencimentoDate.toLocaleDateString(),
                        valor: `R$ ${parseFloat(parcela.valor).toFixed(2)}`,
                        diasAtraso: Math.abs(diffDays)
                    },
                    read: false,
                    time: `Vencido há ${Math.abs(diffDays)} dias`,
                    type: "conta_receber"
                });
            }
        });
    }

    return novasNotificacoes;
  }, []);

  const fetchAllNotifications = useCallback(async (force = false) => {
    // Só busca se houver token e não estiver na tela de login
    const token = sessionStorage.getItem("token");
    const isLoginPage = window.location.pathname === "/";
    
    if (!token || isLoginPage) {
        return;
    }

    // Evita chamadas repetidas se já buscou nos últimos 5 minutos (a menos que seja forçado)
    const now = new Date();
    if (!force && lastFetch && (now - lastFetch < 5 * 60 * 1000)) {
        return;
    }

    setLoading(true);
    try {
      const [contasRes, servicosRes, receberRes] = await Promise.all([
        buscarContasPagarPendente().catch(() => ({ parcelas: [] })),
        buscarServicoPendente().catch(() => []),
        buscarContasReceberPendente().catch(() => ({ data: [] }))
      ]);

      const novasNotifs = {
        contas: processarDados("contas", contasRes?.parcelas || []),
        servicos: processarDados("servicos", Array.isArray(servicosRes) ? servicosRes : (servicosRes?.data?.pendencias || [])),
        contasReceber: processarDados("contasReceber", receberRes?.data || [])
      };

      setNotifications(novasNotifs);
      setLastFetch(now);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setLoading(false);
    }
  }, [lastFetch, processarDados]);

  const markAsRead = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: prev[type].map(n => ({ ...n, read: true }))
    }));
  };

  const clearNotifications = (type) => {
    setNotifications(prev => ({ ...prev, [type]: [] }));
  };

  const clearAll = () => {
    setNotifications({ contas: [], servicos: [], contasReceber: [] });
  };

  const location = useLocation();

  useEffect(() => {
    fetchAllNotifications();
  }, [location.pathname, fetchAllNotifications]);

  useEffect(() => {
    const interval = setInterval(() => fetchAllNotifications(), 30 * 60 * 1000); // 30 min
    return () => clearInterval(interval);
  }, [fetchAllNotifications]);

  const unreadCount = 
    notifications.contas.filter(n => !n.read).length +
    notifications.servicos.filter(n => !n.read).length +
    notifications.contasReceber.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ 
        notifications, 
        loading, 
        unreadCount, 
        fetchAllNotifications, 
        markAsRead, 
        clearNotifications, 
        clearAll 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
