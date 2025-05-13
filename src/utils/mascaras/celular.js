export const formatarTelefone = (telefone) => {
    if (!telefone) return '';

    telefone = telefone.replace(/\D/g, '');

    if (telefone.length === 11) {
        return telefone.replace(
            /(\d{2})(\d{5})(\d{4})/,
            '($1) $2-$3'
        );
    } else if (telefone.length === 10) {
        return telefone.replace(
            /(\d{2})(\d{4})(\d{4})/,
            '($1) $2-$3'
        );
    }

    return telefone; 
};