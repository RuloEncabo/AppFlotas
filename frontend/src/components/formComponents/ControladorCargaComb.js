import React from 'react'
import { FormControl, FormHelperText } from '@mui/material'
import { Controller } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'

const ControladorCargaComb = ({name,label,type,control,err,autoFocus,multiline,rows,disabled}) => {
    return (
        <FormControl fullWidth>
            <Controller
                name={name}
                control={control}
                rules={{required:true}}
                render={({field:{value, onChange, onBlur}}) => (
                    <CustomTextField
                        autoFocus={autoFocus}
                        fullWidth
                        label={label}
                        type={type}
                        value={value}
                        multiline= {multiline}
                        rows={rows}
                        onBlur={onBlur}
                        onChange={e => {onChange(e)}}
                        error={Boolean(err)}
                        disabled = {disabled}
                        />
                )}
            />
            {err && (
                <FormHelperText sx={{color: 'error.main'}} id=''>
                    {err.message}
                </FormHelperText>
            )}
        </FormControl>
     );
}

export default ControladorCargaComb;

