import React, { useState } from "react";
import CentralModal from "../../../../components/modal-central";
import {
  AddCircleOutline,
  Article,
  Category,
  DateRange,
  MonetizationOn,
  Numbers,
} from "@mui/icons-material";
import {
  Checkbox,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import TransformIcon from "@mui/icons-material/Transform";
import ButtonComponent from "../../../../components/button";
import CustomToast from "../../../../components/toast";
import { criarContasReceber } from "../../../../service/post/contas-receber";

const CadastrarContaReceber = ({
  cadastroUsuario,
  setCadastroUsuario,
  categoriasCadastradas,
  onCadastroSuccess,
}) => {
  const [tipoCusto, setTipoCusto] = useState("fixo");
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [quantidadeParcelas, setQuantidadeParcelas] = useState("");
  const [valorMensal, setValorMensal] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [prestadorId, setPrestadorId] = useState("");

  const categoriasAtivas = categoriasCadastradas.filter(
    (categoria) => categoria.ativo
  );

  const limparCampos = () => {
    setNome("");
    setCategoriaId("");
    setDataInicio("");
    setQuantidadeParcelas("");
    setValorMensal("");
    setValorTotal("");
    setFormaPagamento("");
    setPrestadorId("");
    setTipoCusto("fixo");
  };

  const FecharCadastroUsuario = () => {
    setCadastroUsuario(false);
    limparCampos();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!nome || !categoriaId || !dataInicio) {
        CustomToast({
          type: "error",
          message: "Preencha todos os campos obrigatórios",
        });
        return;
      }

      if (tipoCusto === "fixo" && (!quantidadeParcelas || !valorMensal)) {
        CustomToast({
          type: "error",
          message:
            "Para custo fixo, preencha quantidade de parcelas e valor mensal",
        });
        return;
      }

      if (tipoCusto === "variavel" && !valorTotal) {
        CustomToast({
          type: "error",
          message: "Para custo variável, preencha o valor total",
        });
        return;
      }

      const dadosParaEnvio = {
        nome,
        categoria_id: parseInt(categoriaId),
        data_inicio: dataInicio,
        forma_pagamento: formaPagamento,
      };

      if (tipoCusto === "fixo") {
        const inicio = new Date(dataInicio);
        const meses = parseInt(quantidadeParcelas);
        const fim = new Date(inicio);
        fim.setMonth(inicio.getMonth() + meses - 1);

        dadosParaEnvio.custo_fixo = true;
        dadosParaEnvio.quantidade_parcelas = meses;
        dadosParaEnvio.valor_mensal = parseFloat(valorMensal);
        dadosParaEnvio.prestador_id = prestadorId
          ? parseInt(prestadorId)
          : null;
        dadosParaEnvio.data_fim = fim.toISOString().split("T")[0];
      } else {
        dadosParaEnvio.custo_variavel = true;
        dadosParaEnvio.valor_total = parseFloat(valorTotal);
      }

      const response = await criarContasReceber(dadosParaEnvio);

      CustomToast({
        type: "success",
        message: "Conta cadastrada com sucesso!",
      });

      if (onCadastroSuccess) {
        onCadastroSuccess();
      }

      setCadastroUsuario(false);
      setNome("");
      setCategoriaId("");
      setDataInicio("");
      setQuantidadeParcelas("");
      setValorMensal("");
      setValorTotal("");
      setFormaPagamento("");
      setPrestadorId("");
      limparCampos();
    } catch (error) {
      CustomToast({
        type: "error",
        message: error.message || "Erro ao cadastrar conta",
      });
    } finally {
      setLoading(false);
    }
  };

  const validarCampos = () => {
    const camposObrigatorios =
      nome && categoriaId && dataInicio && formaPagamento;

    if (tipoCusto === "fixo") {
      return camposObrigatorios && quantidadeParcelas && valorMensal;
    }

    if (tipoCusto === "variavel") {
      return camposObrigatorios && valorTotal;
    }

    return false;
  };

  return (
    <div>
      <CentralModal
        tamanhoTitulo={"81%"}
        maxHeight={"90vh"}
        top={"20%"}
        left={"28%"}
        width={"500px"}
        icon={<AddCircleOutline fontSize="small" />}
        open={cadastroUsuario}
        onClose={FecharCadastroUsuario}
        title="Cadastrar Conta"
      >
        <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
          <div className="mt-4 flex gap-3 flex-wrap">
            <div className="flex gap-4">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tipoCusto === "fixo"}
                    onChange={() => setTipoCusto("fixo")}
                    color="primary"
                  />
                }
                label="Custo Fixo"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tipoCusto === "variavel"}
                    onChange={() => setTipoCusto("variavel")}
                    color="primary"
                  />
                }
                label="Custo Variável"
              />
            </div>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              sx={{
                width: { xs: "100%", sm: "50%", md: "40%", lg: "95%" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Article />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              label="Categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              sx={{
                width: { xs: "100%", sm: "50%", md: "40%", lg: "45%" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Category />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">Selecione uma categoria</MenuItem>
              {categoriasAtivas.length > 0 ? (
                categoriasAtivas.map((categoria) => (
                  <MenuItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Nenhuma categoria ativa disponível</MenuItem>
              )}
            </TextField>

            {tipoCusto === "fixo" && (
              <>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Data Início"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "50%",
                      md: "40%",
                      lg: "47%",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRange />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="number"
                  label="Nº Parcelas"
                  value={quantidadeParcelas}
                  onChange={(e) => setQuantidadeParcelas(e.target.value)}
                  sx={{
                    width: {
                      xs: "48%",
                      sm: "50%",
                      md: "40%",
                      lg: "45%",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Numbers />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Valor Mensal"
                  value={valorMensal}
                  onChange={(e) => setValorMensal(e.target.value)}
                  type="number"
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "50%",
                      md: "40%",
                      lg: "47%",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MonetizationOn />
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}

            {tipoCusto === "variavel" && (
              <>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Data"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "50%",
                      md: "40%",
                      lg: "45%",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRange />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Valor Total"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                  type="number"
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "50%",
                      md: "40%",
                      lg: "47%",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MonetizationOn />
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}

            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              label="Forma de Pagamento"
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              sx={{
                width: { xs: "100%", sm: "50%", md: "40%", lg: "45%" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TransformIcon />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="1">Crédito</MenuItem>
              <MenuItem value="2">Débito</MenuItem>
              <MenuItem value="3">Cheque</MenuItem>
              <MenuItem value="4">Pix</MenuItem>
              <MenuItem value="5">Dinheiro</MenuItem>
            </TextField>
          </div>

          <div className="flex w-[96%] items-end justify-end mt-2 ">
            <ButtonComponent
              startIcon={<AddCircleOutline fontSize="small" />}
              title={"Cadastrar"}
              subtitle={"Cadastrar"}
              buttonSize="large"
              onClick={handleSubmit}
              disabled={!validarCampos() || loading}
            />
          </div>
        </div>
      </CentralModal>
    </div>
  );
};

export default CadastrarContaReceber;
