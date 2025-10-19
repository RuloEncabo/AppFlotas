import React, { Fragment, forwardRef, useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup'
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, Card, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, RadioGroup, Slide, Snackbar } from '@mui/material';
import { putCubierta } from 'src/services/flota_endpoints/cubiertas_flota';
import { updateHDR } from 'src/services/chofer_endpoints/hdr';
import { ELTA_URL } from 'src/config';
import { ControladorCargaComboAsync } from 'src/components/formComponents/ControladorCargaCombo';
import ControladorCargaSwitch from 'src/components/formComponents/ControladorCargaSwitch';
import { useRouter } from 'next/router';
import ErrorDialog from 'src/components/ErrorDialog';

function FormModificarHDR({data, open, onClose}) {
  const [apiErrors, setApiErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const id = data.hdr_id
  const router = useRouter();


  const initialValues = {
    hdr_flota_id: data.hdr_flota_id,
    hdr_batea_id: data.hdr_batea_id,
    hdr_destino_id: data.hdr_destino_id,
    hdr_comentarios: data.hdr_comentarios,
    hdr_tanque_lleno: data.hdr_tanque_lleno,
    hdr_tanque_lleno_urea: data.hdr_tanque_lleno_urea,
  }
  console.log('Initial hdr_batea_id:', initialValues.hdr_batea_id);

  const { handleSubmit, control ,formState: { errors },watch ,reset} = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(
      yup.object().shape({
        hdr_flota_id: yup.number().typeError('Debe seleccionar una flota').integer().required().min(1, 'Seleccione una flota'),
        hdr_batea_id: yup.number().typeError('Debe seleccionar una batea').integer(),
        hdr_destino_id: yup.number().typeError('Debe seleccionar un destino').integer().required('Seleccione un destino').min(1, 'Seleccione un destino valido'),
        hdr_comentarios: yup.string().typeError('Ingrese un comentario'),
        hdr_tanque_lleno: yup.boolean().typeError('Ingrese un valor'),
        hdr_tanque_lleno_urea: yup.boolean().typeError('Ingrese un valor'),
      })
    )
  });



  const onSubmit = async(data) => {
    setIsLoading(true)
    setApiErrors([])
    try {
      const response = await updateHDR(id,data)
      setSnackbarOpen(true)
      await new Promise(resolve => setTimeout(resolve, 3000));
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
              // Si 'errorDetails' no es un array, maneja el caso alternativo
              setApiErrors([{ error: 423, message:error.response.data.detail}]);
          }
      } else {
          // Manejo de errores que no son de Axios
          console.error("Error en la solicitud que no proviene de una respuesta HTTP:", error.message);
      }
    }finally{
      setIsLoading(false)
      //router.reload()
    }

    setIsLoading(false)
  }

 console.log(data)

  return (
    {data} &&(
    <Dialog
        open={open}
        keepMounted
        fullWidth={true}
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
          Hdr modificada
        </Alert>
      </Snackbar>

        { apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores de Validación'} />}
        <form onSubmit={handleSubmit(onSubmit)}>

        <DialogTitle>{"Modificar HDR"}</DialogTitle>
        <DialogContent>
          <Card sx={{ p: 8 }}>
        <Box sx={{ display: 'inline-flex',width: '100%',flexDirection: 'column' , gap: 2, mb: 4 }}>
          <Box sx={{ width: '100%'}}><ControladorCargaComboAsync name="hdr_flota_id" label="Seleccione Flota"  endpoint="/params/flota/" optionLabelKey='flo_nombre' optionValueKey='flo_id' control={control} errors={errors} /> </Box>
          <Box sx={{ width: '100%'}}><ControladorCargaComboAsync name="hdr_batea_id" label="Seleccione Batea"  endpoint="/params/batea/" optionLabelKey='bat_nombre' optionValueKey='bat_id' control={control} errors={errors} /> </Box>
          <Box sx={{ width: '100%'}}><ControladorCargaComboAsync name="hdr_destino_id" label="Seleccione Destino"  endpoint="/params/destino/" optionLabelKey='des_nombre' optionValueKey='des_id' control={control} errors={errors} /></Box>
          <Box sx={{ width: '100%'}} >TANQUE LLENO COMBUSTIBLE<ControladorCargaSwitch name="hdr_tanque_lleno" label="Tanque Lleno Combustible" control={control} err={errors.hdr_tanque_lleno} /></Box>
          <Box sx={{ width: '100%'}} > TANQUE LLENO UREA<ControladorCargaSwitch name="hdr_tanque_lleno_urea" label="Tanque Lleno Urea" control={control} err={errors.hdr_tanque_lleno_urea} /></Box>
        </Box>
          </Card>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex',width: '90%',flexDirection: 'row-reverse', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
            {isLoading ? <Button disabled type="submit" variant="contained" sx={{mt:5 ,width:'130px'}}>Cargando...</Button> : <Button type="submit" variant="contained" sx={{mt:5 ,width:'130px'}}>Modificar</Button> }
            <Button type="button" variant="outlined" sx={{mt:5 ,width:'130px'}} onClick={onClose}>Cancelar</Button>
          </Box>
        </DialogActions>
      </form>

      </Dialog>
    )

  )
}

export default FormModificarHDR
