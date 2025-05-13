import InputMask from 'react-input-mask';
import { Phone } from '@mui/icons-material';
import { TextField, InputAdornment, Box } from '@mui/material';

export function TelefoneInput({ value, onChange }) {
  return (
    <Box width="95%">
      <InputMask
        mask="(99) 99999-9999"
        value={value}
        onChange={onChange}
      >
        {(inputProps) => (
          <TextField
            {...inputProps}
            fullWidth
            label="Telefone"
            size="small"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
          />
        )}
      </InputMask>
    </Box>
  );
}
