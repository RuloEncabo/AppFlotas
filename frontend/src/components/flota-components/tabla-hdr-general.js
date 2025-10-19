// ** React Imports
import { Fragment, forwardRef, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import QuickSearchToolbar from './QuickSearchToolbar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import CardInfo1 from './CardInfo1'
import { getAllHDR } from 'src/services/flota_endpoints/hdr_admin'
import { CircularProgress, Grid, IconButton, TextField } from '@mui/material'
import Icon from 'src/@core/components/icon'
import Link from 'next/link'
import CustomTextField from 'src/@core/components/mui/text-field'
import HeaderHDRGeneral from './HeaderHDRGeneral'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import ReactDatePicker from 'react-datepicker'
import { es } from 'date-fns/locale'
import { useTheme } from '@emotion/react'
import { getValue } from '@mui/system'

// ** renders client column
const renderClient = params => {
  const { row } = params
  const stateNum = Math.floor(Math.random() * 6)
  const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const color = states[stateNum]

  //ESTO ES PARA MOSTRAR UN AVATAR DEL USUARIO... PROXIMAMENTE...
 /*  if (row.avatar.length) {
    return <CustomAvatar src={`/images/avatars/${row.avatar}`} sx={{ mr: 3, width: '1.875rem', height: '1.875rem' }} />
  } else {} */

    return (
      <CustomAvatar skin='light' color={color} sx={{ mr: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}>
        {getInitials(row.CHOFER ? row.CHOFER : 'Sin nombre')}
      </CustomAvatar>
    )
}


const statusObj = {
  "verde": { color: 'success' },
  "amarillo": {  color: 'warning' },
  "rojo": { color: 'error' },

}

const statusCarga = {
  false: { title: 'SIN CARGA', color: 'info' },
  true: { title: 'LLEVA VEHICULO', color: 'success' },
}

const statusRendida = {
  false: { title: 'SIN RENDIR', color: 'info' },
  true: { title: 'RENDIDA', color: 'success' },
}


const escapeRegExp = value => {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

const columns = [
  {
    flex:0.100,
    minWidth:120,
    field:'HDR_ID',
    headerName:'H.RUTA',
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
    minWidth:200,
    field:'HDR_CARGA',
    headerName:'FECHA INICIO',
    valueGetter: params => {
      return new Date(params.row.HDR.hdr_carga)
    },
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
    flex: 0.18,
    minWidth: 170,
    field: 'LLEVA_CARGA',
    headerName: 'CARGA',
    renderCell: params => {
    const {row} = params
    const status = statusCarga[row.LLEVA_CARGA]

      return (
        <CustomChip
          rounded
          size='small'
          skin='light'
          color={status.color }
          label={status.title}
          sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
        />
      )
    }
  },
  {
    flex: 0.18,
    minWidth: 170,
    field: 'HDR_RENDIDA',
    headerName: 'RENDIDA',
    renderCell: params => {
    const {row} = params
    const status = statusRendida[row.HDR.hdr_rendida]

      return (
        <CustomChip
          rounded
          size='small'
          skin='light'
          color={status.color }
          label={status.title}
          sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
        />
      )
    }
  },
  {
    flex: 0.22,
    minWidth: 200,
    field: 'CHOFER',
    headerName: 'CHOFER',
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
    minWidth: 150,
    field: 'FLOTA',
    headerName: 'FLOTA',
    renderCell: params => {
      const { row } = params

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography >
            {row.FLOTA}
          </Typography>
        </Box>
      )
    }
  },

  {
    flex: 0.22,
    minWidth: 150,
    field: 'PATENTE',
    headerName: 'PATENTE',
    renderCell: params => {
      const { row } = params

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography >
            {row.PATENTE ? row.PATENTE : 'Sin patente'}
          </Typography>
        </Box>
      )
    }
  },

  {
    flex: 0.22,
    minWidth: 150,
    field: 'KM ODO',
    headerName: 'KM DE FLOTA',
    renderCell: params => {
      const { row } = params

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography >
            {row['KM ODO'] ? row['KM ODO'] : 'Sin km'}
          </Typography>
        </Box>
      )
    }
  },


  {
    flex:0.100,
    minWidth:150,
    field:'TOTAL KM',
    headerName:'KM RECORRIDOS',
    renderCell: params =>{
      const {row} = params

      return (
        <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Typography>{row["TOTAL KM"]}</Typography>
        </Box>
      )
    }
  },

  {
    flex:0.100,
    minWidth:150,
    field:'TOTAL CARGADO',
    headerName:'COMBUSTIBLE CARGADO',
    renderCell: params =>{
      const {row} = params

      return (
        <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Typography>{row["TOTAL CARGADO"]}</Typography>
        </Box>
      )
    }
  },

  {
    flex:0.100,
    minWidth:150,
    field:'CONSUMO',
    headerName:'LT CONSUMO',
    renderCell: params =>{
      const {row} = params

      return (
        <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Typography>{row["CONSUMO"]}</Typography>
        </Box>
      )
    }
  },
  {
    flex:0.100,
    minWidth:150,
    field:'TIEMPO INACTIVO',
    headerName:'TIEMPO INACTIVO',
    valueGetter : params => {
      const tiempo = params.row["TIEMPO INACTIVO"]
      const regex = /(\d+)H\s*(\d+)?Min?/; // Expresión regular para capturar horas y minutos
      const match = regex.exec(tiempo);
      if (match) {
        const horas = parseInt(match[1]);
        const minutos = match[2] ? parseInt(match[2]) : 0;
        const totalMinutos = horas * 60 + minutos;
        return totalMinutos;
      }
      return 0;
    },
    renderCell: params =>{
      const {row} = params

      return (
        <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Typography>{row["TIEMPO INACTIVO"]}</Typography>
        </Box>
      )
    }
  },
  {
    flex: 0.15,
    minWidth: 110,
    field: 'RATIO CONSUMO',
    headerName: 'ESTADO',
    renderCell: params => {
      const {row} = params
      const status = statusObj[row["ESTADO CONSUMO"]]
      const numero = row["RATIO CONSUMO"].toFixed(4)
      return (
        <CustomChip
          rounded
          size='small'
          skin='light'
          color={status.color}
          label={numero}
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
      <IconButton component={Link} target='_blank' rel='noopener noreferrer' href={`/flota/hdr-edit/${row.HDR.hdr_id}?flota=${row.FLOTA}&chofer=${row.CHOFER}&consumo=${row["RATIO CONSUMO"]}&color=${row["ESTADO CONSUMO"]}`} passHref>
        <Icon icon='tabler:eye' />
      </IconButton>

      )
    }
  },

]



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

