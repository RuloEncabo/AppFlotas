import React, { Fragment, forwardRef, useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup'
import { useForm } from 'react-hook-form';
import ControladorCargaComb from '../formComponents/ControladorCargaComb';
import { ControladorCargaDateV2 } from '../formComponents/ControladorCargaDate';
import ControladorCargaCombo, { ControladorCargaComboAsync } from '../formComponents/ControladorCargaCombo';
import { Alert, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormLabel, Slide, Snackbar, Typography } from '@mui/material';
import ControladorCargaNum from '../formComponents/ControladorCargaNum';
import ErrorDialog from '../ErrorDialog';
import { ConfirmSimpleDialog } from '../ConfirmOptionDialog';
import { rendirHDR } from 'src/services/flota_endpoints/hdr_admin';

function FormRealizarValidacion({selectedRow, open, onClose }) {
  const [apiErrors, setApiErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [observaciones, setObservaciones] = useState('')

  const initialValues = {
    observaciones: "",
  }

  const { handleSubmit, control ,formState: { errors},watch ,reset,setValue} = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(
      yup.object().shape({
        observaciones: yup.string().typeError('Ingrese un valor').notRequired().max(150, 'Maximo 150 caracteres')
      })
    )
  });

  const onSubmit = async(data) => {
    setIsLoading(true)
    setApiErrors([])
    setObservaciones(data.observaciones)

    setOpenConfirmDialog(true)
    setIsLoading(false)
  }

  const handleOnConfirm = async() => {
    try {
      const response = await rendirHDR(selectedRow.HDR.hdr_id, observaciones)
      setSnackbarOpen(true)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSnackbarOpen(false)
      onClose()
      reset(initialValues)

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
        <Snackbar open={snackbarOpen}>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Validación Realizada
        </Alert>
      </Snackbar>

        { apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores de Validación'} />}
        <form onSubmit={handleSubmit(onSubmit)}>
        {openConfirmDialog && <ConfirmSimpleDialog
          open={openConfirmDialog}
          onConfirm={() => {
            handleOnConfirm()
            setOpenConfirmDialog(false)}}
          title={"Confirmar Validación"}
          message={"¿Esta seguro de realizar la validación?, esta operación no se puede revertir"}
          handleClose={() => setOpenConfirmDialog(false)}
        />}

        <DialogTitle>{"Realizar Validación de HDR" }</DialogTitle>
        {selectedRow &&<DialogContent>
          <Box sx={{ display: 'flex',height: 'auto',flexDirection: 'column' , gap: 2,mb:5, borderRadius : "5px",p:2 , p: 1 }}>
          <Typography variant='h4'>ID HOJA DE RUTA: {selectedRow.HDR.hdr_id} </Typography>
          <Typography variant='h4'>CHOFER: {selectedRow.CHOFER}</Typography>
          <Typography variant='h4'>FLOTA: {selectedRow.FLOTA} </Typography>
          <Typography variant='h4'>PATENTE : {selectedRow.PATENTE} </Typography>
          </Box>

          <Box sx={{ display: 'flex',width: '100%',height: 'auto',flexDirection: 'column' , gap: 2, mb: 8 }}>
            <Divider sx={{mb:2, width: '100%' }}/>
            {selectedRow.HDR.hdr_fecha_rendida && <Typography variant='b'>FECHA RENDIDA: {new Date(selectedRow.HDR.hdr_fecha_rendida).toLocaleString( "es-ES" )}</Typography>}
            {selectedRow.HDR.hdr_user_rendida && <Typography variant='b'>USUARIO VERIFICADOR: {selectedRow.HDR.hdr_user_rendida}</Typography>}
            {selectedRow.HDR.hdr_obs_rendida && <Typography variant='b'>OBSERVACIONES: {selectedRow.HDR.hdr_obs_rendida}</Typography>}
          </Box>

          <Box sx={{ display: 'flex',width: '100%',height: 'auto',flexDirection: 'column' , gap: 2, mb: 4 }}>
            <Typography variant='h6'>RESUMEN TOTALES</Typography>
            <Divider sx={{mb:2, width: '100%' }}/>
            <Typography variant='b'>KILOMETROS RECORRIDOS: {selectedRow["TOTAL KM"]}</Typography>
            <Typography variant='b'>LITROS COMB CONSUMIDO: {selectedRow["CONSUMO"]}</Typography>
            <Typography variant='b'>GASTOS GENERALES: $ {selectedRow["TOTAL GASTOS"].toLocaleString('es-AR')} </Typography>
            <Typography variant='b'>
              ADELANTOS: $ {Number(selectedRow["TOTAL VIATICOS"]).toLocaleString('es-AR')}  </Typography>
            <Typography variant='b'>
              VIATICO PLUS: $ {Number(selectedRow["TOTAL VIATICOS PLUS"]).toLocaleString('es-AR')}
            </Typography>
            <Typography variant='b'>
              VIATICO NACIONAL: $ {Number(selectedRow["TOTAL VIATICOS NAC"]).toLocaleString('es-AR')}
            </Typography>
            <Divider sx={{mb:2, width: '100%' }}/>
            <Box sx={{ display: 'flex',width: '100%',flexDirection: 'row-reverse', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
              <Chip
                variant="outlined"
                color= {selectedRow["TOTAL GASTOS"] - selectedRow["TOTAL VIATICOS"] > 0 ? "success" : "error"}
                label={'$'+Math.abs(selectedRow["TOTAL GASTOS"] - selectedRow["TOTAL VIATICOS"]).toLocaleString('es-AR')}>
              </Chip>
              <Typography variant='h4'>
                {selectedRow["TOTAL GASTOS"] - selectedRow["TOTAL VIATICOS"] > 0 ? "ELTA DEBE DEVOLVER : " :" EL CHOFER DEBE PAGAR : " }
              </Typography>
            </Box>
          </Box>

          { !selectedRow.HDR.hdr_rendida &&<Box sx={{ display: 'flex',width: '100%',flexDirection: 'column' , gap: 2, }}>
            <Divider sx={{mb:2, width: '100%' }}/>
            <ControladorCargaComb label={'Observaciones'} name={'observaciones'} type={'text'} multiline={true} control={control} err={errors.observaciones}/>
          </Box>}

        </DialogContent>}
        <DialogActions>
          <Box sx={{ display: 'flex',width: '90%',flexDirection: 'row-reverse', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
            {isLoading ? <Button disabled type="submit" variant="contained" sx={{mt:5 ,width:'130px'}}>Cargando...</Button>
            : <Button type="submit" disabled={ selectedRow?.HDR.hdr_rendida == true} variant="contained" sx={{mt:5 ,width:'130px'}}>Realizar Validación</Button> }
            <Button type="button" variant="outlined" sx={{mt:5 ,width:'130px'}} onClick={onClose}>Cancelar</Button>
          </Box>
        </DialogActions>
      </form>

      </Dialog>
    )

  )
}

export default FormRealizarValidacion
