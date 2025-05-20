import React from "react";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Article, Numbers, Person, Phone } from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";

const ClienteAtendimento = () => {
  return (
    <div className="flex w-full  flex-wrap items-center gap-4">
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
            lg: "47%",
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
              <LocationOnIcon />
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
              <LocationOnIcon />
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
              <LocationOnIcon />
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

export default ClienteAtendimento;
