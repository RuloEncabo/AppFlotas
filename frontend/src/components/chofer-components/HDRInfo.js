import React, { Fragment, useState } from 'react'
import { Accordion, AccordionSummary, AccordionDetails, Box, Grid, TextField, Typography, Button, Card, FormLabel, Divider } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useRouter } from 'next/router'
import FormModificarHDR from 'src/views/pages/chofer-views/FormModificarHDR'

const DetallesHojaRuta = ({actualData}) => {
  //router
  const router = useRouter()

  const [data, setData] = useState(actualData)

  // estados para mostrar los formularios del header
  const [agregarViaticoOpen, setAgregarViaticoOpen] = useState(false)

  const [modificarHDROpen, setmodificarHDROpen] = useState(false)

  const handleModificarHDRClose = () => {
    setmodificarHDROpen(false)
    //router.reload()
  }

  if (!data) {
    // Valida que exista una hoja de ruta
    return null
  }

  return (
    <Fragment>
          {modificarHDROpen && <FormModificarHDR data={data.hoja_de_ruta} open={ modificarHDROpen } onClose={ () =>handleModificarHDRClose()} /> }

          <Box sx={{display:"flex",flexDirection:"row-reverse"}}>
            <Typography variant='h2'>HDR: <b>{data.hoja_de_ruta.hdr_id}</b> </Typography>
          </Box>

          <Typography variant='h4'>Ver Datos Generales</Typography>
          <Accordion sx={{mb:20}}>
            <AccordionSummary id="panel-header" aria-controls="panel-content" expandIcon={<Icon icon='tabler:arrow-up'/>}>
              Ver datos generales
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6} xl={3}>
                  <TextField
                    fullWidth
                    label='FLOTA'
                    value={data.flota.nombre}
                    variant='outlined'
                    disabled
                    margin='normal'
                  />
                </Grid>
                <Grid item xs={6} xl={3}>
                  <TextField
                    fullWidth
                    label='DOMINIO TRACTOR'
                    value={data.flota.dominio}
                    variant='outlined'
                    disabled
                    margin='normal'
                  />
                </Grid>
                <Grid item xs={6} xl={3}>
                  <TextField
                    fullWidth
                    label='DOMINIO BATEA'
                    value={data.batea}
                    variant='outlined'
                    disabled
                    margin='normal'
                  />
                </Grid>
                <Grid item xs={6} xl={3}>
                  <TextField
                    fullWidth
                    label='KM ODOMETRO INICIAL'
                    value={data.flota.odometro}
                    variant='outlined'
                    disabled
                    margin='normal'
                  />
                </Grid>
                <Grid item xs={6} xl={3}>
                  <TextField
                    fullWidth
                    label='TIPO DE DESTINO'
                    value={data.destino.tipo}
                    variant='outlined'
                    disabled
                    margin='normal'
                  />
                </Grid>
                <Grid item xs={6} xl={3}>
                  <TextField
                    fullWidth
                    label='DESTINO'
                    value={data.destino.nombre}
                    variant='outlined'
                    disabled
                    margin='normal'
                  />
                </Grid>

      <Box sx={{ mt: 4, mb: 0 }}>
      <Typography variant='h4' sx={{mb:3}}>ACCIONES</Typography>
      <Grid container spacing={2} sx={{ mb: 10 }}>
        <Grid item xs={6} md={6}>
          <Button
            variant='contained'
            sx={{ height: '60px' }}
            color='primary'
            onClick={() => setmodificarHDROpen(true)}
            startIcon={<Icon icon='tabler:reload' />}
            fullWidth
          >
            MODIFICAR HDR
          </Button>
        </Grid>
        <Grid item xs={6} md={6}>
          <Button
            variant='contained'
            sx={{ height: '60px' }}
            color='error'
            startIcon={<Icon icon='tabler:cloud-lock' />}
            fullWidth
            onClick={() => router.push('/chofer/cerrar-hdr')}
          >
            CERRAR HDR
          </Button>
        </Grid>
      </Grid>
      </Box>
              </Grid>
            </AccordionDetails>
          </Accordion>


      <Divider variant='fullWidth'sx={{border:1,mb:2}}/>
      <Typography variant='h4' sx={{mb:2}}>Resumen de Hoja de Ruta : </Typography>

      <Typography variant='h6' sx={{mb:2}}>Cantidad de novedades : </Typography>
      <Card sx={{mb:10}}>
            <FormLabel component="legend" sx={{ml:5,m:4}}>
              {data.cant_novedades}
            </FormLabel>
      </Card>

      <Typography variant='h6' sx={{mb:2}}>Cantidad de litros de combustible cargados : </Typography>
      <Card sx={{mb:10}}>
            <FormLabel component="legend" sx={{ml:5,m:4}}>
              {data.cant_comb_cargado}
            </FormLabel>
      </Card>

      <Typography variant='h6' sx={{mb:2}}>Cantidad de litros de urea cargados : </Typography>
      <Card sx={{mb:10}}>
            <FormLabel component="legend" sx={{ml:5,m:4}}>
              {data.cant_urea_cargada}
            </FormLabel>
      </Card>

      <Typography variant='h6' sx={{mb:2}}>Kilometros recorridos : </Typography>
      <Card sx={{mb:10}}>
            <FormLabel component="legend" sx={{ml:5,m:4}}>
              {data.km_recorridos}
            </FormLabel>
      </Card>

      <Typography variant='h6' sx={{mb:2}}>Monto total de gastos : </Typography>
      <Card sx={{mb:10}}>
            <FormLabel component="legend" sx={{ml:5,m:4}}>
              {data.monto_total_gastos}
            </FormLabel>
      </Card>


      {data.total_adelantos !== null && data.total_adelantos !== 0 && (
      <Fragment>
      <Typography variant='h6' sx={{mb:2}}>Adelanto de viaje : </Typography>

      <Card sx={{mb:10}}>
        <FormLabel component="legend"  sx={{ml:5,m:4}}>
          {data.total_adelantos}
        </FormLabel>
      </Card>
      </Fragment>
      )}

      {data.total_via_nac !== null && data.total_via_nac!== 0 && (
        <Fragment>
        <Typography variant='h6' sx={{mb:2}}>Viatico nacional : </Typography>
          <Card sx={{mb:10}}>
            <FormLabel component="legend" sx={{ml:5,m:4}}>
              {data.total_via_nac}
            </FormLabel>
          </Card>
        </Fragment>
      )}


      {data.total_via_plus !== null && data.total_via_plus !== 0 && (
        <Fragment>
        <Typography variant='h6' sx={{mb:2}}>Viatico plus : </Typography>
          <Card sx={{mb:10}}>
            <FormLabel component="legend" sx={{ml:5,m:4}}>
            {data.total_via_plus}
            </FormLabel>
          </Card>
        </Fragment>
      )}



    </Fragment>
  )
}

export default DetallesHojaRuta
