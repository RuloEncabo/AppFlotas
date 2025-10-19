import { Box, Button, Card, CardActions, CardContent, CardHeader, Typography } from '@mui/material'
import React, { Fragment, useState } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import FormAsignarNuevaCubierta from './FormModificarPosicion'
import FormModificarCubiertaCard from './FormModificarCubiertaCard'
import FormRotarCubiertaCard from './FormRotarCubiertaCard'

const CardPosCubierta = ({cubierta, patente, setReload,km_ot,flotaCubiertas,posiciones,isBatea}) => {
  const initialValues = {
    MM: cubierta.MM || 0,
    MODELO: cubierta.MODELO || 0,
    NRO_INTERNO: cubierta.NRO_INTERNO || 0,
    ID_CUBIERTA: cubierta.ID_CUBIERTA || 0,
    OBSERVACION: cubierta.OBSERVACION || 0,
    POSICION: cubierta.POSICION || 0,
    KM_BASE: cubierta.KM_BASE || 0,
    PRESION: cubierta.PRESION || 0,
    SERIE: cubierta.SERIE || 0,
    KM_ROTAR: cubierta.KM_ROTAR || 0,
  }

  const [open , setOpen] = useState(false)
  const [openRotar , setOpenRotar] = useState(false)
  const [openModificar , setOpenModificar] = useState(false)

  return (
    <Fragment>
      <FormRotarCubiertaCard data={initialValues} onClose={() => setOpenRotar(false)} open={openRotar} setReload={setReload} patente={patente} km_ot={km_ot} posiciones={posiciones} flotaCubiertas={flotaCubiertas} isBatea={isBatea}/>
      <FormModificarCubiertaCard data={initialValues} onClose={() => setOpenModificar(false)} open={openModificar} setReload={setReload} patente={patente}/>
      <FormAsignarNuevaCubierta dataCard={initialValues} onClose={() => setOpen(false)} open={open} setReload={setReload} patente={patente} km_ot={km_ot} posicion={initialValues.POSICION} flotaCubiertas={flotaCubiertas}/>
      <Card sx={{  p: 2 , border: initialValues.NRO_INTERNO== 0? '1px solid #EA5455' : '1px solid #ccc'  , height: '250',maxWidth: '250px',width: 'auto'}}>
        <CardHeader title=  {'Posición Número: ' + initialValues.POSICION || ''} />
        { initialValues.NRO_INTERNO != 0
        ?
        <CardContent sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between',gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CustomTextField sx={{mb: 2}} label={'Nro Interno'} disabled value={initialValues.NRO_INTERNO} fullWidth/>
        <CustomTextField sx={{mb: 2}} label={'Serie'} disabled value={initialValues.SERIE} fullWidth/>
        <CustomTextField sx={{mb: 2}} label={'Modelo'} disabled value={initialValues.MODELO} fullWidth/>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CustomTextField sx={{mb: 2}} label={'MM'} disabled value={initialValues.MM} fullWidth/>
        <CustomTextField sx={{mb: 2}} label={'Presión'} disabled value={initialValues.PRESION} fullWidth/>
        <CustomTextField sx={{mb: 2}} label={'Observación'} disabled value={initialValues.OBSERVACION} fullWidth/>
        <CustomTextField sx={{mb: 2}} label={'KM ROTACION'} disabled value={initialValues.KM_ROTAR} fullWidth/>
        </Box>
        </CardContent>
        :
        <Box height={'295px'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <Typography> Sin Cubierta asignada</Typography>
        </Box>
        }
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="outlined" size="small" onClick={() => setOpen(true)}>{ initialValues.NRO_INTERNO ===  0 ? 'Asignar Cubierta' : 'Cambiar Cubierta'}</Button>
          <Button variant="outlined" size="small" disabled={initialValues.NRO_INTERNO === 0} onClick={() => setOpenRotar(true)}>Rotar Cubierta</Button>
          <Button variant="outlined" size="small" disabled={initialValues.NRO_INTERNO === 0} onClick={() => setOpenModificar(true)}>Modificar Cubierta</Button>
        </CardActions>
      </Card>
      </Fragment>
    )
}

export default CardPosCubierta
