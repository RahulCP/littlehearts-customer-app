// src/components/MenuBar/MobileDrawerMenu.jsx
import React from "react";
import {
  Drawer,
  IconButton,
  Grid,
  Box,
  Typography,
  Divider,
  ButtonBase,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const MobileDrawerMenu = ({ mobileOpen, handleDrawerToggle, menuItems }) => {
  const navigate = useNavigate();

  return (
    <Drawer
      anchor="left"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      sx={{
        "& .MuiDrawer-paper": {
          width: "82%",
          height: "100%",
          backgroundColor: "#fff",
          fontFamily: "Assistant, sans-serif",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #eee",
        }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "Assistant, sans-serif",
          }}
        >
          Shop
        </Typography>

        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Menu list */}
      <Box
        sx={{
          px: 2,
          py: 1,
          overflowY: "auto",
          flexGrow: 1,
        }}
      >
        <Grid container spacing={0}>
          {menuItems.map((item, index) => (
            <Grid item xs={12} key={index}>
              <ButtonBase
                onClick={() => {
                  navigate(item.href);
                  handleDrawerToggle();
                }}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  py: 1.6,
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 500,
                      fontFamily: "Assistant, sans-serif",
                      color: "#111",
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              </ButtonBase>

              {/* Divider between items */}
              {index !== menuItems.length - 1 && (
                <Divider sx={{ my: 0.5 }} />
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Drawer>
  );
};

export default MobileDrawerMenu;
