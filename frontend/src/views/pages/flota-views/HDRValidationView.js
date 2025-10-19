import React, { useState } from 'react'
import { Typography } from '@mui/material'
import TablaValidations from 'src/components/validations-components/tabla-validations'

function HDRValidationView() {
  const [reset , setReset] = useState(false)
  return (
    <div>
        <Typography variant="h2" sx={{mt:5,mb:5}}>LISTADO DE HOJAS DE RUTA A VALIDAR</Typography>
        <TablaValidations reset={reset} setReset={setReset}/>
    </div>
  )
}

export default HDRValidationView
