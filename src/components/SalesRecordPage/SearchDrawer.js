// src/components/SalesRecordPage/SearchDrawer.jsx
import React, { useState } from "react";
import { Drawer, Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchWithDropdown from "./SearchWithDropdown";

const SearchDrawer = ({ isOpen, onClose, onSelectItem, itemsList = [] }) => {
  const [clearSearch, setClearSearch] = useState(() => () => {});
  const handleClose = () => {
    clearSearch();
    onClose();
  };

  return (
    <Drawer
      anchor="top"
      open={isOpen}
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        "& .MuiDrawer-paper": {
          maxWidth: { xs: "100%", sm: "680px" },
          width: "100%",
          margin: "0 auto",
          top: 0,
          position: "fixed",
          zIndex: 1300,
          borderBottomLeftRadius: { xs: 18, sm: 22 },
          borderBottomRightRadius: { xs: 18, sm: 22 },
          backgroundColor: "#fff",
          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.22)",
          p: { xs: 1.3, sm: 2 },
          overflow: "visible",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 950, fontSize: 18, lineHeight: 1.1 }}>
            Search store
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 12.5 }}>
            Find items by name or category
          </Typography>
        </Box>
        <IconButton onClick={handleClose} aria-label="Close search" sx={{ bgcolor: "#f8fafc" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <SearchWithDropdown
          onSelectItem={onSelectItem}
          itemsList={itemsList}
          setClearSearch={setClearSearch}
          mobileDrawer
        />
      </Box>
    </Drawer>
  );
};

export default SearchDrawer;
