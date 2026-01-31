import React from "react";
import { Grid, Stack, Typography, Box, Link } from "@mui/material";
import ImageBox from "./ImageBox"; // Adjust path if needed
import { APPIMAGE_BASE_URL } from "../../config/constants";
import { FONT_FAMILY_ABRILA } from "../../config/themeConstants";
import ImageSlider from "./ImageSlider";

const images = [
  "/appimages/vishu.png",
  "/appimages/eid.png",
  "/appimages/easter.png",
];

const Layout_1 = () => {
  return (
    <Grid
      container
      columnSpacing={{ xs: 2, sm: 2 }}
      rowSpacing={2}
      sx={{ mt: 1 }}
    >
      {/* Middle Column */}
      <Grid item xs={12} sm={12} md={6} order={{ xs: 1, md: 2 }}>
        <ImageSlider images={images} interval={4000} />
      </Grid>
      {/* Left Column */}
      <Grid item xs={6} md={3} order={{ xs: 2, md: 1 }}>
        <ImageBox
          image={"/appimages/clearence.png"}
          bgColor="#D6F0FF" // Light blueish background
          height={{
            xs: "200px", // Small devices
            sm: "200px", // Tablets
            md: "400px", // Medium devices
            lg: "400px", // Large devices
          }}
          url="/jewels/list/clearance"
        />
      </Grid>
      {/* Right Column */}
      <Grid item xs={6} md={3} order={{ xs: 3, md: 3 }}>
        <Stack spacing={2}>
          <ImageBox
            image={"/appimages/combo.png"}
            bgColor="#FFF9CC" // Light blueish background
            height={{
              xs: "200px", // Small devices
              sm: "200px", // Tablets
              md: "400px", // Medium devices
              lg: "400px", // Large devices
            }}
            url="/jewels/combooffer"
          />
        </Stack>
      </Grid>
      <Grid item xs={6} md={3} order={{ xs: 4, md: 4 }}>
        <Stack spacing={2}>
          <ImageBox
            image={"/appimages/quality.png"}
            bgColor="#DFFFD6" // Light blueish background
            height={{
              xs: "175px", // Small devices
              sm: "175px", // Tablets
              md: "350px", // Medium devices
              lg: "350px", // Large devices
            }}
          />
        </Stack>
      </Grid>
      <Grid item xs={6} md={3} order={{ xs: 4, md: 4 }}>
        <Stack spacing={2}>
          <ImageBox
            image={"/appimages/ad.png"}
            bgColor="#FFE5CC" // Light blueish background
            height={{
              xs: "175px", // Small devices
              sm: "175px", // Tablets
              md: "350px", // Medium devices
              lg: "350px", // Large devices
            }}
            url="/jewels/list/Adstone"
          />
        </Stack>
      </Grid>
      <Grid item xs={6} md={3} order={{ xs: 4, md: 4 }}>
        <Stack spacing={2}>
          <ImageBox
            image={"/appimages/ear.png"}
            bgColor="#D0F5F5" // Light blueish background
            height={{
              xs: "175px", // Small devices
              sm: "175px", // Tablets
              md: "350px", // Medium devices
              lg: "350px", // Large devices
            }}
            url="/jewels/list/Earrings"
          />
        </Stack>
      </Grid>
      <Grid item xs={6} md={3} order={{ xs: 5, md: 15 }}>
        <Stack spacing={2}>
          <ImageBox
            image={"/appimages/box1.png"}
            bgColor="#E0E0E0" // Light blueish background
            height={{
              xs: "80px", // Small devices
              sm: "83px", // Tablets
              md: "167px", // Medium devices
              lg: "167px", // Large devices
            }}
            url="/jewels/list/Necklace"
          />
          <ImageBox
            image={"/appimages/bangles.png"}
            bgColor="#FAD4E8" // Light blueish background
            height={{
              xs: "80px", // Small devices
              sm: "83px", // Tablets
              md: "167px", // Medium devices
              lg: "167px", // Large devices
            }}
            url="/jewels/list/BB"
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default Layout_1;
