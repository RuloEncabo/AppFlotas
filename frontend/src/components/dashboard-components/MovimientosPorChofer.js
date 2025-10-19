// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { Badge, CircularProgress, Skeleton, Tooltip, useTheme } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import { Fragment, useEffect, useState } from 'react'
import { getExcelMovimientosPorChofer, getMovimientosPorChofer } from 'src/services/flota_endpoints/metricas'
import FiltroTablaDesplegable, { FiltroFecha } from '../formComponents/Filtros'
import { DataGrid } from '@mui/x-data-grid'

const MovimientosPorChofer = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiErrors, setApiErrors] = useState([]);
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroChoferId, setFiltroChoferId] = useState("");
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {

      try {
        setIsLoading(true);
        if( filtroChoferId === null || filtroChoferId === "") {
          setData(null);
          return
        }

        const res = await getMovimientosPorChofer(filtroFechaDesde, filtroFechaHasta, filtroChoferId);
        console.log(res);
        setData(res || {});
        setApiErrors([]);
      } catch (error) {
        if (error.response) {
          setApiErrors([{ error: 423, message: error.response.data.detail }]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [ filtroChoferId, filtroFechaDesde, filtroFechaHasta ]);

  const handleDownloadXLSX = async () => {
    const response = await getExcelMovimientosPorChofer(filtroFechaDesde, filtroFechaHasta, filtroChoferId);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download',(`Movimientos_${filtroChoferId}_${new Date().toISOString().split('T')[0]}.xlsx`));
    document.body.appendChild(link);
    link.click();
  }


const columns = [
  {
    field: 'FECHA',
    headerName: 'Fecha Inicial',
    flex: 0.2,
    minWidth: 180,
    renderCell: (params) => {
      const fechaObj = new Date(params.row.FECHA);
      const opciones = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
      const fechaEnEspañol = fechaObj.toLocaleDateString('es-ES', opciones);
      return (
        <Box>
          <Typography>{fechaEnEspañol}</Typography>
        </Box>
      );
    },
  },
  {
    field: 'FECHA LLEGADA',
    headerName: 'Fecha Llegada',
    flex: 0.2,
    minWidth: 180,
    renderCell: (params) => {
      const fechaObj = new Date(params.row["FECHA LLEGADA"]);
      const opciones = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
      const fechaEnEspañol = fechaObj.toLocaleDateString('es-ES', opciones);
      return (
        <Box>
          <Typography>{fechaEnEspañol}</Typography>
        </Box>
      );
    },
  },
  {
    field: 'LUGAR DE INICIO',
    headerName: 'LUGAR DE FIN',
    flex: 0.2,
    minWidth: 180,
    renderCell: (params) => {
      return (
        <Box>
          <Typography>{params.row["LUGAR DE INICIO"]}</Typography>
        </Box>
      );
    },
  },
  {
    field: 'LUGAR DE FIN',
    headerName: 'LUGAR DE FIN',
    flex: 0.2,
    minWidth: 180,
    renderCell: (params) => {
      return (
        <Box>
          <Typography>{params.row["LUGAR DE FIN"]}</Typography>
        </Box>
      );
    },
  },
  {
    field: 'KM RECORRIDOS',
    headerName: 'KM Recorridos',
    flex: 0.15,
    minWidth: 150,
    renderCell: (params) => (
      <Box>
        <Typography>{params.row["KM RECORRIDOS"]}</Typography>
      </Box>
    ),
  },
  {
    field: 'DIAS DE PERMANENCIA',
    headerName: 'Días de Permanencia',
    flex: 0.15,
    minWidth: 150,
    renderCell: (params) => (
      <Box>
        <Typography>{params.row["DIAS DE PERMANENCIA"]}</Typography>
      </Box>
    ),
  },
  {
    field: 'TIPO DE KM',
    headerName: 'Tipo de KM',
    flex: 0.15,
    minWidth: 150,
    renderCell: (params) => (
      <Box>
        <Typography>{params.row["TIPO DE KM"]}</Typography>
      </Box>
    ),
  },
  {
    field: 'LLEVA CARGA',
    headerName: 'Lleva Carga',
    flex: 0.1,
    minWidth: 120,
    renderCell: (params) => (
      <Box>
        <Typography>{params.row["LLEVA CARGA"] ? 'Sí' : 'No'}</Typography>
      </Box>
    ),
  },

];


  return (
    <Fragment>
      <Box sx={{ display: 'flex', gap: 3, width: '100%', flexWrap: 'wrap' }}>
        <Card sx={{ height: 'auto', width: '100%', padding: 2 }}>
          <CardHeader title="MOVIMIENTOS POR CHOFER" />
            <CardContent>
              <>
              <Box sx={{ display: 'flex', gap: 3, width: '100%', flexWrap: 'wrap',mb:4 }}>
                <Box width={240}><FiltroTablaDesplegable endpoint={"/params/chofer/"} optionValueKey={"chofer_id"} optionLabelKey={"fullname"} label={"Chofer"} value={filtroChoferId} setValue={setFiltroChoferId}/></Box>
                <FiltroFecha label={"Fecha desde"} value={filtroFechaDesde} setValue={setFiltroFechaDesde} mostrarTiempo={false} dateFormat="dd-MM-yyyy" timeFormat="HH:mm"/>
                <FiltroFecha label={"Fecha hasta"} value={filtroFechaHasta} setValue={setFiltroFechaHasta} mostrarTiempo={false} dateFormat="dd-MM-yyyy" timeFormat="HH:mm"/>
              </Box>
                <Box>


                { data &&
                <>
                <IconButton variant='circular' width={40} height={40}  color='success' onClick={()=>handleDownloadXLSX()}>
                  Descargar <Icon fontSize='1.625rem' icon={'tabler:file-spreadsheet'} color='accent' />
                </IconButton>
                <DataGrid
                  rows={data}
                  loading={isLoading}
                  columns={columns}
                  pageSize={5}
                  getRowId={(row) => row["MOVIMIENTO ID"]}
                  autoHeight
                /></>}
                </Box>
              </>
            </CardContent>
        </Card>
      </Box>
    </Fragment>
  );
};

export default MovimientosPorChofer;
