import React from 'react';
import { Fab } from '@mui/material';
import ShoppingBagTwoToneIcon from '@mui/icons-material/ShoppingBagTwoTone';

const CustomFab = ({ size = 'small', color = 'brown', onClick }) => {
  return (
    <Fab
      size={size}
      color={color}
      aria-label="add"
      onClick={onClick}
      sx={{
        position: 'fixed',
        bottom: 16,  // Adjust this value for bottom spacing
        right: 16,   // Adjust this value for right spacing
        backgroundColor: 'white',
        color: 'brown',
      }}
    >
      <ShoppingBagTwoToneIcon />
    </Fab>
  );
};

export default CustomFab;
