import React, { useEffect, useState } from "react";
import ButtonComponent from "../../../../components/button";

import TransformIcon from "@mui/icons-material/Transform";
import ModalLateral from "../../../../components/modal-lateral";
import {
  Article,
  Category,
  DateRange,
  InfoRounded,
  MonetizationOn,
  Numbers,
  Save,
} from "@mui/icons-material";
import {
  Checkbox,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import CustomToast from "../../../../components/toast";
import { atualizarContasReceber } from "../../../../service/put/contas-receber";

const EditarContaREceber = ({
  informacoes,
  handleCloseInformacoes,
  contaSelecionada,
  handleClosInformacoes,
  categoriasCadastradas,
  onUpdateSuccess,
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

  const handleUpdate = async () => {
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
        dadosParaEnvio.custo_fixo = true;
        dadosParaEnvio.quantidade_parcelas = parseInt(quantidadeParcelas);
        dadosParaEnvio.valor_mensal = parseFloat(valorMensal);
      } else {
        dadosParaEnvio.custo_variavel = true;
        dadosParaEnvio.valor_total = parseFloat(valorTotal);
      }

      await atualizarContasReceber(dadosParaEnvio, contaSelecionada.id);

      CustomToast({
        type: "success",
        message: "Conta atualizada com sucesso!",
      });
      handleCloseInformacoes();
    } catch (error) {
      CustomToast({
        type: "error",
        message: error.message || "Erro ao atualizar conta",
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

  useEffect(() => {
    if (contaSelecionada) {
      setNome(contaSelecionada.nome || "");
      setCategoriaId(contaSelecionada.categoria_id || "");

      const dataOriginal = contaSelecionada.data_inicio;
      const dataParaInput = dataOriginal.includes("T")
        ? dataOriginal.split("T")[0]
        : dataOriginal.split("/").reverse().join("-");
      setDataInicio(dataParaInput);

      const tipo = contaSelecionada.custo_fixo ? "fixo" : "variavel";
      setTipoCusto(tipo);

      if (tipo === "fixo") {
        setQuantidadeParcelas(contaSelecionada.quantidade_parcelas || "");
        setValorMensal(contaSelecionada.valor_mensal || "");
        setValorTotal("");
      } else {
        setValorTotal(contaSelecionada.valor_total || "");
        setQuantidadeParcelas("");
        setValorMensal("");
      }

      setFormaPagamento(contaSelecionada.forma_pagamento || "");
    }
  }, [contaSelecionada]);

  return (
    <div>
      <ModalLateral
        open={informacoes}
        handleClose={() => {
          handleClosInformacoes();
        }}
        tituloModal={`Editar Conta`}
        icon={<InfoRounded />}
        tamanhoTitulo="75%"
        conteudo={
          <div className="flex flex-wrap w-full items-center gap-4">
            <div className="flex gap-3 flex-wrap">
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
                  width: {
                    xs: "100%",
                    sm: "50%",
                    md: "40%",
                    lg: "95%",
                  },
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
                      <Category />
                    </InputAdornment>
                  ),
                }}
              >
                {categoriasCadastradas.map((categoria) => (
                  <MenuItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </MenuItem>
                ))}
              </TextField>

              {tipoCusto === "fixo" ? (
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
                    disabled
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
              ) : (
                <>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    label="Data Pagamento"
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

            <div className="flex w-[96%] items-end justify-end mt-2 gap-2">
              <ButtonComponent
                startIcon={<Save fontSize="small" />}
                title={"Salvar"}
                subtitle={"Salvar"}
                buttonSize="large"
                onClick={handleUpdate}
                disabled={!validarCampos() || loading}
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default EditarContaREceber;
