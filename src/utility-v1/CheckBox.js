import React, { useState } from 'react';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

const CheckBox = ({ label, checked, onChange }) => {
  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={onChange} />}
        label={label}
      />
    </FormGroup>
  );
};

export default CheckBox;
