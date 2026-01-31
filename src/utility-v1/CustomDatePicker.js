import React from 'react';
import { TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/en-gb'; // Import the 'en-gb' locale for dd/MM/yyyy format

// Extend dayjs with the localized format plugin
dayjs.extend(localizedFormat);

const CustomDatePicker = ({ label, name, value, onChange, error = false, helperText = '', ...props }) => {
  const handleDateChange = (newDate) => {
    // Ensure newDate is valid and pass formatted date back to parent
    if (newDate && dayjs(newDate).isValid()) {
      onChange({ target: { name, value: dayjs(newDate).format('YYYY-MM-DD') } });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null}
        onChange={handleDateChange} // Use the new handleDateChange function
        inputFormat="DD/MM/YYYY"  // Ensure the date input format is dd/MM/yyyy
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}               // Add name prop to TextField
            error={error}             // Show error state if needed
            helperText={error ? helperText : ''}  // Conditionally show helper text on error
          />
        )}
        {...props}  // Spread any additional props (like minDate, maxDate, etc.)
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;
