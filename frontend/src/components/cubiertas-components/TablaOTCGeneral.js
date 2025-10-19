// ** React Imports
import { Fragment, forwardRef, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid, renderEditInputCell, renderEditSingleSelectCell } from '@mui/x-data-grid'

// ** Utils Import
import { Button, CircularProgress, FormLabel, Grid, IconButton, MenuItem, Select, TextField, useTheme } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { es } from 'date-fns/locale'
import ReactDatePicker from 'react-datepicker'
import ErrorDialog from '../ErrorDialog'
import { deleteOTC, deleteOTCGeneral, getAllOTC, getAllOTCGeneral, putOTC, putOTCEstado } from 'src/services/flota_endpoints/otc_flota'
import FiltroTablaDesplegable, { FiltroNombre } from '../formComponents/Filtros'
import DialogConfirmation from '../ConfirmDialog'
import { ConfirmOptionDialogList } from '../ConfirmOptionDialog'
import IconifyIcon from 'src/@core/components/icon'
import FormCrearOTCGeneral from './FormCrearOTCGeneral'
import FormCerrarOTCGeneral from './FormCerrarOTCGeneral'



const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    };
  }, [value, delay])

  return debouncedValue;
}

const TablaOTCGeneral = ({reload,setReload}) => {
  const [selectedRowID, setSelectedRowID] = useState(null);

  const eliminarOTCGeneral = async (id) => {
    try {
      const res = await deleteOTCGeneral(id)
    } catch (error) {
      console.log(error)
    }
    setReload(!reload)
  }

  const changeStateOTC = async (id,val) => {
    try {
      const res = await putOTCEstado(id,val)
    } catch (error) {
      console.log(error)
    }
    setReload(!reload)
  }

  // ** Columns
  const columns = [
    {
      flex:0.100,
      minWidth:90,
      field:'ID',
      headerName:'ID OTC',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.ID}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.11,
      minWidth:130,
      field:'FECHA',
      headerName:'FECHA',
      renderCell: params =>{
        const {row} = params
        const fechaObj = new Date(row.FECHA).toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' });
        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{fechaObj}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.100,
      minWidth:150,
      field:'PROVEEDOR',
      headerName:'PROVEEDOR',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.PROVEEDOR}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.100,
      minWidth:150,
      field:'DEPOSITO',
      headerName:'DEPOSITO',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.DEPOSITO}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.100,
      minWidth:150,
      field:'CANTIDAD DE CUBIERTAS',
      headerName:'CANT. CUBIERTAS',
      renderCell: params =>{
        const {row} = params
        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row["CANTIDAD DE CUBIERTAS"]}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.100,
      minWidth:150,
      field:'CANTIDAD DE TRABAJOS',
      headerName:'CANT. TRABAJOS',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row["CANTIDAD DE TRABAJOS"]}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.100,
      minWidth:150,
      field:'CUBIERTAS NROS INTERNOS',
      headerName:'NROS INTERNOS',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'center'}}>
            {row.CUBIERTAS_NROS_INTERNOS.map (nro => <Typography key={nro}>{nro},</Typography>)}
          </Box>
        )
      }
    },
    {
      flex:0.100,
      minWidth:150,
      field:'OBSERVACION',
      headerName:'OBSERVACION',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.OBSERVACION}</Typography>
          </Box>
        )
      }
    },

    {
      flex:0.100,
      minWidth:150,
      field:'ESTADO',
      headerName:'ESTADO',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.ESTADO}</Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 150,
      sortable: false,
      field: 'ACCIONES',
      headerName: 'ACCIONES',
      renderCell: params => {
        const {row} = params
        return(
          <Box sx={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center', gap:1}}>
            <DialogConfirmation message={"¿Quieres borrar esta OTC?"} onConfirm={eliminarOTCGeneral} id={row.ID} title={"Eliminar OTC"} iconName={"tabler:trash"} nameButton={"Borrar"}/>
            <Button variant="contained" startIcon={<IconifyIcon icon="carbon:edit" width={20} height={20} />} onClick={() => setSelectedRowID(row.ID)}>Editar</Button>
          </Box>
        )
      }
    },
  ]


  // ** States
  const [apiErrors, setApiErrors] = useState( [] )
  const [data,setData] = useState([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filtroNroInterno, setFiltroNroInterno] = useState("")
  const [filtroRecapado, setFiltroRecapado] = useState('')
  const [filtroProveedor, setFiltroProveedor] = useState('')
  const [filtroDeposito, setFiltroDeposito] = useState('')
  const [filtroNumeroOtc, setFiltroNumeroOtc] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const [open, setOpen] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const init = paginationModel.page * paginationModel.pageSize
      const startDateFormatted = formatearFecha(startDate);
      const endDateFormatted = formatearFecha(endDate);
      const res = await getAllOTCGeneral(0,100000,filtroNumeroOtc, filtroProveedor,filtroDeposito,  filtroEstado, startDateFormatted, endDateFormatted)
      setData(res.OTCS_LIST);
      setTotalRows(res.TOTAL);
      console.log(res)

    } catch (error) {
      console.log('Error al enviar la data:', error);

      if (error.response) {
          console.log("Respuesta completa del error:", error.response);
          const errorDetails = error.response.data.detail;
          if (Array.isArray(errorDetails)) {
            let arrayErrores = []
            for (error in errorDetails) {
              arrayErrores = [...arrayErrores,{error:422,message:errorDetails[error].msg}]
            }
            setApiErrors(arrayErrores); // Actualiza el estado con los mensajes de error
          } else {
              // Si 'errorDetails' no es un array, maneja el caso alternativo
              setApiErrors([{ error: 423, message: errorDetails}]);
          }
      } else {
          // Manejo de errores que no son de Axios
          console.error("Error en la solicitud que no proviene de una respuesta HTTP:", error.message);
      }
    } finally {
      setLoading(false);
    }
  }
  fetchData()
}, [paginationModel, startDate, endDate, filtroDeposito, filtroNumeroOtc , filtroProveedor, filtroEstado, reload]);



