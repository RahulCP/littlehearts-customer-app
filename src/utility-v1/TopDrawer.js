import React, { useState } from "react";
import { Drawer, Box, Button, Typography } from "@mui/material";

const TopDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setIsOpen(open);
  };

  return (
    <>
      <Button variant="contained" onClick={toggleDrawer(true)}>
        Open Top Drawer
      </Button>
      <Drawer
        anchor="top"
        open={isOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: { height: "50vh" }, // Adjust height as needed
        }}
      >
        <Box
          sx={{
            padding: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">This is a top drawer</Typography>
          <Typography variant="body1">You can put content here.</Typography>
          <Button onClick={toggleDrawer(false)} variant="outlined" sx={{ mt: 2 }}>
            Close Drawer
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default TopDrawer;
