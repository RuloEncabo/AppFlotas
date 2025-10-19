import React from 'react'
import { Fragment, useEffect, useState } from 'react'
import { Box, CardContent, Grid, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter } from 'next/router'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'

// ** Utils Import
import { CircularProgress, IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import { getKmHDR } from 'src/services/flota_endpoints/km_hdr'
import { getNovHDR } from 'src/services/flota_endpoints/nov_hdr'
import Link from 'next/link'

  const  statusList ={
    "PENDIENTE": {title:'PENDIENTE', color: 'primary'},
    "RESUELTA" : {title:'RESUELTA', color: 'success'},
    "ASIGNADA": {title:'ASIGNADA', color: 'warning'},
    "ATENDIDA": {title:'ATENDIDA', color: 'primary'},
    "CERRADA" : {title:'CERRADA', color: 'success'},
  }

/* const  statusList ={
  "PENDIENTE" : {title:'PENDIENTE', color: 'warning'},
  "FINALIZADO" : {title:'FINALIZADO', color: 'primary'},
} */


const columns = [

  {
    flex:0.22,
    minWidth:200,
    field:'FECHA',
    headerName:'FECHA',
    sortable: false,
    renderCell: params =>{
      const {row} = params
      const fechaObj = new Date(row.FECHA);
      const opciones = { year: 'numeric', month: 'numeric', day: 'numeric' };
      const fechaEnEspañol = fechaObj.toLocaleDateString('es-ES', opciones);
      return (
        <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Typography>{fechaEnEspañol}</Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.22,
    minWidth: 200,
    field: 'ID',
    headerName: 'ID NOVEDAD',
    sortable: false,
    renderCell: params => {
      const { row } = params
      const theme = useTheme()

      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography color={theme.palette.text.primary}>
            <b>#{row.ID}</b>
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.20,
    minWidth: 140,
    field: 'ESTADO',
    headerName: 'ESTADO',
    sortable: false,
    renderCell: params => {
    const { row } = params
    console.log("EL ESTADO ES ", row.ESTADO)
    const status = statusList[row.ESTADO]

      return (
        <CustomChip
          rounded
          size='small'
          skin='light'
          color={status.color}
          label={status.title}
          sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
        />
      )
    }
  },
  {
    flex: 0.20,
    minWidth: 140,
    field: 'CATEGORIA',
    headerName: 'CATEGORIA',
    sortable: false,
    renderCell: params => {
    const {row} = params
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography>
            {row.CATEGORIA}
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.1,
    minWidth: 130,
    sortable: false,
    field: 'ACCIONES',
    headerName: 'ACCIONES',
    sortable: false,
    renderCell: params => {
      const {row} = params

      return(
      <Fragment>
        <IconButton>
          <Icon icon='tabler:trash' />
        </IconButton>
        <IconButton component={Link} href={`../nov-edit/${row.ID}`}>
        <Icon icon='tabler:eye' />
        </IconButton>
      </Fragment>
      )
    }
  },
]



const NovedadesView = () => {
  const [data,setData] = useState({PENDIENTES:0,CANT_NOVEDADES:0,FINALIZADAS:0,TABLA:[]})
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const { hdr_id } = router.query;

const espera2Segundos = () => new Promise(resolve => setTimeout(resolve, 1000))

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const hdr_id_int = parseInt(hdr_id,10)
      const res = await getNovHDR(hdr_id_int)
      console.log(res);
      setData(res);
    } catch (error) {
      console.log(error);
    } finally {
      await espera2Segundos();
      setLoading(false);
    }
  }
  fetchData()
}, [hdr_id])

if (loading) {
  return (
    <div style={{ display: 'flex', margin:'auto',justifyContent:'center', alignItems: 'center', width: '100%', height: '100vh' }}>
      <CircularProgress color='success' />
    </div>
  );
}

  return (

    <Box>
    <Typography variant='h4' sx={{mb:"30px"}}>NOVEDADES / HDR Actual</Typography>
    <Grid container spacing={2} sx={{ width: "100%",mb:"50px" }}>
      <Grid item xs={3}> <CustomTextField value={data.CANT_NOVEDADES} label="Cantidad de Novedades" disabled fullWidth /> </Grid>
      <Grid item xs={3}> <CustomTextField value={data.PENDIENTES} label="Pendientes" disabled fullWidth /></Grid>
      <Grid item xs={3}><CustomTextField value={data.FINALIZADAS} label="Finalizadas" disabled fullWidth /> </Grid>
    </Grid>

    <Card>
      <CardHeader title='NOVEDADES' />
      <CardContent>
         <DataGrid
          autoHeight
          fullWidth
          disableColumnFilter
          disableColumnMenu
          disableRowSelectionOnClick
          disableColumnSelector
          rows={data.TABLA}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[3]}
          getRowId={(row) => row.ID}
          />
      </CardContent>
    </Card>
    </Box>
  )
}
export default NovedadesView
