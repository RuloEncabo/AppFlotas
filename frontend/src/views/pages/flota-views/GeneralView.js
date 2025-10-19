import HeaderHDRGeneral from 'src/components/flota-components/HeaderHDRGeneral'
import React from 'react'
import TablaHDR from 'src/components/flota-components/tabla-hdr-general'
import TablaNov from 'src/components/flota-components/tabla-nov-general'
import { Typography } from '@mui/material'

function GeneralView() {
  return (
    <div>
        <Typography variant="h2" sx={{mt:5,mb:5}}>LISTADO DE HOJAS DE RUTA</Typography>
        <TablaHDR/>

        <Typography variant="h2" sx={{mt:15,mb:5}}>LISTADO DE NOVEDADES</Typography>
         <TablaNov/>
    </div>
  )
}

export default GeneralView
