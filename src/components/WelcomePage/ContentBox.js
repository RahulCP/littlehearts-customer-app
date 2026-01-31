import React from 'react';
import { Box } from '@mui/material';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';

const ContentBox = ({ height = '400px' }) => {
  const items = [
    { 
      image: "https://via.placeholder.com/800x400/FF5733/FFFFFF?text=Slide+1"
    },
    { 
      image: "https://via.placeholder.com/800x400/33FF57/FFFFFF?text=Slide+2"
    },
    { 
      image: "https://via.placeholder.com/800x400/3357FF/FFFFFF?text=Slide+3"
    }
  ];

  return (
    <Box
      sx={{
        width: '100%',
        height: height,
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <AliceCarousel
        autoPlay
        autoPlayInterval={3000}
        infinite
        disableButtonsControls
        disableDotsControls
        items={items.map((item, index) => (
          <Box
            key={index}
            component="img"
            src={item.image}
            alt={`Slide ${index + 1}`}
            sx={{
              width: "100%",
              height: height,
              objectFit: "cover",
            }}
          />
        ))}
      />
    </Box>
  );
};

export default ContentBox;
