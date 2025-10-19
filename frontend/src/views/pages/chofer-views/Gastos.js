import { React, useState, useEffect } from 'react'
import { Grid, Container, Box, Typography, Button, Divider } from '@mui/material'

import Icon from 'src/@core/components/icon'
import { getGastosHDR } from 'src/services/chofer_endpoints/gasto'
import FormCargaGasto from 'src/components/chofer-components/FormAgregarGasto'
import CardGastos from 'src/components/chofer-components/CardGastos'
import { getCatNovedadesHDR } from 'src/services/chofer_endpoints/cat_novedad'

//import CardGastos from 'src/components/CardGastos'

const Gastos = ({ data }) => {
  // estados Formulario Movimiento
  const [agregarGastoOpen, setAgregarGastoOpen] = useState(false)

  const [gastos, setGastos] = useState([])
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resGastos = await getGastosHDR(data.hoja_de_ruta.hdr_id)
        const resCategorias = await getCatNovedadesHDR()
        console.log('LOS GASTOS SON', resGastos)
        setGastos(resGastos)

        setCategorias(resCategorias)

      } catch (error) {
        console.error('Error al obtener los gastos:', error)
      }
    }

    fetchData()
  }, [data.hoja_de_ruta.hdr_id])

  const handleAgregarGastoOpen = () => {
    setAgregarGastoOpen(true)
  }

  const handleCloseGasto = () => {
    setAgregarGastoOpen(false)
  }

  if (!data && !categorias) {
    // Valida que exista una hoja de ruta
    return null
  }

  return (
    <Container maxWidth='xl'>
      <FormCargaGasto
        isOpen={agregarGastoOpen}
        onClose={handleCloseGasto}
        data={null}
        listNovedades={categorias}
        isAgregando={true}
        hdr_id={data.hoja_de_ruta.hdr_id}
        setGastos = {setGastos}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant='h5'>Gastos</Typography>
      </Box>
      <Container>
        <Grid container justifyContent='space-between' alignItems='center'>
          <Grid item>
            <Button
              variant='contained'
              color='primary'
              startIcon={<Icon icon='tabler:note' />}
              sx={{ mb: 5, mt: 5 }}
              onClick={handleAgregarGastoOpen}
            >
              AGREGAR GASTO
            </Button>
          </Grid>
        </Grid>
      </Container>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        {gastos.map((item, index) => (
          <Grid key={index} item xs={12} sm={12} md={12} lg={12}>
            <CardGastos data={item} hdr_id={data.hoja_de_ruta.hdr_id} setGastos={setGastos} indice={index} />
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default Gastos
