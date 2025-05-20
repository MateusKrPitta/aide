import {
  Assignment,
  DateRange,
  DateRangeOutlined,
  Money,
  MoneyOutlined,
  CreditCard,
  AttachMoney,
  AccountBalance,
} from "@mui/icons-material";
import { InputAdornment, MenuItem, TextField } from "@mui/material";
import React, { useState } from "react";
import ButtonClose from "../../../../components/buttons/button-close";

const TrabalhoAtendimento = () => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([
    "Limpeza Dentária",
    "Clareamento",
    "Restauração",
    "Extração",
    "Ortodontia",
  ]);
  const [tipoPagamento, setTipoPagamento] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("");

  return (
    <div className="flex w-full flex-wrap items-center gap-4">
      <label className="text-xs w-full">Prestador:</label>
      <TextField
        select
        fullWidth
        label="Selecione um serviço"
        value=""
        sx={{
          width: {
            xs: "100%",
            sm: "50%",
            md: "40%",
            lg: "40%",
          },
        }}
        onChange={(event) => {
          const service = event.target.value;
          if (service && !selectedServices.includes(service)) {
            setSelectedServices([...selectedServices, service]);
            setAvailableServices(
              availableServices.filter((s) => s !== service)
            );
          }
        }}
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Assignment />
            </InputAdornment>
          ),
        }}
      >
        {availableServices.map((service) => (
          <MenuItem key={service} value={service}>
            {service}
          </MenuItem>
        ))}
      </TextField>

      {/* Campos de data */}
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        label="Data de Início"
        type="date"
        name="data"
        autoComplete="off"
        sx={{
          width: {
            xs: "100%",
            sm: "50%",
            md: "40%",
            lg: "25%",
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <DateRangeOutlined />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        type="date"
        label="Data de Entrega"
        name="data"
        autoComplete="off"
        sx={{
          width: {
            xs: "100%",
            sm: "50%",
            md: "40%",
            lg: "25%",
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

      {/* Campos de pagamento */}

      {/* Lista de serviços selecionados */}
      {selectedServices.map((service) => (
        <div
          style={{
            border: "1px solid hsl(348, 35.30%, 45.50%)",
            borderRadius: "10px",
            padding: "10px",
          }}
          className="flex w-[95%] items-center gap-3 justify-between"
          key={service}
        >
          <label className="text-xs w-[30%] ">{service}</label>
          <div className="flex w-[70%] flex-wrap gap-2 items-center">
            <TextField
              select
              fullWidth
              label="Tipo de Pagamento"
              value={tipoPagamento}
              onChange={(e) => setTipoPagamento(e.target.value)}
              sx={{
                width: {
                  xs: "100%",
                  sm: "50%",
                  md: "40%",
                  lg: "35%",
                },
              }}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyOutlined />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">Selecione</MenuItem>
              <MenuItem value="a_vista">À vista</MenuItem>
              <MenuItem value="parcelado">Parcelado</MenuItem>
            </TextField>

            {tipoPagamento === "a_vista" && (
              <TextField
                select
                fullWidth
                label="Método de Pagamento"
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "50%",
                    md: "40%",
                    lg: "50%",
                  },
                }}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {metodoPagamento === "dinheiro" && <AttachMoney />}
                      {metodoPagamento === "pix" && <AccountBalance />}
                      {metodoPagamento === "debito" && <CreditCard />}
                      {metodoPagamento === "credito" && <CreditCard />}
                      {!metodoPagamento && <MoneyOutlined />}
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">Selecione</MenuItem>
                <MenuItem value="dinheiro">Dinheiro</MenuItem>
                <MenuItem value="pix">PIX</MenuItem>
                <MenuItem value="debito">Cartão de Débito</MenuItem>
                <MenuItem value="credito">Cartão de Crédito</MenuItem>
              </TextField>
            )}

            {tipoPagamento === "parcelado" && (
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                label="Nº de Parcelas"
                type="number"
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "50%",
                    md: "40%",
                    lg: "50%",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyOutlined />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label="Valor"
              name="valor"
              autoComplete="off"
              sx={{
                width: {
                  xs: "100%",
                  sm: "50%",
                  md: "40%",
                  lg: "48%",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Money />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label="Comissão"
              name="comissao"
              autoComplete="off"
              sx={{
                width: {
                  xs: "100%",
                  sm: "50%",
                  md: "40%",
                  lg: "37%",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyOutlined />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <ButtonClose
            funcao={() => {
              setSelectedServices(
                selectedServices.filter((s) => s !== service)
              );
              setAvailableServices([...availableServices, service]);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default TrabalhoAtendimento;
