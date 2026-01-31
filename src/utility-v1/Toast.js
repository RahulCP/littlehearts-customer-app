import React, { useEffect, useState } from "react";
import { Alert, Slide } from "@mui/material";

const Toast = ({ open, severity, message, onClose }) => {
  const [show, setShow] = useState(open);

  useEffect(() => {
    if (open) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) onClose(); // Notify parent component about closing
      }, 2000); // Auto-close after 2 seconds
      return () => clearTimeout(timer); // Cleanup timer on unmount or open change
    }
  }, [open, onClose]);

  return (
    <Slide
      direction="down"
      in={show}
      mountOnEnter
      unmountOnExit
    >
      <Alert
        severity={severity}
        icon={false} // Disable icon if not needed
        sx={{
          position: "fixed",
          top: "0px", // Slightly below the top for better visibility
          left: "0%", // Center horizontally
          transform: "translateX(-50%)",
          zIndex: 1300,
          width: "100%",
          maxWidth: "100%", // Restrict to a container-lg size
          padding: "24px", // Increase padding for height
          fontSize: "1.25rem", // Larger font size for better visibility
          lineHeight: 1.5, // Increase line height for spacing
          boxShadow: 3, // Material-UI shadow
          borderRadius: 2, // Slightly rounded corners
        }}
      >
        {message}
      </Alert>
    </Slide>
  );
};

export default Toast;
