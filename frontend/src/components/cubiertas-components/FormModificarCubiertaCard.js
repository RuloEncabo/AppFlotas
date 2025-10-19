import React, { Fragment, forwardRef, useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup'
import { useForm } from 'react-hook-form';
import ControladorCargaComb from '../formComponents/ControladorCargaComb';
import { Alert, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, FormLabel, Slide, Snackbar } from '@mui/material';
import { modificarFlotaCubiertasPorPatente } from 'src/services/flota_endpoints/cubiertas_flota';
import ControladorCargaNum from '../formComponents/ControladorCargaNum';
import ErrorDialog from '../ErrorDialog';
import { ConfirmSimpleDialog } from '../ConfirmOptionDialog';

function FormModificarCubiertaCard({setReload,data: dataCard, open, onClose,patente}) {
  const [apiErrors, setApiErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const initialValues = {
    cub_mm: dataCard.MM,//0,
    cub_presion: dataCard.PRESION,//0,
    cub_observaciones: dataCard.OBSERVACIONES,//"string",
  }

  const { handleSubmit, control,getValues ,formState: { errors ,isSubmitSuccessful},watch ,reset,setValue} = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(
      yup.object().shape({
        cub_mm: yup.number().typeError('Ingrese un número').required('Requerido'),
        cub_presion: yup.number().typeError('Ingrese un número').required('Requerido'),
        cub_observaciones: yup.string().typeError('Requerido').notRequired(),
      })
    )
  });

  const realizarModificacion = async(data) => {
    setIsLoading(true)
    setApiErrors([])
    try {
      await modificarFlotaCubiertasPorPatente(patente,dataCard.POSICION,data.cub_mm,data.cub_presion,data.cub_observaciones)
      setSnackbarOpen(true)
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
              // Si 'errorDetails' no es un array, maneja el caso alternativo
              setApiErrors([{ error: 423, message:"Error inesperado en la validación de datos."}]);
          }
      } else {
          // Manejo de errores que no son de Axios
          console.error("Error en la solicitud que no proviene de una respuesta HTTP:", error.message);
      }
    }

    setIsLoading(false)
  }

  const onSubmit = async (data) => {
    setOpenConfirmDialog(true)
  }

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false)
  }


  return (
    {data: dataCard} &&(
    <Dialog
        open={open}
        keepMounted
        fullWidth={true}
        maxWidth={'sm'}
        aria-describedby="alert-dialog-slide-description"
      >
        <Snackbar open={snackbarOpen} autoHideDuration={3000} /* onClose={() => setSnackbarOpen(false)} */>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Cubierta modificada
        </Alert>
      </Snackbar>

      <ConfirmSimpleDialog
          open={openConfirmDialog}
          onConfirm={async() => {
            if(isSubmitSuccessful){
              await realizarModificacion(getValues())
              setOpenConfirmDialog(false)
              onClose()
            }

          }}
          handleClose={ () => handleCloseConfirmDialog()}
          title={"Modificar Cubierta Flota"}
          message={`Desea modificar la cubierta: ${dataCard.POSICION}?`}
        />

        { apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores de Validación'} />}
        <form onSubmit={handleSubmit(onSubmit)}>



        <DialogTitle>{"Modificar Cubierta Flota"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'inline-flex',width: '100%',flexDirection: 'row' , gap: 2, mb: 4 }}>
          <Card sx={{ p: 8 }}>
        <Box sx={{ display: 'inline-flex',width: '100%',flexDirection: 'row', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
        <Box sx={{ width: '15%'}} ><ControladorCargaNum name="cub_mm" label="MM" control={control} err={errors.cub_mm} /></Box>
        <Box sx={{ width: '10%'}} ><ControladorCargaNum name="cub_presion" label="Presion" control={control} err={errors.cub_presion} /></Box>
        </Box>
        <Box sx={{ display: 'inline-flex',width: '100%',flexDirection: 'row', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
        <ControladorCargaComb name="cub_observaciones" label="Observaciones" control={control} err={errors.cub_observaciones} />
        </Box>

          </Card>
          </Box>
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

export default FormModificarCubiertaCard
