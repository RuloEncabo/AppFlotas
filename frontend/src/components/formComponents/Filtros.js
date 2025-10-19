import React, { Fragment, forwardRef, useEffect, useState } from 'react';
import { Box, CircularProgress, Dialog, FormControl, FormControlLabel, FormHelperText, Switch } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import CustomAutocomplete from 'src/@core/components/mui/autocomplete';
import CustomTextField from 'src/@core/components/mui/text-field';
import { axiosService } from 'src/services/axios';
import { set } from 'nprogress';
import axios from 'axios';
import ErrorDialog from '../ErrorDialog';
import { ELTA_URL } from 'src/config';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import ReactDatePicker from 'react-datepicker';
import { es } from 'date-fns/locale';
import { format, parse } from 'date-fns';



const FiltroTablaDesplegable = ({
  name,
  setValue,
  value,
  errors = {},
  label,
  endpoint,
  optionValueKey = 'cn_id',
  optionLabelKey = 'cn_nombre',
}) => {
  const [options, setOptions] = useState([]);
  const [erroresApi, setErroresApi] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resData = await axiosService.get(`${ELTA_URL}${endpoint}`);
        setOptions(resData.data);
      } catch (error) {
        setErroresApi(prevErrores => [...prevErrores, error]);
        console.error('Error al traer las categorías de novedades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return (
    <Box>
      {erroresApi.length > 0 && (
        <ErrorDialog titulo={'Error al traer ' + label} errores={erroresApi} onClose={() => setErroresApi([])} />
      )}
      {loading ? (
        <CustomTextField
          label={label}
          disabled
          value="Cargando..."
          fullWidth
          InputProps={{ endAdornment: <CircularProgress size={20} /> }}
        />
      ) : (
        <CustomAutocomplete
          options={options}
          fullWidth
          loading={loading}
          value={options.find(option => option[optionValueKey] === value) || null}
          getOptionLabel={option => option[optionLabelKey] || 'Sin valor'}
          onChange={(event, newValue) => {
            setValue(newValue ? newValue[optionValueKey] : null);
          }}
          isOptionEqualToValue={(option, value) => option[optionValueKey] === value}
          renderInput={params => (
            <div>
              <CustomTextField {...params}
                label={label}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <Fragment>
                      {loading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </Fragment>
                  )
                }}
              />
              {errors[name] && (
                <FormHelperText sx={{ color: 'error.main' }}>
                  {errors[name].message}
                </FormHelperText>
              )}
            </div>
          )}
        />
      )}
    </Box>
  );
}

export default FiltroTablaDesplegable;



const formatearFecha = (fecha) => {
  if (!fecha) return null;
  return format(fecha, 'dd-MM-yyyy');
};

export const FiltroFecha = ({ setValue, label, value, mostrarTiempo = false, dateFormat = "dd-MM-yyyy", timeFormat = "HH:mm" }) => {

  const handleFechaChange = (date) => {
    console.log("LA FECHA ES: ", date);
    if(date != null) {
    setValue(formatearFecha(date));
    } else {
      setValue(
        ""
      );
    }
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const parsedDate = parse(dateString, 'dd-MM-yyyy', new Date());
    return isNaN(parsedDate) ? null : parsedDate;
  };

  return (
    <DatePickerWrapper>
          <ReactDatePicker
            selected={parseDate(value)}
            onChange={handleFechaChange}
            locale={es}
            isClearable
            customInput={<PickersComponent label={label} />}
            showTimeSelect={mostrarTiempo}
            timeFormat={timeFormat}
            timeIntervals={15}
            dateFormat={ dateFormat}
          />
        </DatePickerWrapper>
  )
}

const PickersComponent = forwardRef(({ ...props }, ref) => {
  const { label, readOnly } = props

  return (
    <CustomTextField
      {...props}
      inputRef={ref}
      label={label || ''}
      {...(readOnly && { inputProps: { readOnly: true } })}
    />
  )
})



export const FiltroNombre = ({ setValue, label, value, debounceDelay = 500 }) => {
  const [internalValue, setInternalValue] = useState(value);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setValue(internalValue);
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [internalValue, debounceDelay, setValue]);

  return (
    <CustomTextField
      label={label}
      value={internalValue}
      onChange={(event) => setInternalValue(event.target.value)}
    />
  );
};


export const FiltroCheckbox = ({ setValue, label, value }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <FormControlLabel
      control={<Switch checked={value} onChange={(event) => setValue(event.target.checked)} />}
      label={label}
    />
    </Box>
  );
}
