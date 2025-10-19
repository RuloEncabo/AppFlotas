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

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import { Button,  FormControl, FormLabel, Grid, IconButton, MenuItem, Popover, Select, TextField, useTheme } from '@mui/material'
import Icon from 'src/@core/components/icon'
import Link from 'next/link'
import CustomTextField from 'src/@core/components/mui/text-field'
import { getAllNov } from 'src/services/flota_endpoints/novedad_admin'
import { getCatNovedadesHDR } from 'src/services/chofer_endpoints/cat_novedad'
import HeaderNovGeneral from './HeaderNOVGeneral'
import FormAgregarNovedadFlota from './FormAgregarNovedadFlota'
import FormCrearOT from './FormCrearOT'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import ReactDatePicker from 'react-datepicker'
import { es } from 'date-fns/locale'

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

const categObj = {
  1: { color: 'primary' },
  2: { color: 'success' },
  3: { color: 'error' },
  4: { color: 'warning' },
  5: { color: 'success' },
  6: { color: 'info' },
  7: { color: 'secondary' },
  8: { color: 'secondary' },
  9: { color: 'primary' },
  10:{ color: 'success'},
  "default": { color: 'primary' }
};

const  statusNov ={
  "PENDIENTE": {title:'PENDIENTE', color: 'primary'},
  "RESUELTA": {title:'RESUELTA', color: 'success'},
  "ASIGNADA": {title:'ASIGNADA', color: 'error'},
  "ATENDIDA": {title:'ATENDIDA', color: 'warning'},
  "CERRADA": {title:'CERRADA', color: 'info'},
  "default": {title:'PENDIENTE', color: 'primary'},
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

const TablaNov = () => {


  const columns = [

    {
      flex:0.20,
      minWidth:200,
      field:'nov_fecha',
      headerName:'FECHA Y HORA',
      renderCell: params =>{
        const {row} = params
        const fechaObj = new Date(row.NOVEDAD.nov_fecha);
        const opciones = { year: 'numeric', month: 'numeric', day: 'numeric'};
        const opciones2 = {hour:'numeric',minute:'numeric'}
        const fechaEnEspañol = fechaObj.toLocaleDateString('es-ES', opciones);
        const hora=fechaObj.toLocaleTimeString('es-ES',opciones2);

        return (
          <Box sx={{display:'flex',flexDirection:'column',alignItems:'left',justifyContent:'center'}}>
            <Typography>{fechaEnEspañol}</Typography>
            <Typography>{hora}</Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.10,
      minWidth: 80,
      field: 'ID_NOVEDAD',
      headerName: 'ID NOV',
      renderCell: params => {
        const { row } = params
        const theme = useTheme()

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography  color={theme.palette.text.primary} variant='h5' sx={{  cursor: 'pointer' }}>
              {row.NOVEDAD.nov_id}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.10,
      minWidth: 80,
      field: 'ID_HDR',
      headerName: 'ID HDR',
      renderCell: params => {
        const { row } = params
        const theme = useTheme()

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography  color={theme.palette.text.primary} variant='h5' sx={{  cursor: 'pointer' }}>
              {row.NOVEDAD.nov_hdr_id}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.120,
      minWidth: 120,
      field: 'NOMBRE_FLOTA',
      headerName: 'FLOTA',
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center',flexDirection:'column' }}>
            <Typography>
              {row.NOMBRE}
            </Typography>
            <Typography noWrap variant='caption'>
              {row.DISPONIBILIDAD}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.152,
      minWidth: 150,
      field: 'PATENTE',
      headerName: 'PATENTE',
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center',flexDirection:'column' }}>
            <Typography>
              {row.PATENTE}
            </Typography>
          </Box>
        )
      }
    },

    {
      flex: 0.15,
      minWidth: 130,
      field: 'NOV_OBSERVACIONES',
      headerName: 'NOVEDAD',
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography noWrap variant='body2' onClick={(e)=> abrirPopover(e,row.NOVEDAD.nov_id)}>
              {row.NOVEDAD.nov_observaciones}
            </Typography>
            {activeNovId === row.NOVEDAD.nov_id && (
          <Popover
            id={id}
            open={open}
            anchorEl={mostrarPopover}
            onClose={cerrarPopover}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            >
              <Typography sx={{ p: 2 }}>{row.NOVEDAD.nov_observaciones}</Typography>
            </Popover>
            )}
          </Box>
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
      flex: 0.15,
      minWidth: 110,
      field: 'CATEGORIA',
      headerName: 'CATEGORIA',
      renderCell: params => {
        const {row} = params
        const status = categObj[row.CATEGORIA.cn_id]
        const chipColor = status ? status.color : 'default';

        return (
          <CustomChip
            rounded
            size='small'
            skin='light'
            color={chipColor}
            label={row.CATEGORIA.cn_nombre}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    },

    {
      flex: 0.15,
      minWidth: 140,
      field: 'ESTADO',
      headerName: 'ESTADO',
      renderCell: params => {
      const {row} = params
      const status = statusNov[row.NOVEDAD.nov_estado]

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
        <IconButton component={Link} target='_blank' rel='noopener noreferrer' href={`nov-edit/${row.NOVEDAD.nov_id}`}>
          <Icon icon='tabler:eye' />
        </IconButton>
        )
      }
    },
  ]

  // ** States
  const [data,setData] = useState([])
  const [searchText, setSearchText] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0);
  const [filtroDominio, setFiltroDominio] = useState("")
  const [filtroFlota, setFiltroFlota] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("")
  const [listaCategorias, setListaCategorias] = useState([])
  const [listaEstados, setListaEstados] = useState(["PENDIENTE","RESUELTA","ASIGNADA","ATENDIDA","CERRADA"])
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cardInfo, setCardInfo] = useState({})
  const [mostrarPopover, setMostrarPopover] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [abrirFormNov, setAbrirFormNov] = useState(false)
  const [abrirFormOT, setAbrirFormOT] = useState(false)
  const [reset, setReset] = useState(false)
  const [sortModel,setSortModel] = useState()

  const debouncedFiltroDominio = useDebounce(filtroDominio, 1000);
  const debouncedFiltroFlota = useDebounce(filtroFlota, 1000);

const espera2Segundos = () => new Promise(resolve => setTimeout(resolve, 1000))

const handleRowSelection = (selection) => {
  const selectedData = data.filter(row =>
    selection.includes(row.NOVEDAD.nov_id)
  );
  setSelectedRows(selectedData);
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


useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getCatNovedadesHDR()
      setListaCategorias(res)
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  fetchData()
}, [])

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

      const res = await getAllNov(init, paginationModel.pageSize,startDateFormatted,endDateFormatted,debouncedFiltroDominio,debouncedFiltroFlota,filtroEstado,filtroCategoria, columname, booleano)

      console.log("LA RESPUESTA ES: ",res);
      setData(res.NOV_LIST);
      setCardInfo(res)

      setTotalRows(res.TOTAL);

    } catch (error) {
      console.log(error);
    } finally {
      await espera2Segundos();
      setLoading(false);
    }
  }
  fetchData()
}, [paginationModel,debouncedFiltroDominio, debouncedFiltroFlota, filtroEstado, filtroCategoria, startDate, endDate, reset, sortModel])


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
    if (filterType === 'dominio') {
      setFiltroDominio(e.target.value)
    } else if (filterType === 'flota') {
      setFiltroFlota(e.target.value)
    }
  }

  // POPOVER
  const [activeNovId, setActiveNovId] = useState(null);

    const abrirPopover = (event,novId) => {
      setMostrarPopover(event.currentTarget);
      setActiveNovId(novId);
    };

    const cerrarPopover = () => {
      setMostrarPopover(null);
      setActiveNovId(null);
    };

    const open = Boolean(mostrarPopover);
    const id = open ? 'simple-popover' : undefined;

    const openOT =()=>{
      setAbrirFormOT(true)
    }

    const closeOT = ()=>{
      setAbrirFormOT(false)
    }

    const openNov = () => {
      setAbrirFormNov(true)
    }

    const closeNov = () => {
      setAbrirFormNov(false)
    }

  return (
    <Fragment>
      <FormAgregarNovedadFlota isOpen={abrirFormNov} onClose={closeNov} hdr_id={0} isAgregando={true}/>
      <FormCrearOT isOpen={abrirFormOT} onClose={closeOT} lista_nov={selectedRows} setReset={setReset}/>
    <HeaderNovGeneral data={cardInfo}/>
    <Card>
      <CardHeader title='Novedades' />
      <Grid container spacing={2} sx={{ padding: 2, alignItems: "flex-start" }}>
        <Grid item xs={3}>
          <CustomTextField
            fullWidth
            label="Filtro Patente"
            variant="outlined"
            value={filtroDominio}
            onChange={(e) => handleFilterChange(e, 'dominio')}
          />
        </Grid>
        <Grid item xs={3}>
          <CustomTextField
            fullWidth
            label="Filtro Flota"
            variant="outlined"
            value={filtroFlota}
            onChange={(e) => handleFilterChange(e, 'flota')}
          />
        </Grid>

        <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'left',alignContent: 'left',margin:0 }}>
            <FormControl fullWidth sx={{height: '38px', margin: 0, padding: 0 }} >
              <label style={{fontSize: 13,mb:"0.25rem"}}>Filtro por Categoría</label>
            <Select
              id="demo-simple-select"
              variant="outlined"
              fullWidth
              sx={{ height: '100%', margin: 0, padding: 0 }}
              defaultValue={filtroCategoria}
              value={filtroCategoria}
              onChange={(event) => { setFiltroCategoria(event.target.value) }}
            >
              <MenuItem key={"0"} value={""}>Todas las Categorías</MenuItem>
              {listaCategorias?.map((item) => (
                <MenuItem key={item.cn_nombre} value={item.cn_nombre}>
                  {item.cn_nombre}
                </MenuItem>
              ))}
            </Select>
            </FormControl>
        </Grid>
        <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'left',alignContent: 'left',margin:0 }}>
          <FormControl fullWidth sx={{height: '38px', margin: 0, padding: 0 }} >
            <label style={{fontSize: 13,mb:"0.25rem"}}>Filtro por estado</label>
          <Select
            id="demo-simple-select"
            variant="outlined"
            fullWidth
            sx={{ height: '100%', margin: 0, padding: 0 }}
            defaultValue={filtroEstado}
            value={filtroEstado}
            onChange={(event) => { setFiltroEstado(event.target.value) }}
          >
            <MenuItem key={"0"} value={""}>Todas las categorias</MenuItem>
            {listaEstados?.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
          </FormControl>
        </Grid>

      <Grid item xs={6} spacing={2}>
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


          {/* <TextField
            id="date-start"
            label="Fecha de inicio"
            type="date"
            fullWidth
            value={startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mt: 2 }}
          />
          <TextField
            id="date-end"
            label="Fecha de fin"
            type="date"
            fullWidth
            value={endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mt: 2 }}
          />*/}
        </Box>
      </Grid>

    </Grid>

    <Box sx={{display:'flex',justifyContent:'flex-end', mb:8,mr:8, gap:2}}>

      <Button onClick={openOT} variant='contained' disabled={selectedRows.length === 0}> CREAR ORDEN DE TRABAJO</Button>
    </Box>

      <DataGrid
        autoHeight
        columns={columns}
        pageSizeOptions={[3 ,7 , 10, 25, 50]}
        paginationModel={paginationModel}
        getRowId={(row) => row.NOVEDAD.nov_id}
        rowCount={totalRows}
        paginationMode="server"
        loading={loading}
        onPaginationModelChange={setPaginationModel}
        onSortModelChange={( model ) => setSortModel(model)}
        rows={filteredData.length ? filteredData : data}
        checkboxSelection
        onRowSelectionModelChange={handleRowSelection}
        selectionModel={selectedRows}
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

export default TablaNov



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
