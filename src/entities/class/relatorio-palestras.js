export const relatoriosPalestras = (palestras) => {
  return palestras.map((palestra) => ({
    id: palestra.id,
    nome: palestra.nome,
    cpf: palestra.cpf_cnpj,
    email: palestra.email,
    ativo: palestra.ativo,
  }));
};
