// ** React Imports
import React, { Fragment, useState, useEffect } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { Grid, Switch, Box, Typography, FormControl,  InputLabel, Select, MenuItem, FormHelperText, Snackbar, Alert } from '@mui/material'
import { forwardRef } from 'react'
import { postMovimientoHDR, putMovimientoHDR } from 'src/services/chofer_endpoints/movimiento'
import CustomTextField from 'src/@core/components/mui/text-field'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// FORMULARIOS Y VALIDACIONES
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { es, mt } from 'date-fns/locale'
import { MapMov } from './map'
import { getTipoKm } from 'src/services/params/tipo_km'
import ControladorCargaNum from '../formComponents/ControladorCargaNum'
import{ ConfirmCloseMovDialog, ConfirmSimpleDialog } from '../ConfirmOptionDialog'
import ControladorCargaDate, { ControladorCargaDateV2 } from '../formComponents/ControladorCargaDate'
import { addMinutes, format } from 'date-fns'
// Componente para que funcione el picker
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

// EL ULTIMO KM ES EL KM ACTUAL DE LA FLOTA
const FormCargaMovimiento = ({ isOpen, onClose, dataUpdate: dataCerrar, isAgregando, dataHDR , hdr_id , ultimo_km ,movimiento_anterior , movimientos,setMovimientos,setMostrarBoton}) => {
  // Inicializar estados con los valores por defecto o los proporcionados en data

  const initialValues = {
    mov_hdr_id: hdr_id,
    mov_inicio: dataCerrar?.mov_inicio || new Date().toISOString(), // inicio
    mov_fin: dataCerrar?.mov_fin || new Date().toISOString(),
    mov_inicio_real: dataCerrar?.mov_inicio_real || new Date().toISOString(),
    mov_fin_real: dataCerrar?.mov_fin_real || new Date().toISOString(),
    mov_km_odo_inicio: movimiento_anterior ? movimiento_anterior.mov_km_odo_fin : (dataCerrar?.mov_km_odo_inicio || ultimo_km),
    mov_km_odo_fin: 0,
    mov_lugar_inicio: movimiento_anterior ? movimiento_anterior.mov_lugar_fin : (dataCerrar?.mov_lugar_inicio || ''),
    mov_lugar_fin: dataCerrar?.mov_lugar || '',
    mov_lleva_carga: dataCerrar?.mov_lleva_carga || false,
    mov_permanencia: dataCerrar?.mov_permanencia || 0,
    mov_cruce_frontera: dataCerrar?.mov_cruce_frontera || false,
    mov_lat_inicio: movimiento_anterior ? movimiento_anterior.mov_lat_fin : dataCerrar?.mov_lat_inicio || 0,
    mov_lng_inicio: movimiento_anterior ? movimiento_anterior.mov_lng_fin : dataCerrar?.mov_lng_inicio || 0,
    mov_lat_fin: dataCerrar?.mov_lat_fin || 0,
    mov_lng_fin: dataCerrar?.mov_lng_fin || 0,
    mov_tipo_km_id: movimiento_anterior ? movimiento_anterior.mov_tipo_km_id : dataCerrar?.mov_tipo_km_id || 1
   }

  const [cargaMovimiento, setCargaMovimiento] = useState(initialValues)
  const [isOpenConfirm, setIsOpenConfirm] = useState(false)
  const [showPermanenciaInput, setShowPermanenciaInput] = useState(initialValues.mov_permanencia > 0 ? true : false)


  const fechaMinimaHDR = dataHDR && dataHDR.hoja_de_ruta ? new Date(dataHDR.hoja_de_ruta.hdr_carga ) : new Date();
  const fechaMaxima = addMinutes(new Date(), 15);

  useEffect(() => {
    console.log("HDR" , dataHDR)
    setCargaMovimiento(
      initialValues
    )
    reset(initialValues)

  }, [movimiento_anterior, dataCerrar, ultimo_km, isAgregando, hdr_id]);

  const schemeAgregar = yup.object().shape({
    mov_inicio : yup.date().required('RECUERDE MODIFICAR ESTE CAMPO').min(fechaMinimaHDR, `LA FECHA NO PUEDE SER MENOR A LA DE FECHA DE APERTURA DE HDR ${format(fechaMinimaHDR, 'dd/MM/yyyy HH:mm', { locale: es })}`),
    mov_km_odo_inicio: yup
      .number("",'SOLO NUMEROS ENTEROS')
      .integer('SOLO NUMEROS ENTEROS')
      .typeError('INGRESE UN NÚMERO')
      .min(movimiento_anterior?.mov_km_odo_fin-1 || ultimo_km , `DEBE SER MAYOR QUE O IGUAL QUE ${movimiento_anterior?.mov_km_odo_fin || ultimo_km}`) // VALIDO QUE SI EXISTE MOVIMIENTO ANTERIOR, EL MINIMO SERA EL KM FINAL DEL MOV ANTERIOR, DE LO CONTRARIO EL MOV MINIMO SERA EL DEL CAMION
      .max((movimiento_anterior?.mov_km_odo_fin-1 || ultimo_km )+100, `NO PUEDE RECORRER UNA DISTANCIA DE 100 KM DE LA ULTIMA KM RECORRIDA`)
      .required('RECUERDE MODIFICAR ESTE CAMPO'),
    mov_lugar_inicio: yup
      .string()
      .min(3, 'El origen debe tener mas de 3 caracteres')
      .max(60, 'El origen debe tener menos de 60 caracteres')
      .required('RECUERDE MODIFICAR ESTE CAMPO'),
    mov_tipo_km_id: yup.number().min(1,"seleccione una opcion valida"),
  })

  const schemeCerrar = yup.object().shape({
    mov_fin: yup.date().required('RECUERDE MODIFICAR ESTE CAMPO')
      .min(new Date(dataCerrar?.mov_inicio || new Date()), `LA FECHA NO PUEDE SER MENOR A ${format(new Date(dataCerrar?.mov_inicio || new Date()), 'dd/MM/yyyy HH:mm', { locale: es })}`)
      .max(fechaMaxima, `LA FECHA NO PUEDE SER MAYOR A ${format(fechaMaxima, 'dd/MM/yyyy HH:mm', { locale: es })}`),
    mov_km_odo_fin: yup
      .number()
      .integer()
      .typeError('INGRESE UN NÚMEROS ENTEROS')
      .min(cargaMovimiento?.mov_km_odo_inicio || 0, `El km debe ser mayor o igual al inicial: ${cargaMovimiento?.mov_km_odo_inicio || 0}`)
      .max(2000000, 'DEBE SER MENOR QUE 2000000')
      .required('Este campo es requerido'),
    mov_lugar_fin: yup
      .string()
      .min(3, 'El destino debe tener mas de 3 caracteres')
      .max(60, 'El destino debe tener menos de 60 caracteres')
      .required('Este campo es requerido'),
    mov_tipo_km_id: yup.number().min(1,"seleccione una opcion valida"),
    mov_permanencia: showPermanenciaInput==true ?
        yup.number('DEBE SER MAYOR QUE 0')
        .integer().typeError('INGRESE UN NÚMERO')
        .min(1,"DEBE SER MAYOR QUE 0")
        .max(10,"MAXIMO DE 10 DIAS")
        .required('Este campo es requerido') : null,
  })

  const scheme = isAgregando ? schemeAgregar : schemeCerrar

  const [selectedPoint, setSelectedPoint] = useState({
    lat: 0,
    lng: 0
  });


  const [openSnackbar, setOpenSnackbar] = useState(false);


  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };


  const handleClose = () => {
    reset(initialValues)
    setIsOpenConfirm(false)
    setShowPermanenciaInput(false)
    onClose()
  }


  useEffect(()=>{
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
          setSelectedPoint({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        });
      } else {
        alert("Active la localización");
        setSelectedPoint({
          lat: 0,
          lng: 0
        });
      }
  },[])

  // funcion para solo numeros enteros
  const handleKeyDown = e => {
    const key = e.key || e.code
    if (key === 'Backspace' || key === 'Delete') {
      return
    }
    if (!(key >= '0' && key <= '9')) {
      e.preventDefault()
    }
  }

  const {
    control,
    reset,
    handleSubmit,
    resetField,
    formState: { errors }
  } = useForm({ defaultValues: initialValues, mode: 'onChange', resolver: yupResolver(scheme) ,})

  const handleChange = (field, value) => {
    setCargaMovimiento(prevData => ({
      ...prevData,
      [field]: value
    }))
  }

  const handleChangeBool = (field, value) => {
    setCargaMovimiento(prevData => ({
      ...prevData,
      [field]: value
    }))
  }

  const handleChangeNumeric = (field, value) => {
    const numericValue = value !== null && value !== '' ? parseFloat(value) : null

    setCargaMovimiento(prevData => ({
      ...prevData,
      [field]: numericValue
    }))
  }

  const onSubmit = async (data) => {
    if(!isAgregando){
      setCargaMovimiento(prevData => ({
        ...prevData,
        mov_fin: new Date(data.mov_fin).toISOString(),
        mov_fin_real: data.mov_fin_real,
        mov_permanencia: data.mov_permanencia
      }))
      setIsOpenConfirm(true)
    }else{
      try {
      if (isAgregando) {
        const dataAgregar = {
          mov_hdr_id: cargaMovimiento.mov_hdr_id,
          mov_inicio: data.mov_inicio,
          mov_inicio_real: cargaMovimiento.mov_inicio_real,
          mov_km_odo_inicio: data.mov_km_odo_inicio || cargaMovimiento.mov_km_odo_inicio,
          mov_lugar_inicio: cargaMovimiento.mov_lugar_inicio,
          mov_lleva_carga: cargaMovimiento.mov_lleva_carga,
          mov_permanencia: cargaMovimiento.mov_permanencia,
          mov_cruce_frontera: cargaMovimiento.mov_cruce_frontera,
          mov_lat_inicio: selectedPoint.lat,
          mov_lng_inicio: selectedPoint.lng,
          mov_lat_fin: null,
          mov_lng_fin: null,
          mov_tipo_km_id: cargaMovimiento.mov_tipo_km_id
        }
        const res= await postMovimientoHDR(dataAgregar)

        setMovimientos(prevMovimientos => [res,...prevMovimientos]);
        setMostrarBoton(false)

        handleClose()
      }
    } catch (error) {
      console.log(error)
      handleClose()
    }
    }
  }

  const handleConfirmDialog = async() => {

    // validar que la fecha de inicio sea menor a la de fin
    if (cargaMovimiento.mov_fin < cargaMovimiento.mov_inicio) {
      handleCloseConfirm();
      setOpenSnackbar(true);
      return;
    }


    try {
      console.log("cargaMovimiento",cargaMovimiento)
      const dataActualizar = {
        mov_inicio: cargaMovimiento.mov_inicio,
        mov_inicio_real: cargaMovimiento.mov_inicio_real,
        mov_lugar_inicio: cargaMovimiento.mov_lugar_inicio,
        mov_km_odo_inicio: cargaMovimiento.mov_km_odo_inicio,
        mov_hdr_id: cargaMovimiento.mov_hdr_id,
        mov_fin: cargaMovimiento.mov_fin,
        mov_fin_real: cargaMovimiento.mov_fin_real,
        mov_km_odo_fin: cargaMovimiento.mov_km_odo_fin,
        mov_lugar_fin: cargaMovimiento.mov_lugar_fin,
        mov_lleva_carga: cargaMovimiento.mov_lleva_carga,
        mov_permanencia: cargaMovimiento.mov_permanencia,
        mov_cruce_frontera: cargaMovimiento.mov_cruce_frontera,
        mov_lat_inicio: cargaMovimiento.mov_lat_inicio ? cargaMovimiento.mov_lat_inicio: 0,
        mov_lng_inicio: cargaMovimiento.mov_lng_inicio ? cargaMovimiento.mov_lng_inicio: 0,
        mov_lng_fin: selectedPoint.lng,
        mov_lat_fin: selectedPoint.lat,
        mov_tipo_km_id: cargaMovimiento.mov_tipo_km_id
      }
      console.log("Lo que se envia es:",dataActualizar)

      const res = await putMovimientoHDR(dataCerrar.mov_id, dataActualizar)
      setMovimientos(movimientos.map(movimiento =>
        movimiento.mov_id === dataCerrar.mov_id ? { ...movimiento, ...dataActualizar } : movimiento
      ));
      setMostrarBoton(true)
      handleClose()
    } catch (error) {
      console.error('Error al actualizar el movimiento:', error)
      handleClose()
    }

  }

  const [tipoKilometros, setTipoKilometros] = useState()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resTiposKilometro = await getTipoKm()
        setTipoKilometros(resTiposKilometro)
        handleChange('mov_tipo_km_id', resTiposKilometro[cargaMovimiento.mov_tipo_km_id-1].tk_id)
      } catch (error) {
        console.error('Error al traer los tipos de kilometros:', error)
      }
    }
    fetchData()
  }, [])



  const handleTipoKMChange = (event, newValue,onChange) => {
    event.preventDefault()
    console.log(event.target.value)

    // Verificar si el valor seleccionado está en las opciones válidas
    const isValidOption = tipoKilometros.some(option => option.tk_id === (event.target.value ? event.target.value : 0))

    if (isValidOption) {
      handleChange('mov_tipo_km_id', event.target.value)
      onChange(event.target.value)
    }
  }


  const handleCloseConfirm = () => {
    setIsOpenConfirm(false)
  }



  const handleShowPermanenciaInputChange = () => {
      //setValue("mov_permanencia", 0)
      resetField('mov_permanencia')
    setShowPermanenciaInput(!showPermanenciaInput)
  }

  return (
    <Fragment>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        aria-labelledby='form-dialog-title'
        maxWidth='md'
        fullWidth={true}
      >
        {isAgregando ? (
          <DialogTitle id='form-dialog-title'>Agregar Movimiento</DialogTitle>
        ) : (
          <DialogTitle id='form-dialog-title'>Modificar Movimiento</DialogTitle>
        )}{' '}
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
            >
              <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                La fecha final debe ser mayor a la de inicio
              </Alert>
            </Snackbar>
            <ConfirmCloseMovDialog
              open={isOpenConfirm}
              handleClose={handleCloseConfirm}
              onConfirm={handleConfirmDialog}
              iconName={"tabler:box"}
              nameButton={"Finalizar movimiento"}
              title="¿Deseas finalizar el movimiento?"
              movInicio={cargaMovimiento?.mov_km_odo_inicio}
              movFin={cargaMovimiento?.mov_km_odo_fin}
            />
            <Typography autoFocus variant='h5'>
              Datos de salida
            </Typography>

            {/*isAgregando ?(
              <Typography variant='h5' sx={{mt:5}}>Selecciona el punto de inicio del movimiento</Typography>
            ):
              <Typography variant='h5' sx={{mt:5}}>Selecciona el punto de final del movimiento</Typography>
            */}
            {/*
            <Box sx={{ mt: 5, mb: 3 }}>
              <Controller
                  name='selectedPoint'
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <MapMov
                      setSelectedPoint={setSelectedPoint}
                      selectedPoint={{lat:cargaMovimiento?.mov_lat_inicio || -34.6037, lng:cargaMovimiento?.mov_lng_inicio || 6.2443}}
                      />
                  )}
                />
            </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' ,mb:7,mt:8}}>
                <Box sx={{ width: 30,height: 30,backgroundColor: 'red',borderRadius: '50%',display: 'inline-block',}}/>
                <Typography variant='h5'>Punto Actual</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' ,mb:10}}>
                <Box sx={{ width: 30,height: 30,backgroundColor: 'green',borderRadius: '50%',display: 'inline-block',}}/>
                <Typography variant='h5'>Punto Anterior</Typography>
              </Box>
              */}
            <Controller
              name='mov_lugar_inicio'
              control={control}
              render={({ field: { onChange,onBlur,value } }) => (
                <CustomTextField
                  id='lugar-salida'
                  fullWidth
                  type='text'
                  required
                  onBlur = {onBlur}
                  label='El lugar de salida'
                  sx={{ mt: 1, mb: 1 }}
                  onChange={e => {
                    handleChange('mov_lugar_inicio', e.target.value)
                    onChange(e)
                  }}
                  value={value}
                  disabled={!isAgregando}
                  error={Boolean(errors.mov_lugar_inicio)}
                  {...(errors.mov_lugar_inicio && { helperText: errors.mov_lugar_inicio.message })}
                />
              )}
            />
            <ControladorCargaNum name='mov_km_odo_inicio' label='KM actual del odometro' control={control} err = {errors.mov_km_odo_inicio} autoFocus={false} disabled={!isAgregando}/>

            <Box sx={{ mt: 5, mb: 1 }}>
              <ControladorCargaDate name='mov_inicio' label='Fecha y hora de salida' control={control} err = {errors.mov_inicio} autoFocus={false} disabled={!isAgregando}/>
            </Box>
            <Typography variant='h5' mt={5}>Datos de llegada</Typography>

            <Controller
              name='mov_lugar_fin'
              control={control}
              render={({ field: { onChange } }) => (
                <CustomTextField
                  sx={{ mt: 1, mb: 1 }}
                  id='lugar-llegada'
                  fullWidth
                  type='text'
                  label='El lugar de llegada'
                  onChange={e => {
                    handleChange('mov_lugar_fin', e.target.value)
                    onChange(e)
                  }}
                  value={cargaMovimiento?.mov_lugar_fin || ''}
                  disabled={isAgregando}
                  error={!!errors.mov_lugar_fin}
                  helperText={errors.mov_lugar_fin?.message}
                />
              )}
            />
            <Controller
              name='mov_km_odo_fin'
              control={control}
              render={({ field: { onChange } }) => (
                <CustomTextField
                  id='kmActual-llegada'
                  fullWidth
                  type='text'
                  label='ingrese KM actual del odometro'
                  onKeyDown={handleKeyDown}
                  value={cargaMovimiento?.mov_km_odo_fin || 0}
                  onChange={e => {
                    handleChangeNumeric('mov_km_odo_fin', e.target.value)
                    onChange(e)
                  }}
                  disabled={isAgregando}
                  sx={{ mt: 1, mb: 1 }}
                  error={!!errors.mov_km_odo_fin}
                  helperText={errors.mov_km_odo_fin?.message}
                />
              )}
            />
               <Box sx={{ mt: 5, mb: 1 }}>
              <ControladorCargaDate name='mov_fin' label='Fecha y hora de llegada' control={control} err = {errors.mov_fin} autoFocus={false} disabled={isAgregando}/>
              {/* <Controller
                name='mov_fin'
                control={control}
                render={({ field: { onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      showTimeSelect
                      timeFormat='HH:mm'
                      timeIntervals={15}
                      selected={dataCerrar ? new Date(cargaMovimiento?.mov_fin) : null}
                      id='fecha-hora-llegada'
                      dateFormat='dd/MM/yyyy h:mm aa'
                      popperPlacement={'top-start'}
                      locale={es}
                      disabled={isAgregando}
                      onChange={date => {
                        onChange(date)
                        handleChange('mov_fin', date.toISOString())
                      }}
                      customInput={<PickersComponent label='Fecha y Hora de llegada' inputProps={{ readOnly: true }} />}
                      error={!!errors.mov_fin}
                      helperText={errors.mov_fin?.message}
                    />
                  </DatePickerWrapper>
                )}
              /> */}
            </Box>

            <Box sx={{display:"flex", flexDirection:"column", mt:5,ml:5}}>
              <Typography variant='p' >Permanencia?</Typography>
              <Switch
                checked={showPermanenciaInput}
                onChange={() => handleShowPermanenciaInputChange()}
                inputProps={{ 'aria-label': 'controlled' }}
                disabled={dataCerrar? false:true}
                sx={{mt:4}}
              />
              <ControladorCargaNum
                  name='mov_permanencia'
                  label='Tiempo de permanencia (dias)'
                  control={control}
                  err = {errors.mov_permanencia}
                  autoFocus={false}
                  disabled={!showPermanenciaInput}
              />

            </Box>
            <Box sx={{display:"flex", flexDirection:"column", mt:5,ml:5}}>
            <Typography variant='p' >LLeva autos?</Typography>
            <Switch
                checked={cargaMovimiento?.mov_lleva_carga || false}
                onChange={() => handleChangeBool('mov_lleva_carga', !cargaMovimiento?.mov_lleva_carga || false)}
                inputProps={{ 'aria-label': 'controlled' }}
                disabled={dataCerrar? true : false}
              />
            </Box>

            <Box sx={{display:"flex", flexDirection:"column", mt:5,ml:5}}>
            <Typography variant='p'>Cruce frontera?</Typography>
              <Switch
                checked={cargaMovimiento?.mov_cruce_frontera || false}
                onChange={() => handleChangeBool('mov_cruce_frontera', !cargaMovimiento?.mov_cruce_frontera || false)}
                inputProps={{ 'aria-label': 'controlled' }}
                disabled={dataCerrar? true : false || (dataHDR.hoja_de_ruta.hdr_destino_id == 1)}
              />
            </Box>
            {/* ------------SWITCHES-------------------------------------------------- */}
            <Grid component='label' direction='column' container alignItems='left' spacing={1} sx={{ pl: 5, mt: 5 }}>
              <Grid item>
              <FormControl fullWidth error={Boolean(errors.mov_tipo_km_id)}>
                <InputLabel>SELECCIONE EL TIPO DE KILOMETRO</InputLabel>
                <Controller
                  name="mov_tipo_km_id"
                  control={control}
                  render={({ field: { value, onBlur, onChange } }) => (
                    <Select
                      disabled = {!isAgregando}
                      label="SELECCIONE EL TIPO DE KILOMETRO"
                      value={cargaMovimiento?.mov_tipo_km_id || 1}
                      defaultValue={cargaMovimiento?.mov_tipo_km_id || 1}
                      onBlur={onBlur}
                      onChange={(event, newValue) => {handleTipoKMChange(event, newValue,onChange)
                      }}
                    >
                      {tipoKilometros.map((tipoKm) => (
                        <MenuItem key={tipoKm.tk_id} value={tipoKm.tk_id}>
                          {tipoKm.tk_nombre || 'Sin valor'}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.mov_tipo_km_id && (
                  <FormHelperText>{errors.mov_tipo_km_id.message}</FormHelperText>
                )}
              </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions className='dialog-actions-dense'>
            <Button onClick={handleClose}>CANCELAR</Button>
              <Button type='submit'>{isAgregando? "INICIAR MOVIMIENTO" : "CERRAR MOVIMIENTO"}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Fragment>
  )
}

export default FormCargaMovimiento

