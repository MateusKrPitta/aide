import React from "react";
import InputMask from "react-input-mask";
import { TextField, InputAdornment } from "@mui/material";
import { Article } from "@mui/icons-material";

const MaskedFieldCpf = ({
  type = "cpf",
  label,
  value,
  onChange,
  icon = <Article />,
  iconSize = 24,
  labelSize = "medium",
  width = "100%",
  ...props
}) => {
  const mask = type === "cnpj" ? "99.999.999/9999-99" : "999.999.999-99";

  return (
    <InputMask mask={mask} value={value || ""} onChange={onChange} {...props}>
      {() => (
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          label={label}
          value={value || ""}
          onChange={onChange}
          InputLabelProps={{
            shrink: true,
            style: { fontSize: labelSize === "small" ? "0.75rem" : "1rem" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {React.cloneElement(icon, { style: { fontSize: iconSize } })}
              </InputAdornment>
            ),
          }}
          sx={{ width }}
        />
      )}
    </InputMask>
  );
};

export default MaskedFieldCpf;
