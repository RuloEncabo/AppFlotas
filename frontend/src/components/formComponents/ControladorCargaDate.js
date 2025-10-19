import React, { forwardRef } from 'react'
import { FormControl, FormHelperText } from '@mui/material'
import { Controller } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import ReactDatePicker from 'react-datepicker';

// Componente para que funcione el picker
const PickersComponent = forwardRef(({ ...props }, ref) => {
  const { label, readOnly } = props

  return (
    <CustomTextField
    fullWidth
      {...props}
      inputRef={ref}
      label={label || ''}
      {...(readOnly && { inputProps: { readOnly: true } })}
    />
  )
})

const ControladorCargaDate = ({name,label,control,err,autoFocus,disabled}) => {
    return (
        <FormControl fullWidth>
            <Controller
                name={name}
                label={label}
                fullWidth
                control={control}
                disabled={disabled}
                autoFocus={autoFocus}
                rules={{required:true}}
                render={({ field: { onChange ,value} }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={value?new Date(value) : new Date()}
                      onChange={onChange}
                      locale={es}
                      customInput={<PickersComponent label={label} />}
                      disabled={disabled}
                      fullWidth
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy h:mm aa"
                    />
                  </DatePickerWrapper>
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

export default ControladorCargaDate;

// Componente para que funcione el picker
export const ControladorCargaDateV2 = ({name,label,control,err,autoFocus,disabled,required}) => {
/*   const formatearFecha = (fecha) => {
    if (fecha == "") {
      return null;
    }
    const dateObject = new Date(fecha);
    const formattedDate = dateObject.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' }).replace(/\//g, '-');

    return formattedDate;
  }; */

/*   const handleStartDateChange = (date) => {
    const fechaFormatted = new Date(date).toLocaleDateString();
    setStartDate(fechaFormatted);
  }; */

  return (
    <FormControl fullWidth>
      <Controller
        name={name}
        label={label}
        fullWidth
        control={control}
        disabled={disabled}
        autoFocus={autoFocus}
        rules={{required:required}}
        render={({ field: { onChange ,value} }) => (
          <DatePickerWrapper>
          <ReactDatePicker
            selected={value?new Date(value) : new Date()}
            onChange={onChange}//{(date) =>{onChange(date)}}
            locale={es}
            customInput={<PickersComponent label={label} />}
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy"
            showTimeSelect={false}
          />
        </DatePickerWrapper>
        )}
      />
      {err && (
            <FormHelperText sx={{color: 'error.main'}} id=''>
                {err.message}
            </FormHelperText>
        )}
    </FormControl>

  )
}