const handleStartDateChange = (date) => {
  const fechaFormatted = new Date(date).toLocaleDateString();
  setStartDate(fechaFormatted);
};

const handleEndDateChange = (date) => {
  const fechaFormatted = new Date(date).toLocaleDateString();

  setEndDate(fechaFormatted);
};

const formatearFecha = (fecha) => {
  if (fecha == "") {
    return null;
  }
  const dateObject = new Date(fecha);
  const formattedDate = dateObject.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' }).replace(/\//g, '-');

  return formattedDate;
};

  return (

    apiErrors.length > 0 ? <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores en la consulta'}/> :
    <Fragment>
      {(selectedRowID != null) && <FormCerrarOTCGeneral setReload={setReload} data={selectedRowID} open={selectedRowID!=null} onClose={() =>setSelectedRowID(null)} /> }
    <Card sx={{ padding: 2, mt: 6 }}>
      <CardHeader title='LISTADO DE ORDENES DE TRABAJOS DE CUBIERTAS' />
      <Box display={'flex'} sx={{ padding: 2 }}>
        <Box width={'15%'} sx={{ padding: 2 }}>
        <FiltroTablaDesplegable endpoint={"/params/proveedores/"} optionLabelKey={'prov_nombre'} optionValueKey={'id'} label={'Proveedor'} setValue={setFiltroProveedor} value={filtroProveedor} />
        </Box>
        <Box width={'15%'} sx={{ padding: 2 }}>
        <FiltroTablaDesplegable endpoint={"/params/deposito/"} optionLabelKey={'dep_nombre'} optionValueKey={'id'} label={'Deposito'} setValue={setFiltroDeposito} value={filtroDeposito} />
        </Box>
        <Box width={'15%'} sx={{ padding: 2 }}>
        <FiltroTablaDesplegable endpoint={"/params/estado/"} optionLabelKey={'est_nombre'} optionValueKey={'id'} label={'Estado'} setValue={setFiltroEstado} value={filtroEstado} />
        </Box>
        <Box width={'15%'} sx={{ padding: 2 }}>
        <FiltroNombre label={'Número de OTC'} value={filtroNumeroOtc} debounceDelay={500} setValue={setFiltroNumeroOtc} />
        </Box>
      </Box>



      <Grid container spacing={2} sx={{ padding: 6 }}>
        <Box sx={{mt: 5, display: 'flex',gap: 2, width: '100%', flexDirection: 'row'}}>
          <DatePickerWrapper>
            <ReactDatePicker
              selected={startDate? new Date(startDate) : null}
              onChange={(date) =>{handleStartDateChange(date)}}
              locale={es}
              customInput={<PickersComponent label={'Fecha de inicio'} />}
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy"
            />
          </DatePickerWrapper>
          <DatePickerWrapper>
            <ReactDatePicker
              selected={endDate? new Date(endDate) : null}
              onChange={(date) =>{handleEndDateChange(date)}}
              locale={es}
              customInput={<PickersComponent label={'Fecha de fin'} />}
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy"
            />
          </DatePickerWrapper>
        </Box>
      </Grid>
      <DataGrid
        autoHeight
        columns={columns}
        pageSizeOptions={[3 ,7 , 10, 25, 50]}
        paginationModel={paginationModel}
        getRowId={(row) => row.ID}
        rowCount={totalRows}
        rowHeight={80}
        editMode='row'
        paginationMode="server"
        loading={loading}
        onPaginationModelChange={setPaginationModel}
        rows={data}
        sx={{'& .MuiSvgIcon-root': {fontSize: '1.125rem'}}}
        slotProps={{baseButton: {size: 'medium',variant: 'outlined'}}}
      />
    </Card>
    </Fragment>
  )
}

export default TablaOTCGeneral


const PickersComponent = forwardRef(({ ...props }, ref) => {
  const { label, readOnly } = props

  return (
    <CustomTextField
      {...props}
      inputRef={ref}
      label={label || ''}
      {...(readOnly && { inputProps: { readOnly: true } })}
    />
  )
})
