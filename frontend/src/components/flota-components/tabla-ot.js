// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid, GridExpandMoreIcon } from '@mui/x-data-grid'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import {  Button, FormControl, Grid, IconButton, MenuItem, Popover, Select, TextField, Tooltip } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { getCatNovedadesHDR } from 'src/services/chofer_endpoints/cat_novedad'
import HeaderNovGeneral from './HeaderNOVGeneral'
import FormAgregarNovedadFlota from './FormAgregarNovedadFlota'
import FormCrearOT from './FormCrearOT'
import { cambiarEstadoOT, deleteOT, getAllOT, getOTById, putOT } from 'src/services/flota_endpoints/ot_admin'
import DialogConfirmation from '../ConfirmDialog'
import ConfirmOptionDialogEstado from '../ConfirmOptionDialog'
import { useRouter } from 'next/router'
import FormEditNovsDialog from './FormEditNovsDialog'
import ErrorDialog from '../ErrorDialog'
import FormCerrarOT from './FormCerrarOT'


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


const TablaOT = () => {

  // ** States
  const [data,setData] = useState([])
  const [searchText, setSearchText] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0);
  const [filtroDominio, setFiltroDominio] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [listaEstados, setListaEstados] = useState(["PROGRAMADO","EN TALLER","DEMORADO","CERRADO"])
  const [ selectedNovedades, setSelectedNovedades] = useState(null)
  const [openEditNovedades,setOpenEditNovedades] = useState(false)
  const [startDate, setStartDate] = useState('');
  const [selectedOT, setSelectedOT] = useState(null);
  const [endDate, setEndDate] = useState('');
  const [reload , setReload] = useState(false)
  const [errores, setErrores] = useState([])


  const router = useRouter()

  const eliminarOT = async(id) => {
    try {
    await deleteOT(id)
    router.reload('/flota/flota-nov')
    } catch (error) {
      setErrores([...errores,{error:422,message:error.response?.data?.detail ?? error?.message ?? error}])
    }
  }

const columns = [
  { field: 'ID_OT', headerName: 'ID OT', width: 100 },

  {field: 'FECHA', headerName: 'Fecha creacion y limite', width: 250,
    renderCell: (params) => {
      const {row} = params
      return (
        <Box sx={{display:'flex',alignItems:'center',justifyContent:'center', flexDirection:'column', gap:'0px'}}>
        <Typography component={'div'}>
          <p>ALTA: {new Date(row.FECHA_CREACION).toLocaleDateString('es-ES', {day: 'numeric', month: 'numeric', year: 'numeric'})}</p>
          <p>{new Date(row.FECHA_LIMITE).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</p>
        </Typography>
        <Typography component={'div'}>
          <p>LIMITE: {new Date(row.FECHA_LIMITE).toLocaleDateString('es-ES', {day: 'numeric', month: 'numeric', year: 'numeric'})}</p>
          <p>{new Date(row.FECHA_LIMITE).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</p>
        </Typography>
        </Box>
      )
    }

  },
  { field: 'PATENTE', headerName: 'Patente', width: 130 ,justifyContent:'center',},
  { field: 'TALLER', headerName: 'Taller', width: 200 ,justifyContent:'center',},
  { field: 'ESTADO', headerName: 'Estado', width: 130 ,justifyContent:'center',},
  {
    field: 'NOVEDADES',
    flex: 0.15,
    headerName: 'Novedades',
    minWidth: 250,
    renderCell: (params) => (
    <Button
    onClick={ () => {
      setOpenEditNovedades(true)
      setSelectedNovedades(params.value)
      setSelectedOT(params.row.ID_OT)

    }}
    >
      <Box sx={{display:'flex',alignItems:'start',flexWrap:'wrap',justifyContent:'start',padding:'25px',width:'100%',height:'100%', flexDirection:'row', gap:'15px'}}>
        EDITAR:
        {params.value.map((novedad, index) => (
          <div key={index}>
            #{novedad.nov_id},
          </div>
        ))}
      </Box>
    </Button>
    ),
  },
  {field:"ACCIONES",flex:0.15, headerName: 'Acciones', minWidth: 200,
    renderCell: (params) => {
      const {row} = params
      return (
        <Box sx={{display:'flex',alignItems:'start',justifyContent:'right', flexDirection:'column', gap:'20px'}}>
          <DialogConfirmation message={"¿Quieres borrar esta OT?"} onConfirm={eliminarOT} id={row.ID_OT} title={"Eliminar OT"} iconName={"tabler:trash"} nameButton={"Borrar"}/>
          <FormCerrarOT id={row.ID_OT} nameButton='Cerrar OT' otCompleta={row} handleRefresh={() => setReload(!reload)}/>
        </Box>

      )
    }
  },

];




  const debouncedFiltroDominio = useDebounce(filtroDominio, 1000);

const espera2Segundos = () => new Promise(resolve => setTimeout(resolve, 1000))



const handleStartDateChange = (event) => {
  setStartDate(event.target.value);
};

const handleEndDateChange = (event) => {
  setEndDate(event.target.value);
};

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const init = paginationModel.page * paginationModel.pageSize

      const res = await getAllOT(init, paginationModel.pageSize,startDate,endDate,debouncedFiltroDominio,filtroEstado)

      console.log("LA RESPUESTA ES: ",res);
      setData(res.OT_NOV_LIST);
      //setCardInfo(res)

      setTotalRows(res.TOTAL);

    } catch (error) {
      console.log(error);
    } finally {
      await espera2Segundos();
      setLoading(false);
    }
  }
  fetchData()
}, [paginationModel,debouncedFiltroDominio, filtroEstado, startDate, endDate, reload])


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




  return (
    <Fragment>
    <Card>
      {errores.length > 0 && <ErrorDialog titulo={"Ups"} errores={errores} onClose={() => setErrores([])} />}
      <CardHeader title='Novedades' />
      {openEditNovedades && <FormEditNovsDialog
        setReload = {setReload}
        data={selectedNovedades}
        open={openEditNovedades}
        selectedOT={selectedOT}
        eliminarOT = {eliminarOT}
        onClose={() => {
          setOpenEditNovedades(false)
          setSelectedOT(null)
          setSelectedNovedades(null)}
        } />}

      <Grid container spacing={2} sx={{ padding: 2, alignItems: "flex-start" }}>
        <Grid item xs={4}>
          <CustomTextField
            fullWidth
            label="Filtro Patente"
            variant="outlined"
            value={filtroDominio}
            onChange={(e) => handleFilterChange(e, 'dominio')}
          />
        </Grid>


        <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'left',alignContent: 'left',margin:0 }}>
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
            <MenuItem key={"0"} value={""}>Todas los estados</MenuItem>
            {listaEstados?.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
          </FormControl>
        </Grid>

      <Grid item xs={8} spacing={2}>
        <Box sx={{mt: 5, display: 'flex',gap: 2, flexDirection: 'inline'}}>
          <TextField
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
          />
        </Box>
      </Grid>

    </Grid>
      <DataGrid
        autoHeight
        rowHeight={170}
        columns={columns}
        pageSizeOptions={[3 ,7 , 10, 25, 50]}
        paginationModel={paginationModel}
        getRowId={(row) => row.ID_OT}
        rowCount={totalRows}
        paginationMode="server"
        loading={loading}
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

export default TablaOT
