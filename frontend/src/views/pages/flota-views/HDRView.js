import React from 'react'
import { Typography } from '@mui/material'
import TablaHDR from 'src/components/flota-components/tabla-hdr'

function HDRView() {
  return (
    <div>
        <Typography variant="h2" sx={{mt:5,mb:5}}>LISTADO DE HOJAS DE RUTA</Typography>
        <TablaHDR/>
    </div>
  )
}

export default HDRView
