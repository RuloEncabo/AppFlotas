import { Fragment, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import IconifyIcon from 'src/@core/components/icon'
import { Badge, Chip, MenuItem, Select, Typography } from '@mui/material'
import FiltroTablaDesplegable, { FiltroFecha } from './formComponents/Filtros'
import { Box } from '@mui/system'

const ConfirmOptionDialog = ({ message, title, onConfirm,iconName,nameButton,listOptions,id}) => {
  // ** State
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(listOptions[0]); // Estado para manejar el valor seleccionado
  const [fechaNuevoProgramada, setFechaNuevoProgramada] = useState();

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(id,selectedValue,fechaNuevoProgramada);
    }
    setOpen(false);
  };

  return (
    <Fragment>
      <Button variant='contained' fullWidth onClick={handleClickOpen} startIcon={<IconifyIcon icon={iconName?iconName:"tabler:edit"} width={20} height={20} />}>
        {nameButton || "Editar"}
      </Button>
      <Dialog
        open={open}
        sx={{ '& .MuiDialog-paper': { display:"flex",flexDirection:"column",alignContent:"start",justifyContent:"start",width: '100%', height :"auto",minHeight:selectedValue === "CERRADO" ? 300 : 500 } }}
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
        <DialogContent sx={{ display:"flex",flexDirection:"column",justifyContent:"start" }}>
          <DialogContentText id='alert-dialog-description'>
            {message || "Mensaje Default"}
          </DialogContentText>
        <Select
          labelId='demo-simple-select-label'
          id='demo-simple-select'
          variant='outlined'
          value={selectedValue}
          sx={{ width: 300 ,mx:"auto",mb:4,mt:2}}
          onChange={(e) => setSelectedValue(e.target.value)}
        >
            {listOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          {!(selectedValue === "CERRADO") &&
          <Box sx={{mx:"auto"}}>
          <FiltroFecha  label={"Fecha Reprogramacion"} setValue={setFechaNuevoProgramada} value={fechaNuevoProgramada} mostrarTiempo={false} dateFormat='dd-MM-yyyy'/>
          </Box>
          }

          {(selectedValue === "CERRADO") &&
          <Box sx={{mx:"auto"}}>
          <FiltroFecha  label={"Fecha Reprogramacion"} setValue={setFechaNuevoProgramada} value={fechaNuevoProgramada} mostrarTiempo={false} dateFormat='dd-MM-yyyy'/>
          </Box>
          }
         {/*
            <Box sx={{ height: '20px' }} />

            <FormLabel> Datos de la factura:</FormLabel>
            <Box sx={{ height: '20px' }} />

            <ControladorCargaNum
              control={control}
              //type={'text'}
              name='ot_nr_factura'
              label='Numero de Factura'
              err={errors.ot_nr_factura}
            />
                        <Box sx={{ height: '20px' }} />

            <ControladorCargaNum
              control={control}
              name='ot_monto'
              label='Monto de la Factura'
              err={errors.ot_monto}
            />
            <Box sx={{ height: '20px' }} />

            <ControladorCargaFotos control={control} name='ot_fotos' label='Fotos' errors={errors}/>
            <Divider sx={{ mt: '20px' ,mb: '20px'}} />
             {otTipoTaller=="Externo" &&
            <Box>
              <FormLabel>Datos del proveedor</FormLabel>
              <Box sx={{ height: '20px' }} />
              <ControladorCargaComboAsync control={control} name='ot_proveedor' label='Proveedor' endpoint='/params/proveedores/' optionValueKey='id' optionLabelKey='prov_razon_social' errors={errors} />
              <Box sx={{ height: '20px' }} />
            </Box>
            }

            */}
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

export default ConfirmOptionDialog;


export const ConfirmSimpleDialog = ({ open, handleClose, onConfirm, title, message }) => {
  const messageLines = message.split('\n').map((line, index) => (
    <Fragment key={index}>
      {line}
      <br />
    </Fragment>
  ));

  return (
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
          {messageLines}
        </DialogContentText>
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={onConfirm} autoFocus>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};



export const ConfirmCloseMovDialog = ({ open, handleClose, onConfirm, title, movInicio, movFin }) => {
  const diferencia = movFin - movInicio;

  return (
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
        <Typography variant="body1">
          Al finalizar el movimiento no podrás modificarlo
        </Typography>
        <Typography variant="body1" style={{ marginTop: '16px' }}>
          Km inicial: {movInicio}
        </Typography>
        <Typography variant="body1">
          Km final: {movFin}
        </Typography>
        <Chip
          label={`KM RECORRIDOS: ${diferencia}`}
          color= "error"
          variant="filled"
          style={{ marginTop: '16px', fontSize: '1.5rem' }}
        >
        </Chip>
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={onConfirm} autoFocus>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};




export const ConfirmOptionDialogList = ({ message, title, onConfirm, id ,iconName,nameButton,endpoint,key_name,value_table}) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(); // Estado para manejar el valor seleccionado

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(id,selectedValue);
    }
    setOpen(false);
  };

  return (
    <Fragment>
      <Button variant='contained' fullWidth onClick={handleClickOpen} startIcon={<IconifyIcon icon={iconName?iconName:"tabler:edit"} width={20} height={20} />}>
        {nameButton || "Editar"}
      </Button>
      <Dialog
        open={open}
        sx={{ '& .MuiDialog-paper': { display:"flex",flexDirection:"column",alignContent:"start",justifyContent:"start",width: '100%', height :"auto",minHeight: 300  } }}
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
        <DialogContent sx={{ display:"flex",flexDirection:"column",justifyContent:"start" }}>
          <DialogContentText id='alert-dialog-description'>
            {message || "Mensaje Default"}
          </DialogContentText>
          <FiltroTablaDesplegable label={""} setValue={setSelectedValue} value={selectedValue} endpoint={endpoint} optionValueKey={key_name} optionLabelKey={value_table}/>

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
