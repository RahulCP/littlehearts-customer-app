import React, { createContext, useState, useContext } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

// Toast Component
const Toast = ({ open, severity, message, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // Show toast at bottom
    >
      <MuiAlert onClose={onClose} severity={severity} elevation={6} variant="filled">
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

// Toast Context
const ToastContext = createContext();

// Provider Component
export const ToastProvider = ({ children }) => {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  const handleShowToast = (message, severity = "success") => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  return (
    <ToastContext.Provider value={{ handleShowToast }}>
      {children}
      <Toast
        open={toastOpen}
        severity={toastSeverity}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </ToastContext.Provider>
  );
};

// Custom Hook
export const useToast = () => {
  return useContext(ToastContext);
};
