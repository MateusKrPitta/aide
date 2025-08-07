export const relatoriosPrestadores = (prestadores) => {
  return prestadores.map((prestadore) => ({
    id: prestadore.id,
    nome: prestadore.nome,
    cpf: prestadore.cpf_cnpj,
    email: prestadore.email,
    ativo: prestadore.ativo,
  }));
};
