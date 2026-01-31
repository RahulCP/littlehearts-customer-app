import React from 'react';
import { TextField, InputAdornment, Icon, Typography } from '@mui/material';

const TextInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  multiline = false,
  rows = 1,
  error = false,
  helperText = '',
  InputProps = {},
  type = 'text' // Accepts 'text', 'number' (natural number), or 'currency'
}) => {
  return (
    <TextField
      variant="outlined"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      label={label}
      fullWidth
      multiline={multiline}
      rows={multiline ? rows : 1}
      helperText={
        error ? (
          <Typography variant="caption" sx={{ color: 'red' }}>
            {helperText}
          </Typography>
        ) : (
          helperText
        )
      }
      InputProps={{
        startAdornment: icon && (
          <InputAdornment position="start">
            <Icon>{icon}</Icon>
          </InputAdornment>
        ),
        ...InputProps
      }}
      // Remove the error styling from TextField while still displaying helper text
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: error ? 'rgba(0, 0, 0, 0.23)' : undefined // Keep the default border color when there's an error
          }
        },
        '& .MuiInputLabel-root': {
          color: error ? 'rgba(0, 0, 0, 0.6)' : undefined // Keep the default label color when there's an error
        }
      }}
      type={type === 'number' ? 'number' : 'text'}
      onInput={(e) => {
        if (type === 'number') {
          // Only allow natural numbers (positive integers)
          e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Only digits allowed
        } else if (type === 'price' || type === 'currency') {
          // Only allow digits and up to two decimal places
          let rawValue = e.target.value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except the dot
          const decimalParts = rawValue.split('.');

          // Ensure there are no more than two decimal places
          if (decimalParts.length === 2 && decimalParts[1].length > 2) {
            decimalParts[1] = decimalParts[1].substring(0, 2);
            rawValue = decimalParts.join('.');
          }
          e.target.value = rawValue;
        }
      }}
    />
  );
};

export default TextInput;
