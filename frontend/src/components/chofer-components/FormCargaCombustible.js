// ** React Imports
import React, { Fragment, useState, useEffect } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { RadioGroup, FormControlLabel, Radio, Grid, Switch, Box, Typography, FormControl, FormHelperText } from '@mui/material'
import { postCargaHDR, putCargaHDR } from 'src/services/chofer_endpoints/carga'
import { getTiposCombustibles } from 'src/services/chofer_endpoints/combustible'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { useRouter } from 'next/router'
import ControladorCargaComb from '../formComponents/ControladorCargaComb'
import ControladorCargaNum from '../formComponents/ControladorCargaNum'
import { Controller, useForm} from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Map from './map'
import ErrorDialog from '../ErrorDialog'
import { ApiError } from 'next/dist/server/api-utils'
import { getUltimoKmHDR } from 'src/services/chofer_endpoints/movimiento'

const FormCargaCombustible = ({ isOpen, onClose, isCrear, dataUpdate, hdr_id, km, setCC ,listaCombustibles}) => {
  // Inicializar estados con los valores por defecto o los proporcionados en data

  const initialValues = {
    car_hdr_id: dataUpdate?.Carga?.car_hdr_id || hdr_id,
    car_fecha: dataUpdate?.Carga?.car_fecha? new Date(dataUpdate?.Carga?.car_fecha).toISOString() : new Date().toISOString(),
    car_km_odo: dataUpdate?.Carga?.car_km_odo || 0, //km,
    car_lugar: dataUpdate?.Carga?.car_lugar || '',
    car_lt_cargados: dataUpdate?.Carga?.car_lt_cargados || 0,
    car_lt_urea_cargados: dataUpdate?.Carga?.car_lt_urea_cargados || 0,
    car_tanque_lleno: dataUpdate?.Carga?.car_tanque_lleno || false,
    car_ypf: dataUpdate?.Carga?.car_ypf || 'YPF RUTA',
    car_sucursal: dataUpdate?.Carga?.car_sucursal || '',
    car_observaciones: dataUpdate?.Carga?.car_observaciones || '',
    car_tc_id: dataUpdate?.Carga?.car_tc_id || 1,
    car_tanque_lleno_urea: dataUpdate?.Carga?.car_tanque_lleno_urea || false,
    car_lng: dataUpdate?.Carga?.car_lng || 0,
    car_lat: dataUpdate?.Carga?.car_lat || 0
  }
  console.log("DATA UPDATE:", dataUpdate)
  console.log("INITIAL VALUES:", initialValues)


  const [cargaCombustible, setCargaCombustible] = useState(initialValues)
  const [tipoCombustibles, setTipoCombustibles] = useState()
  const [selectedPoint, setSelectedPoint] = useState({ lat: dataUpdate?.Carga?.car_lat || null, lng: dataUpdate?.Carga?.car_lng || null });
  const [errorValidation, setErrorValidation] = useState(false)
  const [openError, setOpenError] = useState(false)
  const [errorApi, setErrorApi] = useState([])
  const [ultimoKmValidar, setKmValidar] = useState(0)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [dataExtra, setDataExtra] = useState();
  const [reloadLastKm, setReloadLastKm] = useState(false);

  const router = useRouter()

  useEffect(()=>{
    if(isCrear){
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
          setSelectedPoint({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        });
      } else {
        alert("Active la localización")
        setSelectedPoint({
          lat: 0,
          lng: 0
        });
      }
    }
  },[])


    // ULTIMO KILOMETRO
    useEffect(() => {
      const fetchData = async () => {
        try {
          const res = await getUltimoKmHDR()
          console.log("EL ULTIMO KILOMETRO ES: ",res);
          setKmValidar(res)
        } catch (error) {
          console.error('ERROR AL TRAER ULTIMO KILOMETRO:', error)
        }
      }
      fetchData()
    }, [reloadLastKm])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resTiposCombustible = await getTiposCombustibles()
        setTipoCombustibles(resTiposCombustible)
        setCargaCombustible(resTiposCombustible.id)
      } catch (error) {
        console.error('Error traer los tipos de combustible:', error)
      }
    }
    fetchData()
  }, [])



  const schema = yup.object().shape({
    car_hdr_id: yup.number(),
    car_km_odo:yup.number().typeError("Ingrese un numero valido").min(km,"No puede ser menor al km actual de la hoja de ruta "+km).required("Este campo es requerido"),
    car_lugar: yup.string().min(4,"Poner un minimo de 4 letras").required("Este campo es requerido"),
    car_lt_cargados: yup.number().min(0,'Debe ser un numero positivo'),
    car_lt_urea_cargados: yup.number("Ingrese un numero valido").min(0,"Debe ser un numero positivo"),
    car_tanque_lleno: yup.bool(),
    car_ypf: yup.string(),
    car_sucursal: yup.string().required("ingrese el nombre de la sucursal"),
    car_observaciones: yup.string(),
    car_tc_id: yup.number().min(1,"seleccione una opcion valida"),
    car_tanque_lleno_urea: yup.bool(),
})

