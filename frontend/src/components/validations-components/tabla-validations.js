// ** React Imports
import { Fragment, forwardRef, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'
import CustomChip from 'src/@core/components/mui/chip'

// ** Custom Components
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import { getAllHDR } from 'src/services/flota_endpoints/hdr_admin'
import { CircularProgress, FormLabel, Grid, IconButton, MenuItem, Select, TextField, Tooltip, useTheme } from '@mui/material'
import Icon from 'src/@core/components/icon'
import Link from 'next/link'
import CustomTextField from 'src/@core/components/mui/text-field'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { es } from 'date-fns/locale'
import ReactDatePicker from 'react-datepicker'
import FormRealizarValidacion from './FormRealizarValidacion'

// ** renders client column
const renderClient = params => {
  const { row } = params
  const stateNum = Math.floor(Math.random() * 6)
  const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const color = states[stateNum]

    return (
      <CustomAvatar skin='light' color={color} sx={{ mr: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}>
        {getInitials(row.CHOFER ? row.CHOFER : 'Sin nombre')}
      </CustomAvatar>
    )
}


const statusRendida = {
  false: { title: 'SIN VALIDAR', color: 'info' },
  true: { title: 'VALIDADA', color: 'success' },
}


const escapeRegExp = value => {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

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

const TablaValidations = ({reset,setReset}) => {
  // ** States
  const [data,setData] = useState([])
  const [searchText, setSearchText] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0);
  const [filtroChofer, setFiltroChofer] = useState("")
  const [filtroFlota, setFiltroFlota] = useState("")
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cardInfo, setCardInfo] = useState({})
  const [estadoHDR, setEstadoHDR] = useState(false)
  const [open,setOpen] = useState(false)
  const [selectedRow,setSelectedRow] = useState(null)
  const [sortModel, setSortModel] = useState();


  const debouncedFiltroChofer = useDebounce(filtroChofer, 1000);
  const debouncedFiltroFlota = useDebounce(filtroFlota, 1000);


const handleOpenValidar = (row) => {
  setSelectedRow(row)
  setOpen(true)
}

const handleCloseValidar = () => {
  setSelectedRow(null)
  setReset(prev => !prev)
  setOpen(false)
}

const columns = [
  {
    flex:0.100,
    minWidth:100,
    field:'hdr_id',
    headerName:'H.RUTA',
    sortable: false,
    renderCell: params =>{
      const {row} = params
      const theme = useTheme()
      return (
        <Box sx={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <Typography variant='h5' color={theme.palette.text.primary}>#{row.HDR.hdr_id}</Typography>
        </Box>
      )
    }
  },

  {
    flex:0.22,
    minWidth:130,
    field:'fecha_inicio',
    headerName:'FECHA INICIO',
    sortable: false,
    renderCell: params =>{
      const {row} = params
      const fechaObj = new Date(row.HDR.hdr_carga);
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
    flex:0.22,
    minWidth:130,
    field:'fecha_fin',
    headerName:'FECHA FIN',
    sortable: false,
    renderCell: params =>{
      const {row} = params
      const fechaObj = new Date(row.HDR.hdr_modif);
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
    field: 'CHOFER',
    headerName: 'CHOFER',
    sortable: false,
    renderCell: params => {
      const { row } = params

      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {renderClient(params)}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {row.CHOFER}
            </Typography>
          </Box>
        </Box>
      )
    }
  },

  {
    flex: 0.22,
    minWidth: 120,
    field: 'FLOTA',
    headerName: 'FLOTA',
    sortable: false,
    renderCell: params => {

      const theme = useTheme()
      const { row } = params
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography>{row.FLOTA}</Typography>
          <Typography>{row.PATENTE ? row.PATENTE : 'Sin patente'}</Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.22,
    minWidth: 160,
    field: 'motivo_cierre',
    headerName: 'MOTIVO CIERRE',
    sortable: false,
    renderCell: params => {

      const theme = useTheme()
      const { row } = params
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Tooltip title={row.HDR.hdr_comentarios}>
            <Typography>{row.HDR.hdr_comentarios}</Typography>
          </Tooltip>
        </Box>
      )
    }
  },
  {
    flex: 0.15,
    minWidth: 170,
    field: 'RENDIDA',
    headerName: 'ESTADO (VALIDADO/NO VALIDADO)',
    renderCell: params => {
    const {row} = params
    const status = statusRendida[row.HDR.hdr_rendida]

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
    flex: 0.1,
    minWidth: 130,
    sortable: false,
    field: 'ACCIONES',
    headerName: 'ACCIONES',

    renderCell: params => {

      const {row} = params

      return(
        <Box sx={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <Tooltip title='Ver HDR completa'>
          <IconButton component={Link} target='_blank' rel='noopener noreferrer' href={`/flota/hdr-edit/${row.HDR.hdr_id}?flota=${row.FLOTA}&chofer=${row.CHOFER}&consumo=${row["RATIO CONSUMO"]}&color=${row["ESTADO CONSUMO"]}`} passHref>
            <Icon icon='tabler:eye' />
          </IconButton>
        </Tooltip>
        <Tooltip title='Validar HDR'>
          <IconButton onClick={() => handleOpenValidar(row)}>
            <Icon icon='tabler:check'/>
          </IconButton>
        </Tooltip>
        </Box>
      )
    }
  },
]

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const init = paginationModel.page * paginationModel.pageSize
      const startDateFormatted = startDate ? formatearFecha(startDate):"";
      const endDateFormatted = endDate ? formatearFecha(endDate):"";

      let columname = null;
      let booleano = null;


      const res = await getAllHDR(init, paginationModel.pageSize,startDateFormatted,endDateFormatted,debouncedFiltroChofer ,null, false ,estadoHDR, columname, booleano)

      //console.log(res);
      setData(res.HDR_LIST);
      setCardInfo(res)
      setTotalRows(res.TOTAL);
      console.log(res)

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  fetchData()
}, [paginationModel,debouncedFiltroChofer, startDate, endDate,estadoHDR, reset])


const handleStartDateChange = (date) => {
  const fechaFormatted = new Date(date).toLocaleDateString();
  if (date == null) {
    setStartDate(null);
    return
  }
  setStartDate(fechaFormatted);
};

const handleEndDateChange = (date) => {
  const fechaFormatted = new Date(date).toLocaleDateString();
  if (date == null) {
    setEndDate(null);
    return
  }

  setEndDate(fechaFormatted);
};

const formatearFecha = (fecha) => {
  if (fecha == null) {
    return null;
  }
  const dateObject = new Date(fecha);
  const formattedDate = dateObject.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' }).replace(/\//g, '-');

  return formattedDate;
};

  const handleSearch = searchValue => {
    setSearchText(searchValue)
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')

    const filteredRows = data.filter(row => {
      return Object.keys(row).some(field => {
        return searchRegex.test(row[field].toString())
      })
    })
    if (searchValue.length) {
      setFilteredData(filteredRows)
    } else {
      setFilteredData([])
    }
  }

  const handleFilterChange = (e, filterType) => {
    if (filterType === 'chofer') {
      setFiltroChofer(e.target.value)
    } else if (filterType === 'flota') {
      setFiltroFlota(e.target.value)
    }
  }

  return (
    <Fragment>
      <FormRealizarValidacion
        selectedRow={selectedRow}
        open={open}
        onClose={() => handleCloseValidar()}
      />
    <Card>
      <CardHeader title='Hojas de ruta' />
      <Grid container spacing={2} sx={{ padding: 2 }}>
        <Grid item xs={4}>
          <CustomTextField
            fullWidth
            label="Filtro Chofer"
            variant="outlined"
            value={filtroChofer}
            onChange={(e) => handleFilterChange(e, 'chofer')}
          />
        </Grid>
        <Grid item xs={4} sx={{display: 'flex', flexDirection: 'column', gap: 1, mb: 5,height: '57px',alignItems: 'initial', justifyContent: 'center'}}>
          <FormLabel>Estado de validacion</FormLabel>
          <Select
            sx={{height: '40px'}}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={estadoHDR}
            onChange={(e) =>setEstadoHDR(e.target.value)}

          >
            <MenuItem value={true}>VALIDADA</MenuItem>
            <MenuItem value={false}>SIN VALIDAR</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={8} spacing={2} sx={{mb: 5}}>
        <Box sx={{mt: 5, display: 'flex',gap: 2, flexDirection: 'row'}}>

        <DatePickerWrapper>
          <ReactDatePicker
            selected={startDate? new Date(startDate) : null}
            onChange={(date) =>{handleStartDateChange(date)}}
            locale={es}
            customInput={<PickersComponent label={'Fecha de inicio'} />}
            //showTimeSelect
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
            //showTimeSelect
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
        rowHeight={80}
        columns={columns}
        pageSizeOptions={[3 ,7 , 10, 25, 50]}
        paginationModel={paginationModel}
        disableColumnFilter
        disableColumnMenu
        onSortModelChange={( model ) => setSortModel(model)}
        getRowId={(row) => row.HDR.hdr_id}
        rowCount={totalRows}
        paginationMode="server"
        loading={loading}

        //slots={{ toolbar: QuickSearchToolbar }}
        onPaginationModelChange={setPaginationModel}
        rows={filteredData.length ? filteredData : data}
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
          toolbar: {
            value: searchText,
            clearSearch: () => handleSearch(''),
            onChange: event => handleSearch(event.target.value)
          }
        }}
      />
    </Card>
    </Fragment>
  )
}

export default TablaValidations


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
