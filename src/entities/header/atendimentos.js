export const atendimentosCadastrados = [
  { key: "cliente", label: "Cliente" },
  { key: "prestadores", label: "Prestadores" },
  { key: "data_inicio", label: "Data Início" },
  { key: "data_entrega", label: "Data Entrega" },
  { key: "servicos", label: "Serviços", render: (servicos) => servicos.join(", ") },
  { key: "valor_total", label: "Valor Total" },
  { key: "comissao", label: "Comissão" }
];