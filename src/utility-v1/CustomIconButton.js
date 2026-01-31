import React from 'react';
import { IconButton, Icon } from '@mui/material';

const CustomIconButton = ({ icon, onClick, size = 'small', color = 'default', ...props }) => {
  return (
    <IconButton
      size={size}  // small, medium, large
      color={color}  // default, primary, secondary, error, etc.
      onClick={onClick}  // Click handler
      {...props}  // Spread other props like disabled, aria-label, etc.
    >
      <Icon>{icon}</Icon>  {/* Display the icon */}
    </IconButton>
  );
};

export default CustomIconButton;
