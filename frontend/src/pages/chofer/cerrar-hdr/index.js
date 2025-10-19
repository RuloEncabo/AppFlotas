import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { closeHDR } from 'src/services/chofer_endpoints/hdr'
import { useRouter } from 'next/router'
import ErrorDialog from 'src/components/ErrorDialog'
import { FormControl, FormLabel, MenuItem, Select } from '@mui/material'

const CerrarHDR = () => {
  const router = useRouter()
  const [erroresValidacion, setErroresValidacion] = useState([])
  const [motivoCierre, setMotivoCierre] = useState("")

  const handleOnClick = async () => {
    if(motivoCierre === ""){
      setErroresValidacion([{error:400,message:"DEBE SELECCIONAR UN MOTIVO DE CIERRE"}])
      return
    }
    try {
      await closeHDR(motivoCierre);
      router.push('/chofer/chofer-combustibles');
    } catch (error) {
      console.log('No se pudo cerrar la HDR', error)
      setErroresValidacion([{error:409,message:`Verificar datos: ${error.response?.data?.detail  || error.message}`}])

    }
  }

  const handleCloseDialog = () => {
    setErroresValidacion([])
  }

  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='flex-start'
      paddingY={5}
    >

    {erroresValidacion.length > 0 && <ErrorDialog errores={erroresValidacion} titulo={"Ups"} onClose={handleCloseDialog} />}

      <Typography variant='h4' style={{ marginBottom: '32px' }}>
        ¿DESEA CERRAR LA HOJA DE RUTA ACTUAL?
      </Typography>
      <FormControl sx={{mb:10,mt:10}}>
        <FormLabel>Seleccione un motivo de cuenta</FormLabel>
      <Select
        id="motivo"
        defaultValue=''
        onChange={(e) => setMotivoCierre(e.target.value)}
        variant="outlined"
      >
        <MenuItem value="RENDICION DE CUENTA">RENDICION DE CUENTA</MenuItem>
        <MenuItem value="CAMBIO DE FLOTA">CAMBIO DE FLOTA</MenuItem>
        <MenuItem value="POR ROTURA">POR ROTURA</MenuItem>
      </Select>
      </FormControl>
      <Box display={'flex'} gap={10}>
      <Button variant='contained' color='primary' onClick={router.back} sx={{width:"50%" ,height:"50px"}}>
        Cancelar
      </Button>
      <Button variant='contained' color='error' onClick={handleOnClick} sx={{width:"50%",height:"50px"}}>
        Cerrar Hoja de Ruta
      </Button>
      </Box>
    </Box>
  )
}
CerrarHDR.acl = {
  action: 'usar',
  subject: 'chofer'
}

export default CerrarHDR
