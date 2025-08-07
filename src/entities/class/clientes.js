import { formatarTelefone } from "../../utils/mascaras/celular";

export const cadastrosClientes = (clientes) => {
  return clientes.map((cliente) => ({
    id: cliente.id,
    nome: cliente.nome,
    telefone: formatarTelefone(cliente.telefone),
    cpf: cliente.cpf_cnpj,
    email: cliente.email,
    ativo: cliente.ativo,
  }));
};
