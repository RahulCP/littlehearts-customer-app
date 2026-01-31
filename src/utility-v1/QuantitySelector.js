import React, { useState, useEffect } from 'react';
import { IconButton, TextField, Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const QuantitySelector = ({ initialQuantity, minQuantity = 1, maxQuantity = 10, onQuantityChange }) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  // Sync quantity with initialQuantity prop when it changes
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  // Handle increment
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange && onQuantityChange(newQuantity);
    }
  };

  // Handle decrement
  const handleDecrement = () => {
    if (quantity > minQuantity) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange && onQuantityChange(newQuantity);
    }
  };

  return (
    <Box
      position="relative"
      display="inline-block"
      sx={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        width: 'fit-content',
      }}
    >
      {/* Quantity Label in the top-left corner */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          top: '-10px',
          left: '8px',
          backgroundColor: '#fff',
          padding: '0 4px',
          fontSize: '12px',
        }}
      >
        Quantity
      </Typography>

      {/* Quantity Control */}
      <Box display="flex" alignItems="center" justifyContent="center">
        {/* Decrement Button */}
        <IconButton
          onClick={handleDecrement}
          disabled={quantity <= minQuantity}
          color="primary"
        >
          <RemoveIcon />
        </IconButton>

        {/* Quantity Display */}
        <TextField
          value={quantity}
          size="small"
          variant="standard"
          inputProps={{ readOnly: true, style: { textAlign: 'center' } }}
          sx={{
            width: 40,
            mx: 1,
            '& .MuiInput-underline:before': { borderBottom: 'none' },
            '& .MuiInput-underline:after': { borderBottom: 'none' },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
          }}
        />

        {/* Increment Button */}
        <IconButton
          onClick={handleIncrement}
          disabled={quantity >= maxQuantity}
          color="primary"
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default QuantitySelector;