const {
    reset,
    control,
    handleSubmit,
    formState: {errors}
} = useForm({
    mode: 'onChange',
    defaultValues:initialValues,
    resolver: yupResolver(schema)
})


  const handleClose = () => {
    setCargaCombustible()
    reset(),
    onClose()
    setReloadLastKm(!reloadLastKm);
  }

  const handleChange = (field, value) => {
    setCargaCombustible(prevData => ({
      ...prevData,
      [field]: value
    }))
  }
  const handleConfirm = async () => {
    const data = dataExtra
    setOpenConfirmDialog(false); // Cierra el diálogo
    let carga = {};
    if(selectedPoint.lat === 0){
      alert("Por favor, encienda el GPS")
      return
    }
    try {
      if (isCrear) {
        data.car_lat = selectedPoint.lat
        data.car_lng = selectedPoint.lng
        carga = await postCargaHDR(data)
        console.log("Antes de actualizar con setCC:", carga);
        console.log(listaCombustibles)
          if (listaCombustibles.length === 0) {
            setCC([carga]);
          }else{
            setCC((prevData) => [...prevData, carga]);
          }
          handleClose();
      } else {
        data.car_lat = selectedPoint.lat
        data.car_lng = selectedPoint.lng
        carga = await putCargaHDR(dataUpdate.Carga?.car_id, data)
        setCC(
          listaCombustibles.map((carga) =>
            carga.car_id === dataUpdate.Carga?.car_id ? { ...carga, ...data } : carga
          )
        );
        router.reload('/chofer/chofer-combustibles')
      }

    } catch (error) {
        console.log(error);
        if (error.response && error.response.data) {
          console.log(error.response.data.detail);
          setErrorApi([{message:error.response.data.detail}])
          setOpenError(true)
        }
    }

  }

  const onSubmit = async (data) => {
    console.log("LA DATA ES SUBMIT:", data)
    if (data.car_km_odo < ultimoKmValidar) {
      console.log("ENTRE A LA VALIDACION")
      setOpenConfirmDialog(true);
      setDataExtra(data)
      return;
    } else {

    let carga = {};
    if(selectedPoint.lat === 0){
      alert("Por favor, encienda el GPS")
      return
    }
    try {
      if (isCrear) {
        data.car_lat = selectedPoint.lat
        data.car_lng = selectedPoint.lng
        carga = await postCargaHDR(data)
        console.log(listaCombustibles)
          {/*
            if (listaCombustibles.length === 0) {
            setCC([carga]);
          }else{
            setCC((prevData) => [...prevData, carga]);
          }
            */}
          router.reload('/chofer/chofer-combustibles')
        //handleClose();
      } else {
        data.car_lat = selectedPoint.lat
        data.car_lng = selectedPoint.lng
        carga = await putCargaHDR(dataUpdate.Carga?.car_id, data)
        setCC(
          listaCombustibles.map((carga) =>
            carga.car_id === dataUpdate.Carga?.car_id ? { ...carga, ...data } : carga
          )
        );
        router.reload('/chofer/chofer-combustibles')
      }
    } catch (error) {
        console.log(error);
        if (error.response && error.response.data) {
          console.log(error.response.data.detail);
          setErrorApi([{message:error.response.data.detail}])
          setOpenError(true)
        }
      }
    }
  }


  const handleTipoCombustibleChange = (event, newValue,onChange) => {
    event.preventDefault()

    // Verificar si el valor seleccionado está en las opciones válidas
    const isValidOption = tipoCombustibles.some(option => option.tc_id === (newValue ? newValue.tc_id : 0))

    if (isValidOption) {
      handleChange('car_tc_id', newValue ? newValue.tc_id : 0)
      onChange(newValue? newValue.tc_id : 0)
    }
  }

  const handleCloseError = () => {
    setErrorApi([])
  }

  return (
    <Fragment>
            <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>{'Kilometraje Inferior a :  '+ ultimoKmValidar}</DialogTitle>
          <DialogContent>
              El kilometraje ingresado es inferior al último registrado. ¿Deseas continuar?
          </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} autoFocus>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isOpen} onClose={handleClose} aria-labelledby='form-dialog-title'>
{/*       <ErrorDialog onClose={ handleCloseError} errores={errorApi}/> */}
      {errorApi.length > 0 && <ErrorDialog errores={errorApi} onClose={handleCloseError} />}
        {isCrear ? (
          <DialogTitle id='form-dialog-title'>Agregar carga de combustible</DialogTitle>
        ) : (
          <DialogTitle id='form-dialog-title'>Modificar carga de combustible</DialogTitle>
        )}{' '}
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{display:'flex' , flexDirection:'column', gap:'20px'}}>
            <ControladorCargaComb name= 'car_lugar' label="LUGAR" type='text' control={control} err= {errors.car_lugar} autoFocus={true}/>
            <ControladorCargaNum name= 'car_km_odo' label="KILOMETROS" control={control} err= {errors.car_km_odo}/>

            {/*
            <Box sx={{ mt: 5, mb: 3 }}>
              <Map
                setSelectedPoint={setSelectedPoint}
                selectedPoint={selectedPoint}
                />
              {errorValidation && <p style={{ color: 'red' }}>Por favor, seleccione una ubicación</p>}
            </Box>
             */}




            <Typography sx={{ mt: 6, mb: 2 }}>Datos de la carga</Typography>
            <ControladorCargaNum name= 'car_lt_cargados' isDecimal={true} label="LITROS DE COMBUSTIBLE CARGADO" control={control} err= {errors.car_lt_cargados}/>
            <ControladorCargaNum name= 'car_lt_urea_cargados' isDecimal={true} label="LITROS DE UREA CARGADO" control={control} err= {errors.car_lt_urea_cargados}/>
            </Box>

            <Grid component='label' container alignItems='center' spacing={1}>
              <Grid item>
              <FormControl fullWidth>
                <Controller
                  name={"car_tanque_lleno"}
                  control={control}
                  rules={{required:true}}
                  render={({field:{value, onChange, onBlur}}) => (
                  <Switch
                    checked={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                  )}/>
                </FormControl>
              </Grid>
              <Grid item>Tanque lleno combustible?</Grid>
            </Grid>

            <Grid component='label' container alignItems='center' spacing={1}>
              <Grid item>
              <FormControl fullWidth>
                <Controller
                  name={"car_tanque_lleno_urea"}
                  control={control}
                  rules={{required:true}}
                  render={({field:{value, onChange, onBlur}}) => (
                  <Switch
                    checked={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                  )}/>
                </FormControl>
              </Grid>
              <Grid item>Tanque lleno urea?</Grid>
            </Grid>

            <Typography sx={{ mt: 6, mb: 0 }}>Forma de pago</Typography>

            <Box sx={{ paddingX: '20px', mb: 5 }}>
              <FormControl fullWidth>
                <Controller
                   name='car_ypf'
                   control={control}
                   rules={{required:true}}
                   render= {({field:{value, onChange, onBlur}}) => (
                    <RadioGroup
                      value={value}
                      name='rbtn-forma-de-pago'
                      onBlur={onBlur}
                      onChange={e => {onChange(e)}}
                      error={errors.car_ypf ? Boolean(errors.car_ypf) : undefined}
                      aria-label='Seleccione una Forma de pago'
                    >
                      <FormControlLabel value='YPF RUTA' control={<Radio />} label='YPF RUTA' />
                      <FormControlLabel value='CUENTA CORRIENTE' control={<Radio />} label='CUENTA CORRIENTE' />
                      <FormControlLabel value='CONTADO' control={<Radio />} label='CONTADO' />
                      <FormControlLabel value='CLZ' control={<Radio />} label='CLZ' />
                    </RadioGroup>
                    )}
                />
              </FormControl>
              <ControladorCargaComb name= 'car_sucursal' label="INGRESE LA SUCURSAL" type='text' control={control} err= {errors.car_sucursal}/>
            <FormControl>
              <Controller
                  name="car_tc_id"
                  control={control}
                  render={({ field: {value, onBlur,onChange}}) => (
                    <div>
                      <CustomAutocomplete
                        sx={{ width: '100%' }}
                        options={tipoCombustibles}
                        defaultValue={tipoCombustibles.length > 0 && tipoCombustibles[value-1]}
                        getOptionLabel={option => option.tc_nombre || 'Sin valor'}
                        onBlur={onBlur}
                        error={errors.car_tc_id ? Boolean(errors.car_tc_id) : undefined}
                        onChange={(event, newValue) => {handleTipoCombustibleChange(event, newValue,onChange)

                        }}
                        renderInput={params =>
                        (<div>
                          <CustomTextField {...params} label='SELECCIONE EL TIPO DE COMBUSTIBLE' />
                          {errors.car_tc_id && (
                          <FormHelperText sx={{ color: 'error.main' }}>
                            {errors.car_tc_id.message}
                          </FormHelperText>
                        )}
                        </div>)}
                      />
                    </div>
                  )}
              />
            </FormControl>
            </Box>

            <ControladorCargaComb name= 'car_observaciones' label="OBSERVACIONES" type='text' control={control} err= {errors.car_observaciones}/>


          </DialogContent>
          <DialogActions className='dialog-actions-dense'>
            <Button onClick={handleClose}>CANCELAR</Button>
              <Button type='submit'>{isCrear ? "AGREGAR" : "MODIFICAR"}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Fragment>
  )
}

export default FormCargaCombustible
