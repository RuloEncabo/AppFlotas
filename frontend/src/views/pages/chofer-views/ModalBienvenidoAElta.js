import React, { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { Box } from '@mui/system'

const ModalBienvenidoAElta = () => {
  const router = useRouter()

  const handleIniciarHojaDeRuta = () => {
    router.push('/chofer/crear-hdr')
  }

  return (
    <Card
      style={{
        margin: '15px',
        padding: '15px',
        width: 'auto',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* <Image
        alt='ImagenCamion'
        width={310}
        height={300}
        src='/images/pages/logo-elta-light.png'
        //priority='blur'
      /> */}
      <Box sx={{ width: 300, height: 150 }}/>

      <Typography variant='h4' align='center' style={{ marginTop: '15px' }}>
        Bienvenido a Elta
      </Typography>

      <Typography variant='subtitle1' align='center' style={{ marginTop: '15px' }}>
        Usted no posee una hoja de ruta activa
      </Typography>

      <Button
        variant='contained'
        color='primary'
        style={{ marginTop: '15px', width: '350' }}
        className='w-full md:w-400'
        onClick={handleIniciarHojaDeRuta}
      >
        Iniciar Hoja de Ruta
      </Button>
    </Card>
  )
}

export default ModalBienvenidoAElta
