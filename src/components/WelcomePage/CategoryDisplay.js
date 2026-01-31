import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import Slider from "react-slick";
import { IMAGE_BASE_URL } from "../../config/constants";
import { FONT_FAMILY } from "../../config/themeConstants";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom"; // Added for navigation


const CategoryDisplay = ({ categories, title }) => {
  const navigate = useNavigate(); // Hook for navigation
  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  const handleNavigation = (path) => {
    navigate(path); // Navigate to the given path
  };
  

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: FONT_FAMILY,
          fontWeight:500,
          fontSize: { xs: "25px", md: "28px" },
          mb: { xs: 1, md: 2 }
        }}
      >
        {title}
      </Typography>

      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Slider {...settings}>
          {categories.map((category, index) => (
              <Box
              onClick={() => handleNavigation(category.href)}
                sx={{
                  position: "relative",
                  width: "150px",
                  height: "200px",
                  margin: "auto",
                  padding: "0px",
                  overflow: "hidden",
                  "&:hover img": {
                    transform: "scale(1.1)",
                    transition: "transform 0.3s ease",
                  },
                }}
              >
                <Box
                  component="img"
                  src={IMAGE_BASE_URL + category.image}
                  alt={category.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    position: "absolute",
                    fontFamily: FONT_FAMILY,
                    color: "#000",
                    fontSize: { xs: "18px", md: "1rem" },
                    bottom: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    bgcolor: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    padding: "5px 10px",
                    borderRadius: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {category.title}
                </Typography>
              </Box>
          ))}
        </Slider>
      </Box>

      <Grid container spacing={3} sx={{ display: { xs: "none", md: "flex" } }}>
        {categories.map((category, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                 onClick={() => handleNavigation(category.href)}
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "350px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  "&:hover img": {
                    transform: "scale(1.1)",
                    transition: "transform 0.3s ease",
                  },
                }}
              >
                <Box
                  component="img"
                  src={IMAGE_BASE_URL + category.image}
                  alt={category.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <Typography
                  sx={{
                    position: "absolute",
                    fontFamily: FONT_FAMILY,
                    color: "#000",
                    fontSize: { xs: "22px", lg: "25px" },
                    bottom: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    bgcolor: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    padding: "5px 10px",
                    borderRadius: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {category.title}
                </Typography>
              </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryDisplay;
