export const mascaraValor = (valor) => {
  const valorString = valor.toString();

  const valorNumerico = valorString.replace(/[^\d,.-]/g, "");

  const numero = parseFloat(valorNumerico) || 0;

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};
