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
import { getOTCGeneral, postOTCGeneral, putOTC, putOTCEstado, putOTCGeneral } from 'src/services/flota_endpoints/otc_flota';
import { ConfirmSimpleDialog } from '../ConfirmOptionDialog';
import { h } from '@fullcalendar/core/preact';
import { DataGrid } from '@mui/x-data-grid';

function FormCerrarOTCGeneral({setReload,data, open, onClose }) {
  const [apiErrors, setApiErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [myOtcGen, setMyOtcGen] = useState(null)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selectedTaskID, setSelectedTaskID] = useState(null)

  const initialValues = {
    otc_gen_fecha: new Date(),
    otc_prov_id: 0,
    otc_estado_id: 1,
    otc_gen_obs: '',
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const res = await getOTCGeneral(data)
        setMyOtcGen(res);
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
                setApiErrors([{ error: 423, message: errorDetails}]);
            }
        } else {
            // Manejo de errores que no son de Axios
            console.error("Error en la solicitud que no proviene de una respuesta HTTP:", error.message);
        }
      } finally {
        setIsLoading(false);
        // Prepara los datos para el DataGrid
      }
    }
    fetchData()
  }, []);



  const onSubmit = async() => {
    setIsLoading(true)
    setApiErrors([])
    try {
      if(myOtcGen.OTCS && myOtcGen.OTCS.length === 0) {
        setApiErrors([{ error: 423, message: 'No hay tareas para la OTC. Si lo desea, puede eliminar la OTC completa.'}]);
        setIsLoading(false);
        return;
      }
      const response = await putOTCGeneral(data, 2)
      setSnackbarOpen(true)
      await new Promise(resolve => setTimeout(resolve, 3000));
      setReload(prev => !prev)
      //reset(initialValues)
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
            setApiErrors(arrayErrores);
          } else {
              setApiErrors([{ error: 423, message:"Error inesperado en la validación de datos."}]);
          }
      } else {
          console.error("Error en la solicitud que no proviene de una respuesta HTTP:", error.message);
      }
    }
    setIsLoading(false)
  }

  const handleOpenConfirmDialog = (itemID) => {
    setSelectedTaskID(itemID)
    setOpenConfirmDialog(true)
  }
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false)
    setSelectedTaskID(null)
    setApiErrors([])
  }

  const handleDeleteTask = async(id) => {
    setIsLoading(true)
    if(myOtcGen.OTCS && myOtcGen.OTCS.length === 1) {
      setApiErrors([{ error: 423, message: 'Debe haber al menos una tarea para la OTC. Si lo desea, puede eliminar la OTC completa.'}]);
      setIsLoading(false);
      return;
    }
    // Si la OTC esta en estado "Cerrado", no se puede eliminar

    if(myOtcGen.OTC_GENERAL.ESTADO === "Cerrado") {
      setApiErrors([{ error: 423, message: 'No se puede eliminar una tarea de una OTC cerrada.'}]);
      setIsLoading(false);
      return;
    }


    const response = await putOTCEstado(id, "SIN ASIGNAR")
    if (response) {
      setMyOtcGen(prev => ({ ...prev, OTCS: prev.OTCS.filter(task => task.ID !== id) }))
      handleCloseConfirmDialog()
    }

    setIsLoading(false)
  }

  const columns = [
    { field: 'ID', headerName: 'ID OTC', flex: 1 ,sortable: false},
    { field: 'CUBIERTA', headerName: 'CUB NRO INT', flex: 1 ,sortable: false},
    { field: 'TIPO', headerName: 'TIPO T', flex: 1 ,sortable: false},
    { field: 'TRABAJO', headerName: 'TRABAJO', flex: 1,sortable: false},
    {
      field: 'acciones',
      headerName: 'ACCIONES',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => handleOpenConfirmDialog(params.row.ID)}
        >
          Eliminar
        </Button>
      ),
    },
  ];



  return (
    (!isLoading && myOtcGen && myOtcGen.OTC_GENERAL) &&
    <Dialog
        open={open}
        keepMounted
        fullWidth={true}
        maxWidth={'xl'}
        aria-describedby="alert-dialog-slide-description"
      >
        <Snackbar open={snackbarOpen} autoHideDuration={3000}>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          OTC Cerrada
        </Alert>
      </Snackbar>

      <ConfirmSimpleDialog
          open={openConfirmDialog}
          onConfirm={() => handleDeleteTask(selectedTaskID)}
          handleClose={() => handleCloseConfirmDialog()}
          title={"Eliminar tarea de otc"}
          message={"¿Desea eliminar esta tarea de la OTC?, la tarea volvera a estar pendiente y podra ser asignada a una nueva"}
      />

        { apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores de Validación'} />}
        <Fragment>
        <DialogTitle>{"Cerrar OTC"}</DialogTitle>
        <DialogContent>
        <Box sx={{ display: 'inline-flex', width: '100%', flexDirection: 'column', gap: 2, mb: 4 }}>

          <Box sx={{ display: 'inline-flex', width: '100%', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6">ID: {myOtcGen.OTC_GENERAL.ID}</Typography>
          <Typography variant="h6">FECHA: {myOtcGen.OTC_GENERAL.FECHA ? new Date(myOtcGen.OTC_GENERAL.FECHA).toLocaleDateString() : ''}</Typography>
          <Typography variant="h6">PROVEEDOR: {myOtcGen.OTC_GENERAL.PROVEEDOR}</Typography>
          <Typography variant="h6">DEPOSITO: {myOtcGen.OTC_GENERAL.DEPOSITO}</Typography>
          <Typography variant="h6">ESTADO: {myOtcGen.OTC_GENERAL.ESTADO}</Typography>
          <Typography variant="h6">OBSERVACION: {myOtcGen.OTC_GENERAL.OBSERVACION}</Typography>
          </Box>


          <Typography variant="h4" sx={{mt:5,mb:1}}>TAREAS</Typography>
          {myOtcGen?.OTCS?.length > 0 ? (
            <Box sx={{ width: '100%' , height: '4'}}>
            <DataGrid
              rows={myOtcGen.OTCS}
              autoHeight
              rowHeight={50}
              disableColumnFilter
              disableColumnMenu
              disableColumnSelector
              disableRowSelectionOnClick
              getRowId={(row) => row.ID}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
            />
            </Box>
          ) : (
            <Typography variant="h6" align="center" sx={{ mt: 3 }}>
              No hay tareas disponibles.
            </Typography>
          )}
        </Box>

        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex',width: '90%',flexDirection: 'row-reverse', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
            {isLoading ? <Button disabled type="submit" variant="contained" sx={{mt:5 ,width:'130px'}}>Cargando...</Button>
                       : <Button onClick={()=> onSubmit()} variant="contained" sx={{mt:5 ,width:'130px'}}>Cerrar OTC</Button> }
            <Button type="button" variant="outlined" sx={{mt:5 ,width:'130px'}} onClick={onClose}>Cancelar</Button>
          </Box>
        </DialogActions>
      </Fragment>
      </Dialog>


  )
}

export default FormCerrarOTCGeneral
