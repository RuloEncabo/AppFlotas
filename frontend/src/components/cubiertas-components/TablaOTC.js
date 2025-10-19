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
import { getAllCubiertas } from 'src/services/flota_endpoints/cubiertas_flota'
import FormModificarCubierta from './FormModificarCubierta'
import { deleteOTC, getAllOTC, putOTC, putOTCEstado } from 'src/services/flota_endpoints/otc_flota'
import FiltroTablaDesplegable from '../formComponents/Filtros'
import DialogConfirmation from '../ConfirmDialog'
import { ConfirmOptionDialogList } from '../ConfirmOptionDialog'
import IconifyIcon from 'src/@core/components/icon'
import FormCrearOTCGeneral from './FormCrearOTCGeneral'



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

const TablaOTC = ({reload,setReload}) => {

  const eliminarOTC = async (id) => {
    try {
      const res = await deleteOTC(id)
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
      headerName:'ID',
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
      field:'CUB NRO INTERNO',
      headerName:'NRO INTERNO',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.CUBIERTA_NRO_INTERNO}</Typography>
          </Box>
        )
      }
    },
   /*  {
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
    }, */
    {
      flex:0.100,
      minWidth:150,
      field:'MODELO',
      headerName:'MODELO',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.MODELO}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.100,
      minWidth:150,
      field:'MM',
      headerName:'MM',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.MM}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.100,
      minWidth:150,
      field:'TIPO',
      headerName:'TIPO DE TRABAJO',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.TIPO}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.100,
      minWidth:150,
      field:'TRABAJO',
      headerName:'TRABAJO REALIZADO',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.TRABAJO}</Typography>
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
        console.log(row)
        return(
          !(row.ESTADO === "CERRADA")&&
          <Box sx={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center', gap:1}}>
            <DialogConfirmation message={"¿Quieres borrar esta tarea?"} onConfirm={eliminarOTC} id={row.ID} title={"Eliminar Tarea"} iconName={"tabler:trash"} nameButton={"Borrar"}/>
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
  const [filtroModelo, setFiltroModelo] = useState("")
  const [filtroRecapado, setFiltroRecapado] = useState('')
  const [filtroProveedor, setFiltroProveedor] = useState('')
  const [filtroTipoTratamiento, setFiltroTipoTratamiento] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [selectedRows, setSelectedRows] = useState([]);

  // estados del formulario modificar
  const [open, setOpen] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const init = paginationModel.page * paginationModel.pageSize

      const startDateFormatted = formatearFecha(startDate);
      const endDateFormatted = formatearFecha(endDate);
      const res = await getAllOTC(0, 100000,filtroTipoTratamiento,filtroModelo,filtroEstado,startDateFormatted,endDateFormatted,)

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
}, [paginationModel, startDate, endDate, filtroModelo, filtroRecapado, filtroTipoTratamiento, filtroEstado, reload]);



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

const handleFilterChange = (e, filterType) => {
  if (filterType === 'chofer') {
    setFiltroNroInterno(e.target.value)
  } else if (filterType === 'flota') {
    setFiltroModelo(e.target.value)
  }
}



const handleRowSelection = (selection) => {
  const selectedData = data.filter(row =>
    selection.includes(row['ID'])
  );
  setSelectedRows(selectedData);
};


  return (

    apiErrors.length > 0 ? <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores en la consulta'}/> :
    <Fragment>
      {open && <FormCrearOTCGeneral setReload={setReload} data={selectedRows} open={open} onClose={() => setOpen(false)} /> }
    <Card sx={{ padding: 2, mt: 6 }}>
      <CardHeader title='LISTADO DE TRABAJOS DE CUBIERTAS' />
      <Box display={'flex'} sx={{ padding: 2 }}>
        <Box width={'15%'} sx={{ padding: 2 }}>
        <FiltroTablaDesplegable endpoint={"/params/marcas_modelos/"} optionLabelKey={'modelo'} optionValueKey={'id'} label={'Modelo'} setValue={setFiltroModelo} value={filtroModelo} />
        </Box>
        <Box width={'15%'} sx={{ padding: 2 }}>
        <FiltroTablaDesplegable endpoint={"/params/tipo_tratamiento/"} optionLabelKey={'tt_des'} optionValueKey={'id'} label={'Tipo de Tratamiento'} setValue={setFiltroTipoTratamiento} value={filtroTipoTratamiento} />
        </Box>
        <Box width={'15%'} sx={{ padding: 2 }}>
        <FiltroTablaDesplegable endpoint={"/params/estado/"} optionLabelKey={'est_nombre'} optionValueKey={'est_nombre'} label={'Estado'} setValue={setFiltroEstado} value={filtroEstado} />
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

          <Button
            sx={{ ml: 'auto'}}
            onClick={() => setOpen(true)}
            variant="contained"
            disabled={selectedRows.length === 0 || selectedRows.some(row => (row['ESTADO'] === "CERRADA" || row['ESTADO'] === "PENDIENTE") )}
            startIcon={<IconifyIcon icon="ic:baseline-add" width={20} height={20} />}>
            Crear OTC
          </Button>

        </Box>
      </Grid>
      <DataGrid
        autoHeight
        columns={columns}
        checkboxSelection = {true}
        onRowSelectionModelChange={handleRowSelection}
        selectionModel={selectedRows}
        pageSizeOptions={[3 ,7 , 10, 25, 50]}
        paginationModel={paginationModel}
        getRowId={(row) => row.ID}
        rowCount={totalRows}
        rowHeight={80}
        editMode='row'
        paginationMode="server"
        loading={loading}
        onPaginationModelChange={setPaginationModel}
        rows={ data}
        sx={{'& .MuiSvgIcon-root': {fontSize: '1.125rem'}}}
        slotProps={{baseButton: {size: 'medium',variant: 'outlined'}}}
      />
    </Card>
    </Fragment>
  )
}

export default TablaOTC


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
