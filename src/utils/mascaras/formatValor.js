export const formatarMoedaOnBlur = (val) => {
  if (val === undefined || val === null || val === "") return "";
  const clean = val
    .toString()
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = parseFloat(clean);
  if (isNaN(num)) return "";
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const desformatarValor = (valorFormatado) => {
  if (!valorFormatado && valorFormatado !== 0) return 0;
  if (typeof valorFormatado === "number") return valorFormatado;
  const clean = valorFormatado
    .toString()
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

export const formatarMoedaExibicao = (valor) => {
  const num = desformatarValor(valor);
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const mascaraValor = (valor) => {
  return formatarMoedaExibicao(valor);
};
