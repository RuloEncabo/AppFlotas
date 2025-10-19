import React from 'react'

import { Typography , Button, Box, Grid, Card, CardHeader, CardContent } from '@mui/material'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/router'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import TablaRotarCubiertas from 'src/components/dashboard-components/TablaRotarCubiertas'
import EstadoCubiertas from 'src/components/dashboard-components/EstadoCubiertas'
import CubiertasPorMM from 'src/components/dashboard-components/CubiertasPorMM'
import EstadoReparacionCubiertas from 'src/components/dashboard-components/EstadoReparacionCubiertas'
import CubiertasPorDeposito from 'src/components/dashboard-components/CubiertasPorDeposito'


function CubiertasGeneralView() {
  //router
  const router = useRouter()

  const chartData1 = {
    series: [44, 55, 13, 43],
    options: {
      chart: {
        type: 'donut',
      },
      labels: ['Rodando', 'Paradas', 'Para Recapar', 'Para Rotar'],
      dataLabels: {
        style: {
          colors: ['#000'], // Cambia esto al color que prefieras para las etiquetas de los datos
        },
      },
      legend: {
        labels: {
          colors: ['#FF5733'], // Cambia esto al color que prefieras para las etiquetas de la leyenda
        },
      },
    },
  };

  const chartData2 = {
    series: [53, 33, 15, 29],
    options: {
      chart: {
        type: 'donut',
      },
      labels: ['Depósito', 'Baja', 'Baja Definitiva', 'En Taller'],
      dataLabels: {
        style: {
          colors: ['#000'], // Cambia esto al color que prefieras para las etiquetas de los datos
        },
      },
      legend: {
        labels: {
          colors: ['#FF5733'], // Cambia esto al color que prefieras para las etiquetas de la leyenda
        },
      },
    },
  };

  const chartData3 = {
    series: [{
      name: 'Cubiertas',
      data: [10, 20, 30, 40, 50, 60]
    }],
    options: {
      chart: {
        type: 'bar',
      },
      xaxis: {
        categories: ['0-2000 km', '2001-4000 km', '4001-6000 km', '6001-8000 km', '8001-10000 km', '10000+ km'],
      },
      dataLabels: {
        style: {
          colors: ['#000'], // Cambia esto al color que prefieras para las etiquetas de los datos
        },
      },
      legend: {
        labels: {
          colors: ['#FF5733'], // Cambia esto al color que prefieras para las etiquetas de la leyenda
        },
      },
    },
  };


  return (
    <Box sx={{ width: '100%', display: 'flex' , flexDirection:'column'}}>
        <Typography variant="h2" sx={{mt:5,mb:5}}>Cubiertas</Typography>

      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' , gap:8, flexDirection:'row' , my:5, height: '80px' }}>
        <Button onClick={() => router.push('flota-cubiertas/alta-cubierta')} variant="contained" sx={{width:'200px'}} size='large' endIcon={<Icon icon='tabler:plus' />}>ALTA CUBIERTA </Button>
        <Button onClick={() => router.push('flota-cubiertas/baja-cubierta')} variant="contained" sx={{width:'200px'}} size='large' endIcon={<Icon icon='tabler:trash' />}>BAJA CUBIERTA
        MOV INTERNO </Button>
        <Button onClick={() => router.push('flota-cubiertas/baja-definitiva-cubierta')} variant="contained" sx={{width:'200px'}} size='large' endIcon={<Icon icon='tabler:trash' />}>BAJA DEFINITIVA CUBIERTA </Button>
        <Button onClick={() => router.push('flota-cubiertas/tratamiento-cubierta')} variant="contained" sx={{width:'200px'}} size='large' endIcon={<Icon icon='tabler:hammer' />}>TRATAMIENTO CUBIERTA </Button>
        <Button onClick={() => router.push('flota-cubiertas/alta-cubierta-flota')} variant="contained" sx={{width:'200px'}} size='large' endIcon={<Icon icon='tabler:pencil-plus' />}>ALTA CUBIERTA FLOTA </Button>
      </Box>

      <Box sx={{ width: '100%', display: 'flex' , flexDirection:'row',flexWrap:'wrap', alignItems:'center',gap:4}}>
      <EstadoCubiertas/>
      <CubiertasPorMM/>
      <EstadoReparacionCubiertas/>
      <CubiertasPorDeposito/>
      </Box>


    </Box>
  )
}

export default CubiertasGeneralView
