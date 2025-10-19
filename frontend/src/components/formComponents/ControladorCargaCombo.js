import React, { Fragment, useEffect, useState } from 'react';
import { Box, CircularProgress, Dialog, FormControl, FormHelperText } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import CustomAutocomplete from 'src/@core/components/mui/autocomplete';
import CustomTextField from 'src/@core/components/mui/text-field';
import { axiosService } from 'src/services/axios';
import { set } from 'nprogress';
import axios from 'axios';
import ErrorDialog from '../ErrorDialog';
import { ELTA_URL } from 'src/config';

const ControladorCargaCombo = ({
  name,
  control,
  options,
  errors = {},
  label,
  optionValueKey = 'cn_id', // Propiedad clave de las opciones
  optionLabelKey = 'cn_nombre', // Propiedad de la etiqueta de las opciones
}) => {
  return (
    <FormControl sx={{ width: '100%' }}>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onBlur, onChange } }) => (
          <CustomAutocomplete
            sx={{ width: '100%' }}
            options={options}
            value={options.find(option => option[optionValueKey] === value) || null}
            getOptionLabel={option => option[optionLabelKey] || 'Sin valor'}
            onBlur={onBlur}
            error={errors[name] ? Boolean(errors[name]) : undefined}
            onChange={(event, newValue) => {
              onChange(newValue ? newValue[optionValueKey] : null);
              /* //console.log(newValue) */
            }}
            isOptionEqualToValue={(option, value) => option[optionValueKey] === value[optionValueKey]}
            renderInput={params => (
              <div>
                <CustomTextField {...params} label={label} />
                {errors[name] && (
                  <FormHelperText sx={{ color: 'error.main' }}>
                    {errors[name].message}
                  </FormHelperText>
                )}
              </div>
            )}
          />
        )}
      />
    </FormControl>
  );
}

export default ControladorCargaCombo;


export const ControladorCargaComboAsync = ({
  name,
  control,
  errors = {},
  label,
  endpoint,
  onChangeOptional = () => {},
  removeKeys = [], // recive las keys de los elementos que desea filtra
  removeLabels = [], // recive los labels de los elementos que desea filtra
  optionValueKey = 'cn_id', // Propiedad clave de las opciones
  optionLabelKey = 'cn_nombre', // Propiedad de la etiqueta de las opciones
}) => {

  const [options, setOptions] = useState([]);
  const [erroresApi, setErroresApi] = useState([]);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
  const fetchData = async () => {
    setOptions([])

    setLoading(true)
    try {
      const resData =await axiosService.get(`${ELTA_URL}${endpoint}`)
      if (removeKeys.length > 0) {
        resData.data = resData.data.filter(item => !removeKeys.includes(item[optionValueKey]))
      }
      if (removeLabels.length > 0) {
        resData.data = resData.data.filter(item => !removeLabels.includes(item[optionLabelKey]))
      }
      setOptions(resData.data)
    } catch (error) {
      setErroresApi( [...erroresApi, error] )
      console.error('Error traer las categorias de novedades:', error)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
  }, [endpoint] )


  return (
    <Box>
      {erroresApi.length > 0 && <ErrorDialog titulo={'Error al traer ' + label} errores={erroresApi} onClose={() => setErroresApi([])} />}
      <FormControl sx={{ width: '100%' }}>
        <Controller
          name={name}
          control={control}
          render= {loading ? () =>
          <CustomTextField label={label} disabled value={'Cargando...'} fullWidth InputProps={{ endAdornment: <CircularProgress size={20} /> }}/>
          :({ field: { value, onBlur, onChange} }) => {
            return (
              <CustomAutocomplete
                options={options}
                loading={loading}
                value={options.find(option => option[optionValueKey] === value) || null}
                getOptionLabel={option => option[optionLabelKey] || 'Sin valor'}
                onBlur={onBlur}
                error={errors[name] ? Boolean(errors[name]) : undefined}
                onChange={(event,newValue) => {
                  onChange(newValue ? newValue[optionValueKey] : null);
                  onChangeOptional(newValue ? newValue[optionValueKey] : null)
                }}
                isOptionEqualToValue={(option, value) => option[optionValueKey] === value[optionValueKey]}
                sx={{ width: '100%' }}
                renderInput={params => (
                  <div>
                    <CustomTextField {...params}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <Fragment>
                          {loading ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </Fragment>
                      )
                    }}
                    label={label} />
                    {errors[name] && (
                      <FormHelperText sx={{ color: 'error.main' }}>
                        {errors[name].message}
                      </FormHelperText>
                    )}
                  </div>
                )}
              />
            )}}
        />
      </FormControl>
    </Box>
  )
}
