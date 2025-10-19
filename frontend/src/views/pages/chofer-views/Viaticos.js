import { React, useState, useEffect } from 'react'
import { Grid, Container, Box, Typography, Button, Divider } from '@mui/material'
import { Icon } from '@iconify/react'
import FormAgregarViatico from 'src/components/chofer-components/FormAgregarViatico'
import { getViaticosHDR } from '../../../services/chofer_endpoints/viatico'
import CardViaticos from '../../../components/chofer-components/CardViaticos'

const AgregarViatico = ({ data }) => {
  // estados Formulario Movimiento
  const [agregarViaticoOpen, setAgregarViaticoOpen] = useState(false)

  const [viaticos, setViaticos] = useState([])
  const [cambio,setCambio] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resViaticos = await getViaticosHDR(data.hoja_de_ruta.hdr_id)
        console.log('LOS VIATICOS SON', resViaticos)
        setViaticos(resViaticos)
      } catch (error) {
        console.error('Error al obtener los viaticos:', error)
      }
    }

    fetchData()
  }, [data.hoja_de_ruta.hdr_id,cambio])

  const handleOpenViatico = () => {
    setAgregarViaticoOpen(true)
  }

  const handleCloseViatico = () => {
    setAgregarViaticoOpen(false)
  }

  if (!data) {
    // Valida que exista una hoja de ruta
    return null
  }

  return (
    <Container maxWidth='xl'>
      <FormAgregarViatico
          isOpen={agregarViaticoOpen}
          onClose={handleCloseViatico}
          data={null}
          dataHDR={data}
          setViaticos={setViaticos}
          setCambio={setCambio}
      />
      <Box sx={{ mt: 2 }}>
        <Typography variant='h5'>Adelantos</Typography>
      </Box>
      <Container>
        <Grid container justifyContent='space-between' alignItems='center'>
          <Grid item>
            <Button
              variant='contained'
              color='primary'
              startIcon={<Icon icon='tabler:note' />}
              sx={{ mb: 5, mt: 5 }}
              onClick={handleOpenViatico}
            >
              AGREGAR ADELANTO
            </Button>
          </Grid>
        </Grid>
      </Container>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        {viaticos.map((item, index) => (
          <Grid key={index} item xs={12} sm={12} md={12} lg={12}>
            <CardViaticos
              data={item}
              hdr_id={data.hoja_de_ruta.hdr_id}
              setViaticos={setViaticos}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
export default AgregarViatico
