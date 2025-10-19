import React, { Fragment, useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Container, Divider, Grid, Typography, colors, useTheme } from '@mui/material'
import KmRecorridos from 'src/components/dashboard-components/KmRecorridos'
import DisponibilidadFlotas from 'src/components/dashboard-components/DisponibilidadFlotas'
import TiposDeViajesActivos from 'src/components/dashboard-components/TiposDeViajeActivos'
import HDRPorMotivo from 'src/components/dashboard-components/HDRPorMotivo'
import TotalOrdenesTrabajo from 'src/components/dashboard-components/TotalOrdenesTrabajo'
import TotalNovedades from 'src/components/dashboard-components/TotalNovedades'
import CombustibleConsumidoChofer from 'src/components/dashboard-components/CombustibleConsumidoChofer'
import CombustibleConsumidoFlota from 'src/components/dashboard-components/CombustibleConsumidoFlota'
import { getMetricaAnalitica } from 'src/services/flota_endpoints/metricas'
import FiltroTablaDesplegable, { FiltroFecha } from 'src/components/formComponents/Filtros'
import AnaliticaGral from 'src/components/dashboard-components/analiticaGral'
import ErrorDialog from 'src/components/ErrorDialog'
import MovimientosPorChofer from 'src/components/dashboard-components/MovimientosPorChofer'

function DashGeneralView() {
  const [data , setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("")
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("")
  const [filtroDestino, setFiltroDestino] = useState("")
  const [apiErrors, setApiErrors] = useState([])
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      if (filtroFechaDesde != "" && filtroFechaHasta != "") {
        try {
          console.log("FECHAS: ",filtroFechaHasta,filtroFechaDesde,filtroDestino)
          const res = await getMetricaAnalitica(filtroFechaDesde,filtroFechaHasta,filtroDestino)
          setData(res)
        } catch (error) {
          if (error.response) {
            setApiErrors([{ error: 423, message: error.response.data.detail }]);
          }
        }
      }
    }
    fetchData()
    setIsLoading(false)
  },[ filtroFechaDesde, filtroFechaHasta, filtroDestino ])

  const handleResetDestino = () => {
    setFiltroDestino("")
    setApiErrors([])
    setFiltroFechaDesde("")
    setFiltroFechaHasta("")
    setData(null)
  }


  const handleCloseDialog = () => {
    setApiErrors([])
  }

  return(
  <Fragment>
    <Typography variant='h1'>Dashboard</Typography>
    {apiErrors.length > 0 && <ErrorDialog errores={apiErrors} titulo={"Hubo un problema al cargar los datos"}  onClose={handleCloseDialog} />}
    <Box sx={{display:"flex", flexDirection:"row", flexWrap:"wrap" , gap:3}}>
      <Card sx={{width:"100%"}}>
        <CardHeader title="Analitica General"/>
        <CardContent>
          <Box my={4} sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <FiltroFecha label={"Fecha Desde"} value={filtroFechaDesde} setValue={setFiltroFechaDesde} mostrarTiempo={false}/>
            <FiltroFecha label={"Fecha Hasta"} value={filtroFechaHasta} setValue={setFiltroFechaHasta} mostrarTiempo={false}/>
            <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{width:"100%"}}><FiltroTablaDesplegable endpoint={"/params/destino/"} optionLabelKey={'des_nombre'} optionValueKey={'des_id'} label={'Destino'} setValue={setFiltroDestino} value={filtroDestino} /></Box>
              <Button variant="contained" color="primary" sx={{ height: 40 }} onClick={handleResetDestino}>Resetear</Button>
            </Box>
          </Box>
          <Divider sx={{ my: 2.5 }} />
          {isLoading ? <CircularProgress /> :
            <AnaliticaGral data={data}/>
          }
        </CardContent>
      </Card>

      {filtroFechaDesde != "" && filtroFechaHasta != "" &&
      <Box sx={{width:"100%", display:"flex", flexDirection:"row", flexWrap:"wrap", gap:3}}>

      <KmRecorridos tipo={"CHOFER"} filtroFechaDesde={filtroFechaDesde} filtroFechaHasta={filtroFechaHasta} filtroDestino={filtroDestino}/>
      <KmRecorridos tipo={"FLOTA"} filtroFechaDesde={filtroFechaDesde} filtroFechaHasta={filtroFechaHasta} filtroDestino={filtroDestino}/>
      <CombustibleConsumidoChofer filtroFechaDesde={filtroFechaDesde} filtroFechaHasta={filtroFechaHasta} filtroDestino={filtroDestino}/>
      <CombustibleConsumidoFlota filtroFechaDesde={filtroFechaDesde} filtroFechaHasta={filtroFechaHasta} filtroDestino={filtroDestino}/>
      </Box>
      }
      <Divider sx={{ my: 2.5 , width:"100%", borderColor: theme.palette.secondary.main, height: 1 }} />
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap', padding: '1rem', gap:3}}>
        <Typography variant='h4'>Movimientos por chofer</Typography>
        <MovimientosPorChofer/>
      </Box>
      <Divider sx={{ my: 2.5 , width:"100%", borderColor: theme.palette.secondary.main, height: 1 }} />
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap', padding: '1rem', gap:3}}>
        <Typography variant='h4'>Vehiculos elta</Typography>
        <DisponibilidadFlotas />
      </Box>
        <Typography variant='h4'>Informacion de hoja de ruta</Typography>
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap', padding: '1rem', gap:3}}>
        <TiposDeViajesActivos />
        <HDRPorMotivo />
        </Box>
        <Typography variant='h4'>Informacion de ordenes de trabajo </Typography>
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap', padding: '1rem', gap:3}}>
        <TotalOrdenesTrabajo />
        <TotalNovedades />
        </Box>
    </Box>
  </Fragment>
  )
}

export default DashGeneralView
