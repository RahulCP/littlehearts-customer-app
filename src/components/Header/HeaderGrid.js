import React, { useState } from "react";
import { Grid, Typography, IconButton, Alert } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { FONT_FAMILY } from "../../config/themeConstants";


const HeaderGrid = ({
  pathArray,
  allItems,
  availableCoupons,
  content,
  additionalContent,
  coupons = [],
}) => {

  const HEADER_TEXT = (() => {
    if (pathArray[0] === "jewels" && pathArray[1] === "list") {
      const matchedItem = allItems.find(
        (item) => item.inventoryid === pathArray[3]
      );
      if (matchedItem) return matchedItem.label;
      switch (pathArray[2]) {
        case "All":
          return "All Items";
        case "Necklace":
          return "Necklace Collection";
        case "BB":
          return "Bracelet and Bangles";
        case "Haarams":
          return "Haarams Collection";
        case "Earrings":
          return "Earrings Collection";
        case "Adstone":
          return "Adstone Collection";
        case "holiday":
          return "Holiday Sale";
        case "clearance":
          return "Clearance Sale";
        default:
          return "";
      }
    } else if (pathArray[1] === "bag") return "Your Cart";

    return "";
  })();

  return (
    <>
      <Grid
        container
        alignItems="center"
        sx={{ height: { xs: "auto", md: "auto" }, rowGap: 1 }}
      >
        {/* Shipping Notice */}
       {false && <Grid item xs={12}>
          <Alert
            severity="info"
            variant="outlined"
            icon={<InfoOutlinedIcon />}

            sx={{
              borderRadius: 2,
              fontFamily: FONT_FAMILY,
              fontSize: "15px",
              backgroundColor: "#fffde7", // very light yellow
              border: "1px solid #fdd835", // matching yellow border
              color: "#333",
              "& .MuiAlert-icon": {
                color: "#fbc02d", // darker yellow icon
              },
              "& .MuiAlert-message": { width: "100%" },
            }}
          >
            All orders placed between <strong>Nov 20, 2025</strong> and{" "}
            <strong>Nov 24, 2025</strong> will be dispatched on{" "}
            <strong>Nov 25, 2025</strong> only.
          </Alert>
        </Grid>}

        {/* Header */}
        <Grid item xs={10}>
          <Typography
            sx={{
              fontFamily: FONT_FAMILY,
              color: "#000",
              fontSize: { xs: "22px", lg: "24px" },
               marginTop: "10px",
              fontWeight: 500,
            }}
          >
            {HEADER_TEXT}
          </Typography>
        </Grid>
        <Grid item xs={2} textAlign="right">
          {additionalContent}
          {false && (
            <IconButton
              color="primary"
              onClick={() => setCouponDrawerOpen(true)}
              sx={{ ml: 1 }}
            >
              <LocalOfferIcon />
            </IconButton>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default HeaderGrid;
