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
import { getHistoricoHDR } from 'src/services/flota_endpoints/historico_hdr'
import { da } from 'date-fns/locale'
import { ValueSetter } from 'date-fns/parse/_lib/Setter'

/* const  statusList ={
  "PENDIENTE": {title:'PENDIENTE', color: 'success'},
  "FINALIZADO": {title:'FINALIZADO', color: 'primary'},
  "ANULADA": {title:'ANULADA', color: 'info'},
  "FALLA": {title:'FALLA', color: 'error'},
}
 */
const  statusList ={
  false : {title:'SIN CARGA', color: 'warning'},
  true : {title:'CARGADO', color: 'primary'},
}


const columns = [
  // Columna de Fecha, que ya tienes definida
  {
    flex:0.22,
    minWidth:240,
    field:'FECHA',
    headerName:'FECHA',
    sortable: false,
    renderCell: params =>{
      return (
        <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Typography>{params.row.fecha}</Typography>
        </Box>
      )
    }
  },
  // Columna de Tipo de Movimiento/Carga/Novedad/Gasto
  {
    flex: 0.20,
    minWidth: 220,
    field: 'TIPO',
    headerName: 'TIPO',
    sortable: false,
    valueGetter: (params) => params.row.tipo,
    renderCell: (params) => (
      <Typography>{params.row.tipo}</Typography>
    ),
  },
  // KM  (aplicable para movimientos)
  {
    flex: 0.20,
    minWidth: 150,
    field: 'KM',
    headerName: 'KM',
    sortable: false,
    renderCell: (params) => (
      <Typography>{params.row.km}</Typography>
    ),
  },

  // CANTIDAD (aplicable para movimientos)
  {
    flex: 0.20,
    minWidth: 200,
    field: 'LTS COMBUSTIBLE',
    headerName: 'LTS COMBUSTIBLE',
    sortable: false,
    renderCell: (params) => (
      <Typography>{params.row.ltsComb}</Typography>
    ),
  },
  //MONTO
  {
    flex: 0.20,
    minWidth: 150,
    field: 'MONTO',
    headerName: 'MONTO',
    sortable: false,
    renderCell: (params) => (
      <Typography>{params.row.monto}</Typography>
    ),
  },
  // CATEG
  {
    flex: 0.20,
    minWidth: 150,
    field: 'CATEG',
    headerName: 'CATEGORIA NOV',
    sortable: false,
    renderCell: (params) => (
      <Typography>{params.row.catNovedad}</Typography>
    ),
  },
];


const HistoricoView = () => {
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const { hdr_id } = router.query;

const [data,setData] = useState([])

const espera2Segundos = () => new Promise(resolve => setTimeout(resolve, 1000))

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const hdr_id_int = parseInt(hdr_id,10)
      const res = await getHistoricoHDR(hdr_id_int)
      console.log("LA RES ES: ",res);
      setData(preprocesarDatos(res));
    } catch (error) {
      console.log(error);
    } finally {
      await espera2Segundos();
      //console.log("LA DATA ES: ",data)
      setLoading(false);
    }
  }
  fetchData()
}, [hdr_id])

const preprocesarDatos = (datos) => {
  //console.log("tengo estos datos: ", datos);
  const lista = [];
  datos.map((item, index ) => {
    const fecha = new Date(item.FECHA).toLocaleString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric' , hour: '2-digit', minute: '2-digit', second: '2-digit', }) || "-";
    //console.log(`Tipo de movimiento: '${item.TIPO_MOVIMIENTO}'`);

    const id = index
    const tipo = (item.TIPO_MOVIMIENTO == "SALIDA")? " MOVIMIENTO DE SALIDA" : (item.TIPO == "MOVIMIENTO")?"MOVIMIENTO DE LLEGADA" : item.TIPO || "-";
    const km = item.KM_SALIDA || item.KM_LLEGADA ||  item.KM || "-";
    const ltsComb = item.LTS_COMB || "-";
    const monto = item.MONTO? `$${item.MONTO}` : "-";
    const catNovedad = item.CAT_NOVEDAD || "-";
    // agregar a la lista
    lista.push({
      id,
      fecha,
      tipo,
      km,
      ltsComb,
      monto,
      catNovedad
    });

  });
  return lista;
};

if (loading) {
  return (
    <div style={{ display: 'flex', margin:'auto',justifyContent:'center', alignItems: 'center', width: '100%', height: '100vh' }}>
      <CircularProgress color='success' />
    </div>
  );
}

  return (

    <Box>
    <Typography variant='h4' sx={{mb:"30px"}}>Historico de acciones sobre la HDR #{hdr_id}</Typography>

    <Card>
      <CardHeader title='Kilometros / Movimientos' />
      <CardContent>
        <DataGrid
          autoHeight
          fullWidth
          rows={data}
          disableColumnMenu
          disableColumnFilter
          disableRowSelectionOnClick
          disableColumnSelector
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[3]}
          getRowId={row => row.id}
        />
      </CardContent>
    </Card>
    </Box>
  )
}
export default HistoricoView
