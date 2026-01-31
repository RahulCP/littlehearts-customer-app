import React from 'react';
import { Box } from '@mui/material';
import { APPIMAGE_BASE_URL } from "../../config/constants";

const ImageBox = ({ image, bgColor = '#eee', height = '400px', url = '' }) => {
  const handleClick = () => {
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        width: '100%',
        height: height,
        background: bgColor,
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: url ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: url ? 'scale(1.01)' : 'none',
        },
      }}
    >
      <Box
        component="img"
        src={`${APPIMAGE_BASE_URL}${image}`}
        alt="content"
        sx={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
      />
    </Box>
  );
};

export default ImageBox;
