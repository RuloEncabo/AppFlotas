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
import { getCombHDR } from 'src/services/flota_endpoints/comb_hdr'
import { color } from '@mui/system'

/* const  statusList ={
  "PENDIENTE": {title:'PENDIENTE', color: 'success'},
  "FINALIZADO": {title:'FINALIZADO', color: 'primary'},
  "ANULADA": {title:'ANULADA', color: 'info'},
  "FALLA": {title:'FALLA', color: 'error'},
}
 */
const  statusList ={
  false : {title:'PENDIENTE', color: 'warning'},
  true : {title:'FINALIZADO', color: 'primary'},
}


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
    field: 'LITROS',
    headerName: 'LITROS DE COMB',
    sortable: false,
    renderCell: params => {
      const { row } = params

      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography >
            {row.LITROS}
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.22,
    minWidth: 200,
    field: 'SUCURSAL',
    headerName: 'SUCURSAL',
    sortable: false,
    renderCell: params => {
      const { row } = params
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography >
            {row.SUCURSAL}
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.22,
    minWidth: 130,
    field: 'KM',
    headerName: 'KM',
    sortable: false,
    renderCell: params => {
      const { row } = params

      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography>
            {row.KM}
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.12,
    minWidth: 140,
    field: 'CC',
    headerName: 'COMPLETA',
    sortable: false,
    renderCell: params => {
      const { row } = params

      return (
        <Box sx={{ display: 'flex',width: '75%' ,justifyContent: 'center', alignItems: 'center' }}>
          <Typography>
            <b>{row["CARGA COMPLETA"]===true ? 'SI':'NO'}</b>
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.22,
    minWidth: 200,
    field: 'CONSUMO',
    headerName: 'CONSUMO',
    sortable: false,
    renderCell: params => {
      const { row } = params
      var color = 'green'
      if (row["CONSUMO"] > 0.4) {
       color = 'error'
      } else if (row["CONSUMO"] > 0.37) {
        color = 'warning'
      } else {
        color = 'success'
      }

      return (
        <CustomChip rounded size='small' skin='light' color={color} label={row["CONSUMO"].toFixed(2)}>
          <Typography >
            {row["CONSUMO"].toFixed(2)}
          </Typography>
        </CustomChip>
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

const CombustibleView = (consumoGral) => {
  const [data,setData] = useState({LT_COMBUSTIBLE:0,LT_UREA:0,TABLA:[]})
  const [dataTabla,setDataTabla] = useState([])
  const [loading, setLoading] = useState(false)

  const router = useRouter();
  const { hdr_id } = router.query;

const espera2Segundos = () => new Promise(resolve => setTimeout(resolve, 1000))

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const hdr_id_int = parseInt(hdr_id,10)
      const res = await getCombHDR(hdr_id_int)
      console.log(res);
      if (res.TABLA.length > 0) {
        res.TABLA.shift()
        var dataFiltred = res.TABLA
        setDataTabla(dataFiltred)
      }

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

let consumoGralFix
if (consumoGral !== undefined && consumoGral !== null) {
   const varFloat = parseFloat(consumoGral.consumoGral)
   consumoGralFix = varFloat.toFixed(2)
}

  return (

    <Box>
    <Typography variant='h4' sx={{mb:"30px"}}>Cargas combustibles/ HDR Actual</Typography>
    <Grid container spacing={2} sx={{ width: "100%",mb:"50px" }}>
      <Grid item xs={3}> <CustomTextField value={data.LT_COMBUSTIBLE} label="Total Combustible" disabled fullWidth /> </Grid>
      <Grid item xs={3}> <CustomTextField value={data.LT_UREA} label="LT Urea" disabled fullWidth /></Grid>
      <Grid item xs={3}>
        {/* redondear a dos decimales */}
      <CustomTextField value={consumoGralFix !== undefined ? consumoGralFix : 0} disabled label="Consumo" fullWidth />
      </Grid>
    </Grid>

    <Card>
      <CardHeader title='Combustible / Cargas' />
      <CardContent>
         <DataGrid
          autoHeight
          fullWidth
          rows= {dataTabla}
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
export default CombustibleView
