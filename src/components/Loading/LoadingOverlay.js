import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingOverlay = ({ message = "Your request is processing, please wait..." }) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <CircularProgress color="primary" size={60} thickness={5} />
      <Typography
        variant="h6"
        sx={{ color: "white", marginTop: 2, textAlign: "center", maxWidth: "80%" }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingOverlay;
