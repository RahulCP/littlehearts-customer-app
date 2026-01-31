import React from 'react';
import { Box, Typography } from '@mui/material';

const Header = ({ mainHeader, subHeader }) => {
  return (
    <Box sx={{ flexGrow: 1, mb: 4 }}> {/* Added margin-bottom (mb) for space after the header */}
      {/* Main Header */}
      <Typography variant="h5" component="h1">
        {mainHeader}
      </Typography>

      {/* Sub Header */}
      {subHeader && (
        <Typography variant="subtitle1" component="h2" sx={{ opacity: 0.8 }}>
          {subHeader}
        </Typography>
      )}
    </Box>
  );
};

export default Header;
