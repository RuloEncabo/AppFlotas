import React, { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  MenuItem,
  Select,
  Snackbar
} from '@mui/material'
import { rotarFlotaCubiertasPorPatente } from 'src/services/flota_endpoints/cubiertas_flota'
import ErrorDialog from '../ErrorDialog'
import { ConfirmSimpleDialog } from '../ConfirmOptionDialog'

function FormRotarCubiertaCard({
  setReload,
  data: dataCard,
  patente,
  open,
  onClose,
  flotaCubiertas,
  posiciones,
  km_ot,
  isBatea
}) {
  const [apiErrors, setApiErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [posicion2, setPosicion2] = useState(1)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const realizarRotacion = async () => {
    setIsLoading(true)
    setApiErrors([])

    // si las cubiertas son iguales retorna errror
    if (dataCard.ID_CUBIERTA === posiciones[posicion2 - 1].ID_CUBIERTA) {
      setApiErrors([{ error: 422, message: 'Las cubiertas son iguales.' }])
      setIsLoading(false)
      return
    }

    // si la segunda cubierta esta vacia retorna error
    if (posiciones[posicion2 - 1].ID_CUBIERTA === 0) {
      setApiErrors([{ error: 422, message: 'La segunda cubierta no esta cargada.' }])
      setIsLoading(false)
      return
    }

    if (posicion2 === null) {
      setApiErrors([{ error: 422, message: 'Debe seleccionar una posicion.' }])
      setIsLoading(false)
      return
    }

    const dataEnviar = {
      fc_id: flotaCubiertas.fc_id,
      cub_id_1: dataCard.ID_CUBIERTA,
      cub_pos_1: dataCard.POSICION,
      km_base_1: dataCard.KM_BASE,
      cub_id_2: posiciones[posicion2 - 1].ID_CUBIERTA,
      cub_pos_2: posiciones[posicion2 - 1].POSICION,
      km_base_2: posiciones[posicion2 - 1].KM_BASE,
      km_ot: km_ot
    }

    console.log(posiciones)

    console.log('DATA ENVIAR', dataEnviar)
    try {
      await rotarFlotaCubiertasPorPatente(dataEnviar)
      setSnackbarOpen(true)
      setReload(prev => !prev)
      onClose()
    } catch (error) {
      console.log('Error al enviar la data:', error)
      if (error.response) {
        console.log('Respuesta completa del error:', error.response)
        const errorDetails = error.response.data.detail
        if (Array.isArray(errorDetails)) {
          let arrayErrores = []
          for (error in errorDetails) {
            arrayErrores = [...arrayErrores, { error: 422, message: errorDetails[error].msg }]
          }
          setApiErrors(arrayErrores) // Actualiza el estado con los mensajes de error
        } else {
          // Si 'errorDetails' no es un array, maneja el caso alternativo
          setApiErrors([{ error: 423, message: 'Error inesperado al rotar una cubierta.' }])
        }
      } else {
        // Manejo de errores que no son de Axios
        console.error('Error en la solicitud que no proviene de una respuesta HTTP:', error.message)
      }
    }
    setIsLoading(false)
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setOpenConfirmDialog(true)
  }

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false)
  }
  return (
    { data: dataCard } && (
      <Dialog
        open={open}
        keepMounted
        fullWidth={true}
        maxWidth={'xs'}
        aria-describedby='alert-dialog-slide-description'
      >
        <Snackbar open={snackbarOpen} autoHideDuration={3000}>
          <Alert onClose={() => setSnackbarOpen(false)} severity='success' variant='filled' sx={{ width: '100%' }}>
            Cubierta Rotada
          </Alert>
        </Snackbar>

        {apiErrors.length > 0 && (
          <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores de Validación'} />
        )}

        <ConfirmSimpleDialog
          open={openConfirmDialog}
          onConfirm={async() => { await realizarRotacion()
            setOpenConfirmDialog(false)
          }}
          handleClose={ () => handleCloseConfirmDialog()}
          title={"Rotar Cubierta"}
          message={`Desea rotar la cubierta ${dataCard.POSICION} por la cubierta de la posicion ${posicion2}?`}
        />
        <form onSubmit={onSubmit}>
          <DialogTitle>{'Rotar Cubierta Flota'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'inline-flex', width: '100%', flexDirection: 'row', gap: 2, mb: 4 }}>
              <Card
                sx={{
                  p: 8,
                  width: '100%',
                  alignContent: 'center',
                  gap: 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  display: 'flex'
                }}
              >
                <FormLabel>Posicion a intercambiar</FormLabel>
                <Select value={posicion2 || 1} onChange={e => setPosicion2(e.target.value)}>
                  {!isBatea && // muestro la posicion 1 a la 8
                    posiciones.map(
                      posicion =>
                        posicion.POSICION <= 6 && (
                          <MenuItem key={posicion.POSICION} value={posicion.POSICION}>
                            {posicion.POSICION}
                          </MenuItem>
                        )
                    )}
                  {isBatea && // muestro la posicion 9 a la 17
                    posiciones.map(
                      posicion =>
                        posicion.POSICION > 6 && (
                          <MenuItem key={posicion.POSICION} value={posicion.POSICION}>
                            {posicion.POSICION}
                          </MenuItem>
                        )
                    )}
                </Select>
              </Card>
            </Box>
          </DialogContent>
          <DialogActions>
            <Box sx={{ display: 'flex', width: '90%', flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 2, mb: 4 }}>
              {isLoading ? (
                <Button disabled type='submit' variant='contained' sx={{ mt: 5, width: '130px' }}>
                  Cargando...
                </Button>
              ) : (
                <Button type='submit' variant='contained' sx={{ mt: 5, width: '130px' }}>
                  Modificar
                </Button>
              )}
              <Button type='button' variant='outlined' sx={{ mt: 5, width: '130px' }} onClick={onClose}>
                Cancelar
              </Button>
            </Box>
          </DialogActions>
        </form>
      </Dialog>
    )
  )
}

export default FormRotarCubiertaCard
