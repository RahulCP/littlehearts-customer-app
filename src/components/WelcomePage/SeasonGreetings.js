import React from "react";
import { Box, Typography } from "@mui/material";
import { FONT_FAMILY } from "../../config/themeConstants";
import { IMAGE_BASE_URL } from "../../config/constants";

const SeasonGreetings = () => (
  <Box
    sx={{
      width: "100%",
      height: { xs: "200px", lg: "350px" },
      backgroundColor: "#fff",
      position: "relative", // Set parent container to relative
      alignItems: "center",
      justifyContent: "center",
      marginTop:{ xs: "-25px", lg: "-33px" },
    }}
  >


<Box
  component="img"
  src={window.innerWidth <= 480 
        ? `${IMAGE_BASE_URL}/images/mobilefinal.png` 
        : `${IMAGE_BASE_URL}/images/finalwelcome.png`}
  alt="Welcome Image"
  sx={{
    position: "absolute",
    top: { xs: "10%" },
    left: { xs: "0%", lg: "0%" },
    width: { xs: "380px", lg: "100%" },
    height: { xs: "100%", lg: "auto" },
  }}
/>

    

  </Box>
);

export default SeasonGreetings;
