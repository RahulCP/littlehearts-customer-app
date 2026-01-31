import React from "react";
import { Box, Grid } from "@mui/material";
import Layout_1 from "./Layout_1";
import CategoryDisplay from "./CategoryDisplay";

const WelcomePage = () => {
  const categories = [
    {
      title: "Necklace",
      image: "/images/illolam_399.jpg",
      href: "/jewels/list/Necklace",
    },
    {
      title: "Haarams",
      image: "/images/illolam_433.jpg",
      href: "/jewels/list/Haarams",
    },
    {
      title: "Earrings",
      image: "/images/illolam_399.jpg",
      href: "/jewels/list/Earrings",
    },
  ];

  const specials = [
    {
      title: "Clearance Sale",
      image: "/images/illolam_433.jpg",
      href: "/jewels/list/clearance",
    },
    {
      title: "Combo Offers",
      image: "/images/illolam_433.jpg",
      href: "/jewels/combooffer",
    },
    {
      title: "Holiday Sale",
      image: "/images/illolam_433.jpg",
      href: "/jewels/list/holiday",
    },
  ];

  return (
    <Box>
      {/* Welcome Message Box - Full Width */}
      <Grid container rowSpacing={4}>
        {/* Season Greetings and Layout */}
        <Grid item xs={12}>
          {false && <SeasonGreetings />}
          <Layout_1 />
        </Grid>

        {/* Specials Section */}
        {false && (
          <Grid item xs={12} sx={{ mt: { xs: 3, md: 4 } }}>
            <CategoryDisplay categories={specials} title={"Specials"} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default WelcomePage;
