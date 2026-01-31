import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Button, Skeleton, Box, IconButton } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { IMAGE_BASE_URL } from './../config/constants';

const ImageUpload = ({ file, setFile, handleImageSelect, selectedImage }) => {
  const [currentImages, setCurrentImages] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const imageResponse = await axios.get(`${IMAGE_BASE_URL}/images`);
      setCurrentImages(imageResponse.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);  // Update the parent state with the selected file
  };

  const deleteImage = async (imagePath) => {
    try {
      await axios.delete(`${IMAGE_BASE_URL}/images/delete`, { data: { path: imagePath } });
      // Update UI after deletion
      setCurrentImages(currentImages.filter((image) => image.path !== imagePath));
    } catch (error) {
      console.error('Failed to delete image', error);
    }
  };

  const renderImageTree = () => {
    return (
      <Grid container spacing={2}>
        {currentImages.map((node, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Box
              sx={{
                position: 'relative',
                textAlign: 'center',
              }}
            >
              {/* Delete Icon */}
             {false &&  (<IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                }}
                onClick={() => deleteImage(node.path)}
              >
                <DeleteIcon />
              </IconButton>)}

              {/* Image */}
              <img
                src={`${IMAGE_BASE_URL}${node.path}`}
                alt={node.name}
                style={{
                  width: '125px',
                  height: '125px',
                  cursor: 'pointer'
                }}
                onClick={() => handleImageSelect(node.path)}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      {/* File Upload Button and Text Input */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={10}>
          <Button
            variant="text"
            component="label"
            startIcon={<ImageIcon />}
          >
            Click here to upload an image.
            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
          </Button>
          OR
          <Box sx={{ overflowY: 'auto', maxHeight: '1000px', padding: '10px' }}>
            {renderImageTree()}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImageUpload;
