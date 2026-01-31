import React from 'react';
import { FormControl, InputLabel, MenuItem, Select, FormHelperText } from '@mui/material';

const SelectBox = ({ label, name, value, onChange, options, placeholder, error = false, helperText = '' }) => {
  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel>{label}</InputLabel>
      <Select
        name={name}
        value={value}
        onChange={onChange}
        label={label}
        disablePortal  // Disable portal to avoid z-index issues
        MenuProps={{
          disableScrollLock: true,  // Prevents issues with mobile scroll behavior
          PaperProps: {
            style: {
              zIndex: 1300,  // Adjust z-index if needed
            },
          },
        }}
        // Keep the Select input normal, without error styling
      >
        <MenuItem value="">
          <em>{placeholder}</em> {/* Placeholder item */}
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>

      {/* Only show the FormHelperText if there is an error or helperText is provided */}
      {(error && helperText) && (
        <FormHelperText error={error}>{helperText}</FormHelperText>  // Show error in helper text, but not in the select options
      )}
    </FormControl>
  );
};

export default SelectBox;
