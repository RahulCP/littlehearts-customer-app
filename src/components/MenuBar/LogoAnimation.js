import React from "react";
import { Box } from "@mui/material";
import illolamLogo from "../../appimages/illolamlogo.png";

const LogoAnimation = () => {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "flex-end",
        gap: { xs: 0.9, sm: 1.15 },
        whiteSpace: "nowrap",
      }}
    >
      <Box
        component="img"
        src={illolamLogo}
        alt="Illolam"
        sx={{
          display: "block",
          width: { xs: 150, sm: 190, md: 240 },
          maxHeight: { xs: 34, sm: 42, md: 52 },
          height: "auto",
          objectFit: "contain",
        }}
      />
      <Box
        component="span"
        sx={{
          mb: { xs: 0.25, sm: 0.45, md: 0.65 },
          color: "#111111",
          fontFamily: "Georgia, serif",
          fontSize: { xs: 15.5, sm: 17.5, md: 19.5 },
          fontWeight: 900,
          lineHeight: 1,
          textDecoration: "underline",
          textDecorationThickness: "1px",
          textUnderlineOffset: "3px",
        }}
      >
        Jewels
      </Box>
    </Box>
  );
};

export default LogoAnimation;
