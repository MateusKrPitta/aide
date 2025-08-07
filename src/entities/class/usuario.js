export const cadastrosUsuarios = (usuarios) => {
  return usuarios.map((usuario) => ({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    username: usuario.username || "-",
    telefone: usuario.telefone || "-",
    permissao: usuario.permissao,
    permissaoLabel: getPermissaoLabel(usuario.permissao),
    ativo: usuario.ativo,
  }));
};
const getPermissaoLabel = (permissao) => {
  switch (permissao) {
    case 1:
      return "Administrador";
    case 2:
      return "Cliente";
    case 3:
      return "Funcionário";
    case 5:
      return "Super Admin";
    default:
      return "Desconhecida";
  }
};
