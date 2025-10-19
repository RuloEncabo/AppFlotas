import React, { useState } from 'react'
import { Typography } from '@mui/material'
import FormBajaCubierta from 'src/components/cubiertas-components/FormBajaCubierta'
import TablaCubiertasBaja from 'src/components/cubiertas-components/TablaCubiertasBaja'
import TablaCubiertasMovimientoInterno from 'src/components/cubiertas-components/TablaCubiertasMovimientoInterno'

function BajaCubiertaView() {
  const [reload , setReload] = useState(false)
  return (
    <div>
        <Typography variant="h2" sx={{mt:5,mb:5}}>BAJA CUBIERTA</Typography>
        <FormBajaCubierta setReload={setReload}/>
        <Typography variant="h2" sx={{mt:5,mb:5}}>CUBIERTAS DADAS DE BAJA</Typography>
        <TablaCubiertasBaja reload={reload} setReload={setReload}/>
        <Typography variant="h2" sx={{mt:5,mb:5}}>CUBIERTAS DADAS EN MOVIMIENTO INTERNO</Typography>
        <TablaCubiertasMovimientoInterno reload={reload} setReload={setReload}/>
    </div>
  )
}

export default BajaCubiertaView
