import React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

const ErrorDialog = ({ errores, onClose , titulo}) => {
  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>{titulo? titulo : "Errores de Validación"}</DialogTitle>
      <DialogContent>
        <ul>
          {errores.map((error, index) => (
            <li key={index}>{` ${error.message}`}</li>
          ))}
        </ul>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ErrorDialog
