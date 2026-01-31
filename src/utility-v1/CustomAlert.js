import React, { useEffect } from 'react';
import { Alert, AlertTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CustomAlert = ({ severity = 'info', title, message, onClose }) => {
  
  // Auto close after 3 seconds (3000 milliseconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 2000);

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Alert
      severity={severity}  // Severity can be "error", "warning", "info", or "success"
      action={
        onClose && (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        )
      }
      sx={{
        position: 'fixed',  // Fixed position to make it stay on the top
        top: 0,  // Aligns the alert at the top of the screen
        left: 0,  // Makes the alert start from the left edge
        right: 0,  // Makes the alert stretch to the right edge
        zIndex: 9999,  // Ensures it appears above other elements
        borderRadius: 0,  // Removes border radius to make it full-width
        mb: 2  // Optional bottom margin for spacing
      }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
};

export default CustomAlert;
