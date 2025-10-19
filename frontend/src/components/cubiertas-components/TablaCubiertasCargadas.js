// ** React Imports
import { Fragment, forwardRef, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'

// ** Utils Import
import { CircularProgress, FormLabel, Grid, IconButton, MenuItem, Select, TextField, useTheme } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { es } from 'date-fns/locale'
import ReactDatePicker from 'react-datepicker'
import ErrorDialog from '../ErrorDialog'
import { getAllCubiertas } from 'src/services/flota_endpoints/cubiertas_flota'
import FormModificarCubierta from './FormModificarCubierta'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { ControladorCargaComboAsync } from '../formComponents/ControladorCargaCombo'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'



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

const TablaCubiertasCargadas = ({reload,setReload}) => {

  // ** Columns
  const columns = [
    {
      flex:0.22,
      minWidth:130,
      field:'cub_fecha_alta',
      headerName:'FECHA DE ALTA',
      renderCell: params =>{
        const {row} = params
        const formatedDate = new Date(row.CUBIERTA.cub_fecha_alta).toLocaleDateString('es-ES');
        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{formatedDate}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.100,
      minWidth:100,
      field:'cub_nro_interno',
      headerName:'NÚMERO INTERNO',
      renderCell: params =>{
        const {row} = params
        const theme = useTheme()
        return (
          <Box sx={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <Typography variant='h5' color={theme.palette.text.primary}>#{row.CUBIERTA.cub_nro_interno}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.100,
      minWidth:170,
      field:'cub_km_recorridos',
      headerName:'KM',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.CUBIERTA.cub_km_recorridos}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.06,
      minWidth:130,
      field:'cub_km_totales',
      headerName:'KM TOTALES',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.CUBIERTA.cub_km_totales}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.100,
      minWidth:170,
      field:'KM_ROTAR',
      headerName:'KM EN LA MISMA POSICIÓN',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.KM_ROTAR}</Typography>
          </Box>
        )
      }
    },


    {
      flex: 0.18,
      minWidth: 130,
      field: 'DEPOSITO',
      headerName: 'DEPOSITO',
      renderCell: params => {
      const {row} = params
        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Typography>{row.DEPOSITO}</Typography>
        </Box>
        )
      }
    },

    {
      flex: 0.22,
      minWidth: 200,
      field: 'cub_modelo',
      headerName: 'MODELO',
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Typography>{row.CUBIERTA.cub_modelo}</Typography>
        </Box>
        )
      }
    },

    {
      flex: 0.22,
      minWidth: 120,
      field: 'cub_marca',
      headerName: 'MARCA',
      renderCell: params => {

        const theme = useTheme()
        const { row } = params
        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Typography>{row.CUBIERTA.cub_marca}</Typography>
        </Box>
        )
      }
    },

    {
      flex:0.100,
      minWidth:150,
      field:'cub_mm',
      headerName:'MM',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.CUBIERTA.cub_mm}</Typography>
          </Box>
        )
      }
    },

    {
      flex:0.100,
      minWidth:170,
      field:'cub_medida',
      headerName:'MEDIDA',
      renderCell: params =>{
        const {row} = params

        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.CUBIERTA.cub_medida}</Typography>
          </Box>
        )
      }
    },
    {
      flex:0.100,
      minWidth:170,
      field:'cub_cant_recapados',
      headerName:'CANT RECAPADOS',
      renderCell: params =>{
        const {row} = params
        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{row.CUBIERTA.cub_cant_recapados}</Typography>
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
      renderCell: params => {

        const {row} = params
        return(
          <IconButton key={row.CUBIERTA.id} onClick= {() => handleClickOpen(row)}>
            <Icon icon="mdi:pencil-outline" />
          </IconButton>
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
  const [filtroDeposito, setFiltroDeposito] = useState("")
  const [filtroMarca, setFiltroMarca] = useState('')
  const [sortModel, setSortModel] = useState(null)

  const scheme = yup.object().shape({

  })

    const {
      control,
      reset,
      handleSubmit,
      resetField,
      formState: { errors }
    } = useForm({ defaultValues: {}, mode: 'onChange', resolver: yupResolver(scheme) ,})


  // estados del formulario modificar
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(false);


  const debouncedFiltroNroInterno = useDebounce(filtroNroInterno, 1000);
  const debouncedFiltroModelo = useDebounce(filtroModelo, 1000);
  const debouncedFiltroMarca = useDebounce(filtroMarca, 1000);




useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const init = paginationModel.page * paginationModel.pageSize

      //formatear fechas
      const startDateFormatted = formatearFecha(startDate);
      const endDateFormatted = formatearFecha(endDate);

      let columname = null;
      let booleano = null;

      if( sortModel != null){
        columname = sortModel[0]?.field || '';
        booleano = sortModel[0]?.sort === 'asc' ? true : sortModel[0]?.sort === 'desc' ? false : null;
      }

      // Llama a tu API con el valor correcto de 'init' y 'pageSize'
      const res1 = await getAllCubiertas(
        init,
        paginationModel.pageSize,
        debouncedFiltroNroInterno,
        startDateFormatted,
        endDateFormatted,
        debouncedFiltroModelo,
        debouncedFiltroMarca,
        "ACTIVA",
        filtroDeposito,
        null,
        columname,
        booleano
      )

      const res2 = await getAllCubiertas(
        init,
        paginationModel.pageSize,
        debouncedFiltroNroInterno,
        startDateFormatted,
        endDateFormatted,
        debouncedFiltroModelo,
        debouncedFiltroMarca,
        "MOVIMIENTO INTERNO",
        filtroDeposito,
        null,
        columname,
        booleano
      )

      const rowsData = [...res1.CUB_LIST,...res2.CUB_LIST];
      setData(rowsData);
      setTotalRows(res1.TOTAL + res2.TOTAL);

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
}, [paginationModel,debouncedFiltroNroInterno, debouncedFiltroModelo, filtroDeposito ,startDate, endDate,debouncedFiltroMarca, reload]);


// Abre el dialog de modificar
const handleClickOpen = (row) => {
  setSelectedRow(row);
  setOpen(true);
};
// Cierra el dialog
const handleClose = async() => {
  setSelectedRow(null);
  setOpen(false);
};

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

  return (

    apiErrors.length > 0 ? <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores en la consulta'}/> :
    <Fragment>
       {selectedRow && <FormModificarCubierta setReload={setReload} data={selectedRow} open={open} onClose={handleClose} /> }
    <Card>
      <CardHeader title='Cubiertas Cargadas' />
      <Grid container spacing={2} sx={{ padding: 2 }}>
        <Grid item xs={3}>
          <CustomTextField
            fullWidth
            label="Nro. Interno"
            variant="outlined"
            value={filtroNroInterno}
            onChange={(e) => handleFilterChange(e, 'chofer')}
          />
        </Grid>
        <Grid item xs={3}>
          <CustomTextField
            fullWidth
            label="Filtro Modelo"
            variant="outlined"
            value={filtroModelo}
            onChange={(e) => handleFilterChange(e, 'flota')}
          />
        </Grid>

        <Grid item xs={3}>
          <ControladorCargaComboAsync
            control={control}
            name='filtroDeposito'
            label='Filtro Deposito'
            endpoint={'/params/deposito/'}
            onChangeOptional={(value) => {
              setFiltroDeposito(value)
            }}
            removeKeys={[]}
            removeLabels={[]}
            optionValueKey='id'
            optionLabelKey='dep_nombre'
            disabled={false}
          />
        </Grid>

        <Grid item xs={3}>

          <CustomTextField
            fullWidth
            label="Filtro Marca"
            variant="outlined"
            value={filtroMarca}
            onChange={(e) => setFiltroMarca(e.target.value)}
          />
        </Grid>
        <Grid item sx={{mb: 5}}>
        <Box sx={{mt: 5, display: 'flex',gap: 2, flexDirection: 'row'}}>

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

      </Grid>
      <DataGrid
        autoHeight
        columns={columns}
        pageSizeOptions={[3 ,7 , 10, 25, 50]}
        paginationModel={paginationModel}
        getRowId={(row) => row.CUBIERTA.cub_id}
        rowCount={totalRows}
        paginationMode="server"
        loading={loading}
        onPaginationModelChange={setPaginationModel}
        onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
        rows={ data}
        sx={{
          '& .MuiSvgIcon-root': {
            fontSize: '1.125rem'
          }
        }}
        slotProps={{
          baseButton: {
            size: 'medium',
            variant: 'outlined'
          },

        }}
      />
    </Card>
    </Fragment>
  )
}

export default TablaCubiertasCargadas


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
