import React from 'react'
import {
  Grid,
  TextField,
  Container,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider
} from '@mui/material'

import CardWithCollapse from 'src/components/CardWithCollapse'
import Icon from 'src/@core/components/icon'

const UltimaHDR = ({ data }) => {
  if (!data) {
    console.log('soy un null')

    return null
  }

  // console.log(data)

  return (
    <Container maxWidth='xl'>
      <Accordion>
        <AccordionSummary
          id='panel-header-1'
          aria-controls='panel-content-1'
          expandIcon={<Icon fontSize='1.25rem' icon='tabler:chevron-down' />}
        >
          <Box mt={2}>
            <Typography variant='h5'>Detalles de Hoja de Ruta</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <form>
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
                  value={data.hoja_de_ruta.hdr_odometro}
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
              {data.hoja_de_ruta.hdr_adelanto !== null && data.hoja_de_ruta.hdr_adelanto !== 0 && (
                <Grid item xs={6} xl={3}>
                  <TextField
                    fullWidth
                    label='ADELANTO DE VIAJE'
                    value={data.hoja_de_ruta.hdr_adelanto}
                    variant='outlined'
                    disabled
                    margin='normal'
                  />
                </Grid>
              )}
              {data.hoja_de_ruta.hdr_viatico_nac !== null && data.hoja_de_ruta.hdr_viatico_nac !== 0 && (
                <Grid item xs={6} xl={3}>
                  <TextField
                    fullWidth
                    label='VIATICO NACIONAL'
                    value={data.hoja_de_ruta.hdr_viatico_nac}
                    variant='outlined'
                    disabled
                    margin='normal'
                  />
                </Grid>
              )}
              {data.hoja_de_ruta.hdr_viatico_plus !== null && data.hoja_de_ruta.hdr_viatico_plus !== 0 && (
                <Grid item xs={6} xl={3}>
                  <TextField
                    fullWidth
                    label='VIATICO PLUS'
                    value={data.hoja_de_ruta.hdr_viatico_plus}
                    variant='outlined'
                    disabled
                    margin='normal'
                  />
                </Grid>
              )}
            </Grid>
          </form>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          id='panel-header-2'
          aria-controls='panel-content-2'
          expandIcon={<Icon fontSize='1.25rem' icon='tabler:chevron-down' />}
        >
          <Box mt={2}>
            <Typography variant='h5'>ACCIONES</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} xl={3}>
              <Button variant='contained' color='info' startIcon={<Icon icon='tabler:cash' />} fullWidth>
                AGREGAR VIATICO
              </Button>
            </Grid>
            <Grid item xs={12} xl={3}>
              <Button variant='contained' color='secondary' startIcon={<Icon icon='tabler:reload' />} fullWidth>
                MODIFICAR HDR
              </Button>
            </Grid>
            <Grid item xs={12} xl={3}>
              <Button variant='contained' color='primary' startIcon={<Icon icon='tabler:note' />} fullWidth>
                AGREGAR NOVEDAD
              </Button>
            </Grid>
            <Grid item xs={12} xl={3}>
              <Button variant='contained' color='error' startIcon={<Icon icon='tabler:cloud-lock' />} fullWidth>
                CERRAR HDR
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          id='panel-header-3'
          aria-controls='panel-content-3'
          expandIcon={<Icon fontSize='1.25rem' icon='tabler:chevron-down' />}
        >
          <Box mt={2}>
            <Typography variant='h5'>Ultimos movimientos registrados</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Container>
            <Grid container justifyContent='space-between' alignItems='center'>
              <Grid item>
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<Icon icon='tabler:note' />}
                  sx={{ mb: 5 }}

                  /* onClick={handleAgregarMovimiento} */
                >
                  AGREGAR MOVIMIENTO
                </Button>
              </Grid>
            </Grid>
          </Container>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <CardWithCollapse />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <CardWithCollapse />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <CardWithCollapse />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Container>
  )
}

export default UltimaHDR
