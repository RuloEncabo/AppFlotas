import { React, useState, useEffect } from 'react'
import { Grid, TextField, Container, Box, Typography, Button, Divider } from '@mui/material'

import Icon from 'src/@core/components/icon'
import { getNovedadesHDR } from 'src/services/chofer_endpoints/novedad'
import FormCargaNovedad from 'src/components/chofer-components/FormAgregarNovedad'
import CardNovedades from 'src/components/chofer-components/CardNovedades'

const Novedades = ({ data }) => {
  // estados Formulario Movimiento
  const [agregarNovedadOpen, setAgregarNovedadOpen] = useState(false)

  const [novedades, setNovedades] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener novedades
        const resNovedades = await getNovedadesHDR(data.hoja_de_ruta.hdr_id)
        console.log('LAS NOVEDADES SON', resNovedades)
        setNovedades(resNovedades)
      } catch (error) {
        console.error('Error al obtener las novedades:', error)
      }
    }

    fetchData()
  }, [data.hoja_de_ruta.hdr_id])

  const handleAgregarNovedadOpen = () => {
    setAgregarNovedadOpen(true)
  }

  const handleCloseNovedad = () => {
    setAgregarNovedadOpen(false)
  }

  if (!data) {
    // Valida que exista una hoja de ruta
    return null
  }

  return (
    <Container maxWidth='xl'>
      <FormCargaNovedad
        isOpen={agregarNovedadOpen}
        onClose={handleCloseNovedad}
        data={null}
        isAgregando={true}
        hdr_id={data.hoja_de_ruta.hdr_id}
        setNovedades={setNovedades}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant='h5'>Novedades</Typography>
      </Box>
      <Container>
        <Grid container justifyContent='space-between' alignItems='center'>
          <Grid item>
            <Button
              variant='contained'
              color='primary'
              startIcon={<Icon icon='tabler:note' />}
              sx={{ mb: 5, mt: 5 }}
              onClick={handleAgregarNovedadOpen}
            >
              AGREGAR NOVEDAD
            </Button>
          </Grid>
        </Grid>
      </Container>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        {novedades.map((item, index) => (
          <Grid key={index} item xs={12} sm={12} md={12} lg={12}>
            <CardNovedades data={item} hdr_id={data.hoja_de_ruta.hdr_id} />
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default Novedades
