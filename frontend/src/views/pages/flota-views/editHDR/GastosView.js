import React from 'react'
import { Fragment, useEffect, useState } from 'react'
import { Box, CardContent, Grid, Typography } from '@mui/material'

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
import { getGasHDR } from 'src/services/flota_endpoints/gas_hdr'

 const  statusList ={
  "PENDIENTE": {title:'PENDIENTE', color: 'success'},
  "FINALIZADO": {title:'FINALIZADO', color: 'primary'},
  "ANULADA": {title:'ANULADA', color: 'info'},
  "FALLA": {title:'FALLA', color: 'error'},
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
    flex: 0.20,
    minWidth: 140,
    field: 'CATEGORIA',
    headerName: 'CATEGORIA',
    sortable: false,
    renderCell: params => {
    const {row} = params
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography >
            {row.CATEGORIA}
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.20,
    minWidth: 140,
    field: 'N COMPROBANTE',
    headerName: 'NRO COMPROBANTE',
    sortable: false,
    renderCell: params => {
    const {row} = params
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography >
            {row["N COMPROBANTE"]}
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.20,
    minWidth: 140,
    field: 'RAZON SOCIAL',
    headerName: 'RAZON SOCIAL',
    sortable: false,
    renderCell: params => {
    const {row} = params
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography >
            {row["RAZON SOCIAL"]}
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.20,
    minWidth: 140,
    field: 'MONTO',
    headerName: 'MONTO',
    sortable: false,
    renderCell: params => {
    const {row} = params
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography >
            {row.MONTO}
          </Typography>
        </Box>
      )
    }
  },
  /* {
    flex: 0.1,
    minWidth: 130,
    sortable: false,
    field: 'ACCIONES',
    headerName: 'ACCIONES',

    renderCell: params => {
      const {row} = params

      return(
      <IconButton>
        <Icon icon='tabler:trash' />
      </IconButton>
      )
    }
  }, */
]

const GastosView = () => {
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
      const res = await getGasHDR(hdr_id_int)
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
    <Typography variant='h4' sx={{mb:"30px"}}>GASTOS / HDR Actual</Typography>
    <Grid container spacing={2} sx={{ width: "100%",mb:"50px" }}>
      <Grid item xs={3}> <CustomTextField value={data.TOTAL_GASTOS} label="TOTAL DE GASTOS" disabled fullWidth /> </Grid>
      <Grid item xs={3}> <CustomTextField value={data.PEAJES} label="PEAJES" disabled fullWidth /></Grid>
      <Grid item xs={3}> <CustomTextField value={data.TOTAL_ADELANTOS} label="ADELANTOS" disabled fullWidth /></Grid>
    </Grid>

    <Card>
      <CardHeader title='GASTOS' />
      <CardContent>
         <DataGrid
          autoHeight
          fullWidth
          rows={data.TABLA}
          disableColumnFilter
          disableColumnMenu
          disableRowSelectionOnClick
          disableColumnSelector
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
export default GastosView
