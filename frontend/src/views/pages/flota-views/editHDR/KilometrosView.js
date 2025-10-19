import React from 'react'
import { Fragment, useEffect, useState } from 'react'
import { Box, CardContent, Grid, Tooltip, Typography } from '@mui/material'

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

const  statusList ={
  false : {title:'SIN CARGA', color: 'warning'},
  true : {title:'CARGADO', color: 'primary'},
}


const columns = [

  {
    flex:0.12,
    minWidth:150,
    field:'FECHA',
    headerName:'FECHA INICIAL',
    sortable: false,
    renderCell: params =>{
      const {row} = params
      const fechaObj = new Date(row.FECHA);
      const opciones = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
      const fechaEnEspañol = fechaObj.toLocaleDateString('es-ES', opciones);
      const fechaSistema = new Date(row["FECHA REGISTRADA"]).toLocaleDateString('es-ES', opciones);

      const diferenciaFechas = new Date(row["FECHA REGISTRADA"]) - new Date(row.FECHA); // compara las fechas
      const backgroundColor = diferenciaFechas !== 0 ? 'lightcoral' : 'transparent'; // cambiar color basado en la diferencia

      return (
        <Box sx={{display:'flex', flexDirection:'column', backgroundColor, alignItems:'center',justifyContent:'center'}}>
          <Tooltip
            title={`Sistema: ${fechaSistema}`}
            placement='top'
          >
          <Typography> {fechaEnEspañol}</Typography>
          </Tooltip>
        </Box>
      )
    }
  },
  {
    flex: 0.12,
    minWidth: 150,
    field: 'FECHALLEGADA',
    headerName: 'FECHA FINAL',
    sortable: false,
    renderCell: params => {
      const { row } = params
      const fechaObj = new Date(row["FECHA LLEGADA"]);
      const opciones = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
      const fechaEnEspañol = fechaObj.toLocaleDateString('es-ES', opciones);
      const fechaLlegadaSistema = new Date(row["FECHA LLEGADA REGISTRADA"]).toLocaleDateString('es-ES', opciones);

      const diferenciaFechas = (new Date(row["FECHA LLEGADA REGISTRADA"]) - new Date(row["FECHA LLEGADA"]));
      const backgroundColor = diferenciaFechas !== 0 ? 'lightcoral' : 'transparent';

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor, alignItems: 'center', justifyContent: 'center' }}>
          <Tooltip
            title={`Sistema: ${fechaLlegadaSistema}`}
            placement='top'
          >
            <Typography>{fechaEnEspañol}</Typography>
          </Tooltip>
        </Box>
      )
    }
  },
  {
    flex: 0.22,
    minWidth: 200,
    field: 'SALIDA',
    headerName: 'KM DE SALIDA',
    sortable: false,
    renderCell: params => {
      const { row } = params
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center',  width: '50%' }}>
          <Typography>
            {row.SALIDA}
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.22,
    minWidth: 200,
    field: 'LLEGADA',
    headerName: 'KM DE LLEGADA',
    sortable: false,
    renderCell: params => {
      const { row } = params
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center',  width: '50%' }}>
          <Typography >
            {row.LLEGADA}
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.22,
    minWidth: 200,
    field: 'DIFERENCIA',
    headerName: 'KM RECORRIDO',
    sortable: false,
    renderCell: params => {
      const { row } = params
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center',  width: '50%' }}>
          <Typography>
            {row.DIFERENCIA}
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.22,
    minWidth: 200,
    field: 'PERMANENCIAS',
    headerName: 'PERMANECIAS',
    sortable: false,
    renderCell: params => {
      const { row } = params
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center',  width: '50%' }}>
          <Typography>
            {row.PERMANENCIAS}
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.22,
    minWidth: 200,
    field: 'TIPO_KILOMETRO',
    headerName: 'TIPO KILOMETRO',
    sortable: false,
    renderCell: params => {
      const { row } = params
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center',  width: '50%' }}>
          <Typography>
            {row["TIPO KM"]}
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.22,
    minWidth: 200,
    field: 'INFRACCION',
    headerName: 'INFRACCION',
    sortable: false,
    renderCell: params => {
      const { row } = params
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center',  width: '50%' }}>
          <Typography>
            {row.INFRACCION == true ? 'SI' : 'NO'}
          </Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.20,
    minWidth: 140,
    field: 'status',
    headerName: 'ESTADO',
    sortable: false,
    renderCell: params => {
      const {row} = params
      const status = statusList[row.CARGADO]

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
]

const KilometrosView = () => {
  const [data,setData] = useState({KM_ACTUALES:0,KM_INICIALES:0,KM_RECORRIDOS:0,TABLA:[]})
  const [loading, setLoading] = useState(false)


  const router = useRouter();
  const { hdr_id } = router.query;

const espera2Segundos = () => new Promise(resolve => setTimeout(resolve, 1000))

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const hdr_id_int = parseInt(hdr_id,10)
      const res = await getKmHDR(hdr_id_int)
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
}, [hdr_id, router.isReady])

if (loading) {
  return (
    <div style={{ display: 'flex', margin:'auto',justifyContent:'center', alignItems: 'center', width: '100%', height: '100vh' }}>
      <CircularProgress color='success' />
    </div>
  );
}

  return (

    <Box>
    <Typography variant='h4' sx={{mb:"30px"}}>Kilometros/ HDR Actual</Typography>
    <Grid container spacing={2} sx={{ width: "100%",mb:"50px" }}>
      <Grid item xs={3}> <CustomTextField value={data.KM_ACTUALES} label="Kilometros Actuales" disabled fullWidth /> </Grid>
      <Grid item xs={3}> <CustomTextField value={data.KM_INICIALES} label="Kilometros Iniciales" disabled fullWidth /></Grid>
      <Grid item xs={3}><CustomTextField value={data.KM_RECORRIDOS} label="Kilometros Recorridos" disabled fullWidth /> </Grid>
    </Grid>

    <Card>
      <CardHeader title='Kilometros / Movimientos' />
      <CardContent>
      <Box sx={{ height: 400, width: '100%' }}>
      <Box sx={{
        display: 'flex',

        padding: '0 16px',
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
        }}>
        <Typography variant='h5' sx={{ml:"250px"}}>INICIO</Typography>
        <Typography variant='h5' sx={{ml:"350px"}}>FIN</Typography>
      </Box>
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
        </Box>
      </CardContent>

    </Card>

    </Box>
  )
}
export default KilometrosView