const TablaHDR = () => {
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
  const [sortModel, setSortModel] = useState();


  const debouncedFiltroChofer = useDebounce(filtroChofer, 1000);
  const debouncedFiltroFlota = useDebounce(filtroFlota, 1000);

const espera2Segundos = () => new Promise(resolve => setTimeout(resolve, 1000))

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      // Calcula el valor correcto de 'init' como el número de elementos que se han saltado
      const init = paginationModel.page * paginationModel.pageSize
      // Llama a tu API con el valor correcto de 'init' y 'pageSize'

      //formatear fechas
      const startDateFormatted = formatearFecha(startDate);
      const endDateFormatted = formatearFecha(endDate);

      let columname = null;
      let booleano = null;

      if( sortModel != null){
        columname = sortModel[0]?.field || '';
        booleano = sortModel[0]?.sort === 'asc' ? true : sortModel[0]?.sort === 'desc' ? false : null;
      }

      const res = await getAllHDR(init, paginationModel.pageSize, startDateFormatted,endDateFormatted,debouncedFiltroChofer,debouncedFiltroFlota,true,null, columname, booleano)

      //console.log(res);
      setData(res.HDR_LIST);
      setCardInfo(res)
      setTotalRows(res.TOTAL);
      console.log(res)

    } catch (error) {
      console.log(error);
    } finally {
      await espera2Segundos();
      setLoading(false);
    }
  }
  fetchData()
}, [paginationModel,debouncedFiltroChofer, debouncedFiltroFlota, startDate, endDate, sortModel])


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
    setStartDate(null);
    return
  }

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

  const handleSearch = searchValue => {
    setSearchText(searchValue)
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')

    const filteredRows = data.filter(row => {
      return Object.keys(row).some(field => {
        // @ts-ignore
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
      <HeaderHDRGeneral data={cardInfo}/>
    <Card>
      <CardHeader title='Hojas de ruta activa' />
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
        <Grid item xs={4}>
          <CustomTextField
            fullWidth
            label="Filtro Patente"
            variant="outlined"
            value={filtroFlota}
            onChange={(e) => handleFilterChange(e, 'flota')}
          />
        </Grid>
        <Grid item xs={8} sx={{mb: 5}}>
        <Box sx={{mt: 5, display: 'flex',gap: 2, flexDirection: 'inline'}}>

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
        columns={columns}
        pageSizeOptions={[3 ,7 , 10, 25, 50]}
        paginationModel={paginationModel}
        getRowId={(row) => row.HDR.hdr_id}
        onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
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

export default TablaHDR


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
