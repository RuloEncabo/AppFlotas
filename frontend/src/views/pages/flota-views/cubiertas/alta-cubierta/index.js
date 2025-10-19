import React, { useState } from 'react'
import { Typography } from '@mui/material'
import FormAltaCubierta from 'src/components/cubiertas-components/FormAltaCubierta'
import TablaCubiertasCargadas from 'src/components/cubiertas-components/TablaCubiertasCargadas'

function AltaCubiertaView() {
  const [reload , setReload] = useState(false)
  return (
    <div>
        <Typography variant="h2" sx={{mt:5,mb:5}}>ALTA CUBIERTA</Typography>
        <FormAltaCubierta setReload={setReload}/>
        <Typography variant="h2" sx={{mt:5,mb:5}}>CUBIERTAS CARGADAS</Typography>
        <TablaCubiertasCargadas reload={reload} setReload={setReload}/>
    </div>
  )
}

export default AltaCubiertaView
