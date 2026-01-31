// src/components/SalesRecordPage/SearchDrawer.jsx
import React, { useState } from "react";
import { Drawer, Box } from "@mui/material";
import SearchWithDropdown from "./SearchWithDropdown";

const SearchDrawer = ({ isOpen, onClose, onSelectItem, itemsList = [] }) => {
  const [clearSearch, setClearSearch] = useState(() => () => {});

  return (
    <Drawer
      anchor="top"
      open={isOpen}
      onClose={() => {
        clearSearch(); // Reset search input when closing
        onClose(); // Close the drawer
      }}
      ModalProps={{ keepMounted: true }}
      sx={{
        "& .MuiDrawer-paper": {
          maxWidth: "600px",
          width: "100%",
          margin: "0 auto",
          top: 0,
          position: "fixed",
          zIndex: 1300,
          borderBottomLeftRadius: "15px",
          borderBottomRightRadius: "15px",
          backgroundColor: "white",
          paddingBottom: "15px",
          paddingTop: "5px",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <SearchWithDropdown
          onSelectItem={onSelectItem}
          itemsList={itemsList}
          setClearSearch={setClearSearch}
        />
      </Box>
    </Drawer>
  );
};

export default SearchDrawer;
