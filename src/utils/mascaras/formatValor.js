export const mascaraValor = (valor) => {

  const valorNumerico = valor.replace(/\D/g, '');
  
  const valorFormatado = (parseFloat(valorNumerico) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return valorFormatado;
};