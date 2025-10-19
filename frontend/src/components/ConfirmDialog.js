import { Fragment, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import IconifyIcon from 'src/@core/components/icon'

const DialogConfirmation = ({ message, title, onConfirm,iconName,nameButton ,id}) => {
  // ** State
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm( id ? id : null);
    }
    setOpen(false);
  };

  return (
    <Fragment>
      <Button variant='contained' fullWidth onClick={handleClickOpen} startIcon={<IconifyIcon icon={iconName?iconName:"tabler:trash"} width={20} height={20} />}>
        {nameButton || "Eliminar"}
      </Button>
      <Dialog
        open={open}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
      >
        <DialogTitle id='alert-dialog-title'>{title || "Titulo Default"}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            {message || "Mensaje Default"}
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleConfirm} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default DialogConfirmation;
