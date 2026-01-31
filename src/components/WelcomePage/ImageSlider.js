import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { APPIMAGE_BASE_URL } from "../../config/constants";

const ImageSlider = ({ images = [], interval = 4000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        maxWidth: "800px",
        height: {
          xs: "200px",  // Small devices
          sm: "400px",  // Tablets
          md: "400px",  // Medium devices
          lg: "400px",  // Large devices
        },
        margin: "auto",
        borderRadius: "20px",
        boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: `${images.length * 100}%`,
          transform: `translateX(-${currentIndex * (100 / images.length)}%)`,
          transition: "transform 1s ease-in-out",
        }}
      >
        {images.map((img, index) => (
          <Box
            key={index}
            component="img"
            src={`${APPIMAGE_BASE_URL}${img}`}
            alt={`Slide ${index}`}
            sx={{
              width: `${100 / images.length}%`,
              height: {
                xs: "200px",
                sm: "400px",
                md: "400px",
                lg: "450px",
              },
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ImageSlider;
