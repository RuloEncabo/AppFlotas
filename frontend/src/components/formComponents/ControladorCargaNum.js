import React from 'react'
import { FormControl, FormHelperText } from '@mui/material'
import { Controller } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'

const ControladorCargaNum = ({ name, label, control, err, autoFocus, disabled, isDecimal = false }) => {
    const handleNumericChange = (event, onChange) => {
        const value = event.target.value;
        if (isDecimal) {
            // Permitir números decimales con hasta dos decimales
            if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
                onChange(value);
            }
        } else {
            // Permitir solo números enteros
            if (value === "" || /^[0-9]+$/.test(value)) {
                onChange(value);
            }
        }
    };

    return (
        <FormControl fullWidth>
            <Controller
                name={name}
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                    <CustomTextField
                        autoFocus={autoFocus}
                        fullWidth
                        label={label}
                        type={"tel"}
                        value={value === null ? "" : value}
                        onBlur={onBlur}
                        onChange={e => { handleNumericChange(e, onChange) }}
                        error={Boolean(err)}
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

export default ControladorCargaNum;
