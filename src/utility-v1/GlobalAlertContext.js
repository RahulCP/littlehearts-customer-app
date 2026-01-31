import React, { createContext, useState, useContext } from "react";
import { Alert, Slide, Box } from "@mui/material";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const showAlert = (message, severity = "info") => {
    setAlert({ open: true, severity, message });
    setTimeout(() => {
      setAlert({ open: false, severity: "info", message: "" });
    }, 3000); // Auto-hide after 3 seconds
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert.open && (
        <Slide direction="down" in={alert.open} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: "fixed",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1400,
              width: "90%",
              maxWidth: "600px",
            }}
          >
            <Alert severity={alert.severity}>{alert.message}</Alert>
          </Box>
        </Slide>
      )}
    </AlertContext.Provider>
  );
};

export default AlertProvider;
