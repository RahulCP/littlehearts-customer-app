import React from 'react';
import { Button } from '@mui/material';

const CustomButton = ({ label, variant, color, size, onClick }) => {
  return (
    <Button
      variant={variant}   // Outlined, contained, or text
      color={color}       // Primary, secondary, etc.
      size={size}   
      fullWidth      // Small, medium, or large
      onClick={onClick}   // Event handler
      sx={{
        textTransform: 'none'  // Prevents text from being capitalized
      }}
    >
      {label}
    </Button>
  );
};

export default CustomButton;
