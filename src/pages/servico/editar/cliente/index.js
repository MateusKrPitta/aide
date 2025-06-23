import {
  Article,
  LocationOnOutlined,
  Numbers,
  Person,
  Phone,
} from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";
import React from "react";

const ClienteEditar = () => {
  return (
    <div className="flex items-start gap-4 w-full flex-wrap">
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        label="Nome Cliente"
        name="nome"
        autoComplete="off"
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
              <Person />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        label="Telefone"
        name="telefone"
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
              <Phone />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        variant="outlined"
        size="small"
        label="CPF"
        name="cpf"
        autoComplete="off"
        sx={{
          width: {
            xs: "100%",
            sm: "50%",
            md: "40%",
            lg: "30%",
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
        fullWidth
        variant="outlined"
        size="small"
        label="Estado"
        name="estado"
        autoComplete="off"
        sx={{
          width: {
            xs: "100%",
            sm: "50%",
            md: "40%",
            lg: "30%",
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationOnOutlined />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        label="Cidade"
        name="cidade"
        autoComplete="off"
        sx={{
          width: {
            xs: "100%",
            sm: "50%",
            md: "40%",
            lg: "32%",
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationOnOutlined />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        label="Endereço"
        name="endereco"
        autoComplete="off"
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
              <LocationOnOutlined />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        label="Número"
        name="numero"
        autoComplete="off"
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
              <Numbers />
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

export default ClienteEditar;
