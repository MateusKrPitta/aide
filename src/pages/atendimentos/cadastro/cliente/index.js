import React from "react";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  AddCircleOutline,
  Article,
  Numbers,
  Person,
  Phone,
} from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";
import ButtonComponent from "../../../../components/button";

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
            xs: "60%",
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
      <ButtonComponent
        startIcon={<AddCircleOutline fontSize="small" />}
        title={"Adicionar"}
        subtitle={"Adicionar"}
        buttonSize="large"
      />
    </div>
  );
};

export default ClienteAtendimento;
