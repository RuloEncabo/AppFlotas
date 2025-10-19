import React, { Fragment, useState } from 'react'
import { Alert, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, FormLabel, Slide, Snackbar, Typography } from '@mui/material';
import ErrorDialog from '../ErrorDialog';
import { ConfirmSimpleDialog } from '../ConfirmOptionDialog';
import { DataGrid } from '@mui/x-data-grid';
import { deleteNovFromOT } from 'src/services/flota_endpoints/ot_admin';

function FormEditNovsDialog({setReload,data, open, onClose, eliminarOT,selectedOT }) {
  const [apiErrors, setApiErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selectedTaskID, setSelectedTaskID] = useState(null)
  const [myNovs, setMyNovs] = useState(data)


  const handleOpenConfirmDialog = (itemID) => {
    setSelectedTaskID(itemID)
    setOpenConfirmDialog(true)
  }
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false)
    setSelectedTaskID(null)
    setApiErrors([])
  }

  const handleDeleteTask = async(idNov) => {
    setIsLoading(true)
    try {
      const response = await deleteNovFromOT(idNov)
        setMyNovs(prev => prev.filter(task => task.nov_id !== idNov))
        handleCloseConfirmDialog()

      if (myNovs && myNovs.length === 1) {
        await eliminarOT(selectedOT)
      }

    } catch (error) {
      setApiErrors([{ ...apiErrors, error: 'ERROR DE SERVIDOR', message: error.toString() }]);
      console.log('Error al enviar la data:', error);
    }

    setIsLoading(false)
  }

  const columns = [
    { field: 'nov_id', headerName: 'ID', width: 60 },
    { field: 'nov_fecha', headerName: 'Fecha', width: 100, renderCell: (params)=> <Typography>{new Date(params.row.nov_fecha).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })}</Typography> },
    { field: 'nov_hdr_id', headerName: 'HDR ID', width: 100 },
    { field: 'nov_tractor', headerName: 'Tipo', width: 150, renderCell: (params) => params.row.nov_tractor ? 'TRACTOR' : 'BATEA' },
    { field: 'nov_km_odo', headerName: 'KM ODO', width: 150 },
    { field: 'nov_desc', headerName: 'Descripción', width: 250 },
    { field: 'nov_solucionado', headerName: 'Solucionado', width: 150, renderCell: (params) => params.row.nov_solucionado ? 'SI' : 'NO' },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => handleOpenConfirmDialog(params.row.nov_id)}
        >
          Eliminar
        </Button>
      ),
    },
  ];


  return (
    (myNovs) &&
    <Dialog
        open={open}
        keepMounted
        fullWidth={true}
        maxWidth={'lg'}
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
          title={"Eliminar tarea de la OT"}
          message= { myNovs.length > 1? "¿Desea eliminar esta tarea de la OT?, \n  la tarea volvera a estar pendiente" : "¡Es la ultima tarea! \n  ¿Desea eliminar la OT completa con esta tarea? \n (las novedades volveran a estado pendiente)" }
      />

        { apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores de Validación'} />}
        <Fragment>
        <DialogTitle>{"EDITAR NOVEDADES DE LA OT"}</DialogTitle>
        <DialogContent>
         <Box sx={{ display: 'inline-flex', width: '100%',flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" sx={{mt:5,mb:1}}>TAREAS</Typography>
          <Box height={400} width="100%">
            <DataGrid
              rows={myNovs}
              columns={columns}
              loading={isLoading}
              pageSize={5}
              rowsPerPageOptions={[5]}
              getRowId={(row) => row.nov_id}
            />
          </Box>
        </Box>

        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex',width: '100%',flexDirection: 'row-reverse', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
            <Button type="button" variant="outlined" sx={{mt:5 ,width:'130px'}}
            onClick={() => {
              if(myNovs && myNovs.length != data.length){
                setReload((prev) => !prev);
              }
              onClose();
            }}>
              Cerrar
            </Button>
          </Box>
        </DialogActions>
      </Fragment>
      </Dialog>


  )
}

export default FormEditNovsDialog
