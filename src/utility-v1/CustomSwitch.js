import React from 'react';
import { Switch, FormControlLabel } from '@mui/material';

const CustomSwitch = ({ label, checked, onChange, name }) => {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={checked}       // Whether the switch is checked
          onChange={onChange}     // Function to handle switch state changes
          name={name}             // Optional: to identify the switch in forms
          color="primary"         // You can change the color to "secondary", "default", etc.
        />
      }
      label={label}              // Label for the switch
    />
  );
};

export default CustomSwitch;
