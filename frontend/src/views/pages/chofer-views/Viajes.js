import { React, useState, useEffect } from 'react'
import { Grid, TextField, Container, Box, Typography, Button, Divider } from '@mui/material'

import CadrMovimientos from 'src/components/chofer-components/CardMovimientos'
import Icon from 'src/@core/components/icon'
import FormCargaMovimiento from 'src/components/chofer-components/FormAgregarMovimiento'
import { getMovimientosHDR } from 'src/services/chofer_endpoints/movimiento'

const Viajes = ({ data }) => {
  // estados Formulario Movimiento
  const [agregarViajeOpen, setAgregarViajeOpen] = useState(false)

  const [movimientos, setMovimientos] = useState([])

  const [mostrarBoton, setMostrarBoton] = useState(false)

  const [ultimoMovimiento,setUltimoMovimiento] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener movimientos
        const resMovimientos = await getMovimientosHDR(data.hoja_de_ruta.hdr_id)
        setMovimientos(resMovimientos.reverse())


        // MOSTRAR BOTON AGREGAR MOVIMIENTO SOLO SI ENCUENTRA TODOS LOS MOVIMIENTOS CON MOV_KM_ODO_FINAL, DE LO CONTRARIO NO LO RENDERIZA
        const encontrarMovAbierto = !resMovimientos.some(movimiento => movimiento.mov_km_odo_fin === null ) // TRUE SI NO ENCUENTRA UN MOVIMIENTO ABIERTO
        setMostrarBoton(encontrarMovAbierto)
      } catch (error) {
        console.error('Error al obtener los movimientos:', error)
          setMostrarBoton(true)
      }
    }

    fetchData()
  }, [data.hoja_de_ruta.hdr_id])

  const handleAgregarViajeOpen = () => {
    setAgregarViajeOpen(true)
  }

  const handleCloseViaje = () => {
    setAgregarViajeOpen(false)
  }



  useEffect(()=>{ //USE EFFECT UNA VEZ ESTA CARGADO EL ULTIMO MOVIEMNTO, LO SETEO
    if(movimientos != [{}]){
      setUltimoMovimiento(movimientos[0])
      //console.log('el ultimo movimiento es: ',movimientos[0])
    }
  },[movimientos])



  if (!data) {
    // Valida que exista una hoja de ruta
    return null
  }


  return (
    <Container maxWidth='lg'>
      <FormCargaMovimiento
        isOpen={agregarViajeOpen}
        onClose={handleCloseViaje}
        data={null}
        isAgregando={true}
        hdr_id={data.hoja_de_ruta.hdr_id}
        dataHDR = {data}
        ultimo_km={data.flota.odometro}
        movimiento_anterior={ultimoMovimiento}
        setMovimientos={setMovimientos}
        setMostrarBoton={setMostrarBoton}
        movimientos={movimientos}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant='h5'>Carga de movimientos</Typography>
      </Box>
      <Container>
        <Grid container justifyContent='space-between' alignItems='center'>
          <Grid item>
            {mostrarBoton && (
              <Button
                variant='contained'
                color='primary'
                startIcon={<Icon icon='tabler:note' />}
                sx={{ mb: 5, mt: 5 }}
                onClick={()=>{{handleAgregarViajeOpen()}
                /* console.log(ultimoMovimiento) */}}
              >
                AGREGAR MOVIMIENTO
              </Button>
            )}
          </Grid>
        </Grid>
      </Container>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        {movimientos.map((item, index) => (
          <Grid key={index} item xs={12} sm={12} md={12} lg={12}>
            <CadrMovimientos
              data={item}
              hdr_id={data.hoja_de_ruta.hdr_id}
              dataHDR = {data}
              setMovimientos={setMovimientos}
              setMostrarBoton={setMostrarBoton}
              movimientos={movimientos}
              islastMov={index === 0}/>
          </Grid>
        ))}

      </Grid>
    </Container>
  )
}

export default Viajes
