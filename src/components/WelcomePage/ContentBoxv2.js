import React from 'react';
import { Box } from '@mui/material';

const ContentBoxv2 = ({ color, height = '400px', items }) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: height,
        background: `linear-gradient(-45deg, ${color} 0%, ${color} 0%, transparent 120%)`,
        borderRadius: '16px',
        position: 'relative', // Establish positioning context
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        textAlign: 'center'
      }}
    >
      {items}
    </Box>
  );
};

export default ContentBoxv2;
