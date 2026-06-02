// src/pages/store/checkout/components/Toast.jsx
import React from "react";
import { Alert, Slide, Snackbar } from "@mui/material";

function SlideDown(props) {
  return <Slide {...props} direction="down" />;
}

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      TransitionComponent={SlideDown}
      transitionDuration={{ enter: 280, exit: 220 }}
      sx={{ zIndex: 9999, mt: { xs: 1.2, md: 2 } }}
    >
      <Alert
        severity="warning"
        variant="filled"
        sx={{
          width: "100%",
          borderRadius: 2,
          fontWeight: 850,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
        }}
      >
        {toast}
      </Alert>
    </Snackbar>
  );
}
