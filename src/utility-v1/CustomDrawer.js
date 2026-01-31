import React from 'react';
import { Drawer, useMediaQuery, useTheme } from '@mui/material';

const CustomDrawer = ({ anchor = 'left', renderContent, isOpen, toggleDrawer, width = 350 }) => {
  const theme = useTheme();
  
  // Use media queries to determine the screen size
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // For mobile screens
  const isLargeDisplay = useMediaQuery(theme.breakpoints.up('lg')); // For large displays

  // Adjust drawer width based on screen size
  const drawerWidth = isMobile ? 250 : isLargeDisplay ? 750 : width;

  return (
    <Drawer
      anchor={anchor}  // Anchor can be left, right, top, bottom
      open={isOpen}
      onClose={toggleDrawer(false)} // Close drawer on external clicks or Esc key
    >
      <div
        role="presentation"
        style={{ width: drawerWidth, padding: '0px' }}
      >
        {/* Render content passed from parent */}
        {renderContent && renderContent()}
      </div>
    </Drawer>
  );
};

export default CustomDrawer;
