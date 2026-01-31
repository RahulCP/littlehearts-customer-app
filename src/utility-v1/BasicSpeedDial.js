import * as React from 'react';
import { SpeedDial, SpeedDialAction, Box } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';

export default function BasicSpeedDial({ onButtonOneClick, onButtonTwoClick }) {
  const actions = [
    { icon: <Edit sx={{ color: 'black' }} />, name: 'Print', action: onButtonOneClick }, // Action icon in black
    { icon: <Delete sx={{ color: 'black' }} />, name: 'Share', action: onButtonTwoClick } // Action icon in black
  ];

  return (
    <Box sx={{ height: 10, transform: 'translateZ(0px)', flexGrow: 1 }}>
      <SpeedDial
        ariaLabel="SpeedDial example"
        direction="left" // This will make the actions open toward the left
        sx={{
          position: 'absolute',
          bottom: -5,
          right: -5,
          backgroundColor: 'transparent',
          '& .MuiFab-root': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'transparent'
            }
          },
          '& .MuiSpeedDialIcon-icon': {
            color: 'grey' // Main Edit icon color to black
          }
        }}
        icon={<Edit sx={{ color: 'black' }} />} // Main Edit icon is black
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
            sx={{
              backgroundColor: 'white', // White background for SpeedDialAction
              margin: 0.5, 
              '&:hover': {
                backgroundColor: 'white', // Keep the white background on hover
              },
              '& .MuiSvgIcon-root': {
                color: 'green' // Black color for the icons inside SpeedDialAction
              }
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}
