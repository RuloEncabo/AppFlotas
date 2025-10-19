import React from 'react';
import { FormControl, FormHelperText, Switch } from '@mui/material';
import { Controller } from 'react-hook-form';

const ControladorCargaSwitch = ({ name, label, control, err, disabled }) => {
  return (
    <FormControl fullWidth>
      <Controller
        name={name}
        control={control}
        label ={label}
        render={({ field: { onChange,value } }) => (
          <Switch
            checked={value}
            onChange={onChange}
            inputProps={{ 'aria-label': 'controlled' }}
            disabled={disabled}
          />
        )}
      />
      {err && (
        <FormHelperText sx={{ color: 'error.main' }} id=''>
          {err.message}
        </FormHelperText>
      )}
    </FormControl>
  );
}

export default ControladorCargaSwitch;
