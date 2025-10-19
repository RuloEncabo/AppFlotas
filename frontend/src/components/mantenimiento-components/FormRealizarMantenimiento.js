import React, { Fragment, forwardRef, useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup'
import { useForm } from 'react-hook-form';
import ControladorCargaComb from '../formComponents/ControladorCargaComb';
import { ControladorCargaDateV2 } from '../formComponents/ControladorCargaDate';
import ControladorCargaCombo, { ControladorCargaComboAsync } from '../formComponents/ControladorCargaCombo';
import { Alert, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, FormLabel, Slide, Snackbar, Typography } from '@mui/material';
import { putCubierta } from 'src/services/flota_endpoints/cubiertas_flota';
import ControladorCargaSwitch from '../formComponents/ControladorCargaSwitch';
import ControladorCargaNum from '../formComponents/ControladorCargaNum';
import ErrorDialog from '../ErrorDialog';
import { cambioAceiteFlota, ultCambioAceite } from 'src/services/flota_endpoints/parametros_config';

function FormRealizarMantenimiento({setReload,row_id, open, onClose }) {
  const [apiErrors, setApiErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [dataCambioAnterior,setDataCambioAnterior] = useState(null)
  const id =row_id

  const initialValues = {
    fecha: new Date(),
    km:0,//0,
    tipo_aceite:null,
    taller_id:null,
  }

  const { handleSubmit, control ,formState: { errors },watch ,reset,setValue} = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(
      yup.object().shape({
        fecha: yup.date().typeError('Ingrese una fecha').required('Requerido'),
        km: yup.number().typeError('Ingrese un valor').required('Requerido'),
        tipo_aceite: yup.number().typeError('Ingrese un valor').required('Requerido'),
        taller_id: yup.number().typeError('Ingrese un valor').required('Requerido'),
      })
    )
  });


  //traer informacion del ultimo cambio de aceite get
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setApiErrors([])
      try {
        const response = await ultCambioAceite(id)
        console.log("response", response)
        setDataCambioAnterior(response)
      } catch (error) {
        console.log(error)
        setApiErrors([{ error: error.response.status, message: error.response.data.detail }])
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()

  }, [])

  const onSubmit = async(data) => {
    setIsLoading(true)
    setApiErrors([])
    try {
/*      const fechaModificada = new Date(data.fecha).toISOString().split('T')[0] // todo controlar el formato si sirve
        const dataCopy = { ...data, : fechaDotModificada, cub_fecha_alta: fechaModificada }*/
      const response = await cambioAceiteFlota(id,data['fecha'],data['km'],data['tipo_aceite'],data['taller_id'])
      setSnackbarOpen(true)
      await new Promise(resolve => setTimeout(resolve, 3000));
      setReload(prev => !prev)
      reset(initialValues)
      onClose()

    } catch (error) {
      console.log('Error al enviar la data:', error);

      if (error.response) {
          console.log("Respuesta completa del error:", error.response);
          const errorDetails = error.response.data.detail;
          if (Array.isArray(errorDetails)) {
            let arrayErrores = []
            for (error in errorDetails) {
              arrayErrores = [...arrayErrores,{error:422,message:errorDetails[error].msg}]
            }
            setApiErrors(arrayErrores); // Actualiza el estado con los mensajes de error
          } else {
              // Si 'errorDetails' no es un array, es un detail solo
              setApiErrors([{ error: 423, message:error.response.data.detail}]);
          }
      } else {
          // Manejo de errores que no son de Axios
          console.error("Error en la solicitud que no proviene de una respuesta HTTP:", error.message);
      }
    }

    setIsLoading(false)
  }

  return (
    (
    <Dialog
        open={open}
        keepMounted
        fullWidth={true}
        height = { 300 }
        maxWidth={'xs'}
        aria-describedby="alert-dialog-slide-description"
      >
        <Snackbar open={snackbarOpen} autoHideDuration={3000} /* onClose={() => setSnackbarOpen(false)} */>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Mantenimiento Realizado
        </Alert>
      </Snackbar>

        { apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores de Validación'} />}
        <form onSubmit={handleSubmit(onSubmit)}>

        <DialogTitle>{"Realizar Mantenimiento" }</DialogTitle>
        <DialogContent>
          { dataCambioAnterior != null && dataCambioAnterior["hist_flota_patente"] != null
           ?
          <Box sx={{ display: 'flex',height: 'auto',flexDirection: 'column' , gap: 2,mb:5, borderRadius : "5px",p:2 ,border: "1px solid lightgray", p: 1 }}>
          <Typography variant='b'>Fecha del cambio anterior: {new Date(dataCambioAnterior["hist_aceite_fecha_cambio"]).toLocaleString( "es-ES" )}</Typography>
          <Typography variant='b'>Tipo de aceite: {dataCambioAnterior["hist_tipo_aceite"]} </Typography>
          <Typography variant='b'>Taller: {dataCambioAnterior["hist_taller"]} </Typography>
          <Typography variant='b'>KM en que se realizo: {dataCambioAnterior["hist_aceite_km"]} </Typography>
          <Typography variant='b'>Usuario que lo realizo: {dataCambioAnterior["hist_user_flota"]} </Typography>
          </Box>
          :
          <Typography variant='h6'> No existe mantenimiento previo</Typography>
          }
          <Box sx={{ display: 'flex',width: '100%',minHeight: '300px',height: 'auto',flexDirection: 'column' , gap: 2, mb: 4 }}>
            <Box sx={{ width: '100%'}} ><ControladorCargaDateV2 name="fecha" label="Fecha" control={control} err={errors.fecha} /></Box>
            <Box sx={{ width: '100%'}} ><ControladorCargaNum name="km" label="Kilometraje en el que se realizo" control={control} err={errors.km} /></Box>
            <Box sx={{ width: '100%'}} ><ControladorCargaComboAsync name="tipo_aceite" label="Tipo de aceite" endpoint={'/params/tipo_aceite/'} optionValueKey={'id'} optionLabelKey={'ta_nombre'} control={control} errors={errors} /></Box>
            <Box sx={{ width: '100%'}} ><ControladorCargaComboAsync name="taller_id" label="Seleccione el taller" endpoint={'/params/taller/'} optionValueKey={'id'} optionLabelKey={'taller_nombre'} control={control} errors={errors} removeKeys={[1,2]} /></Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex',width: '90%',flexDirection: 'row-reverse', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
            {isLoading ? <Button disabled type="submit" variant="contained" sx={{mt:5 ,width:'130px'}}>Cargando...</Button> : <Button type="submit" variant="contained" sx={{mt:5 ,width:'130px'}}>Realizar Mantenimiento</Button> }
            <Button type="button" variant="outlined" sx={{mt:5 ,width:'130px'}} onClick={onClose}>Cancelar</Button>
          </Box>
        </DialogActions>
      </form>

      </Dialog>
    )

  )
}

export default FormRealizarMantenimiento
