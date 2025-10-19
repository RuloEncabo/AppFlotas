// ** React Imports
import { Fragment, forwardRef, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'

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
import { ELTA_URL } from 'src/config'
import FormModificarCubiertaMovInterno from './FormModificarCubiertaMovInterno'



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

const TablaCubiertasMovimientoInterno = ({reload,setReload}) => {

  // ** Columns
  const columns = [
    {
      flex:0.22,
      minWidth:130,
      field:'cub_fecha_alta',
      headerName:'FECHA DE ALTA',
      renderCell: params =>{
        const {row} = params
        const fechaObj = new Date(row.CUBIERTA.cub_fecha_alta);
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
      field:'cub_fecha_baja',
      headerName:'FECHA DE BAJA',
      renderCell: params =>{
        const {row} = params
        const fechaObj = new Date(row.CUBIERTA.cub_fecha_baja);
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
      flex:0.06,
      minWidth:130,
      field:'cub_km_recorridos',
      headerName:'KM RECORRIDOS',
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
      minWidth:120,
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
      minWidth:130,
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

    //cub_cant_recapados
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

    // motivo de baja
    {
      flex:0.100,
      minWidth:170,
      field:'cub_motivo',
      headerName:'MOTIVO',
      renderCell: params =>{
        //[{'id':1,'depositoName':"Baja por tiempo"},{'id':2,'depositoName':"Baja por falla"},{'id':3,'depositoName':"Baja por incumplimiento"}]
        const {row} = params
        const motivoString = row.CUBIERTA.cub_motivo
         /* row.CUBIERTA.cub_motivo== 1 ? "Baja por tiempo" :
                             row.CUBIERTA.cub_motivo == 2 ? "Baja por falla" :
                             "Baja por incumplimiento"; */
        return (
          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Typography>{motivoString}</Typography>
          </Box>
        )
      }
    },

    {
      flex: 0.1,
      minWidth: 250,
      field: 'cub_observaciones',
      headerName: 'Observación',
      renderCell: (params) => {
        const { row } = params;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',  // Asegura que el texto ocupe toda la altura disponible
              width: '100%',   // Asegura que el texto ocupe todo el ancho disponible
              padding: '8px',  // Espaciado interno para mejorar la legibilidad
              whiteSpace: 'normal',  // Permite que el texto haga wrap
              wordBreak: 'break-word', // Rompe las palabras largas para ajustarse al ancho
              textAlign: 'center',  // Centra el texto horizontalmente
            }}
          >
            <Typography variant="body2">
              {row.CUBIERTA.cub_observaciones}
            </Typography>
          </Box>
        );
      }
    },
    // imagenes y archivos
    {
      flex: 0.1,
      minWidth: 170,
      field: 'cub_imagenes',
      headerName: 'IMÁGENES',
      sortable: false,
      renderCell: (params) => {
        const { row } = params;
        const baseUrl = ELTA_URL + "/archivos/";
        const imagenes = row.CUBIERTA.cub_imgs.split(',') || [];

        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',  // Alinea los elementos al principio del contenedor
              maxHeight: '100px', // Altura máxima para el contenedor
              overflowY: 'auto', // Habilitar scroll vertical
              width: '100%',
            }}
          >
            {imagenes.map((imagen, index) => (
              <Button
                key={index}
                variant="outlined"
                color="primary"
                onClick={() => {
                  const imgURL = baseUrl + imagen;
                  window.open(imgURL, '_blank');
                }}
                sx={{ margin: '5px', fontSize: '10px', padding: '5px' }}
              >
                Imagen {index + 1}
              </Button>
            ))}
          </Box>
        );
      }
    },

   {
      flex: 0.1,
      minWidth: 120,
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
  const [filtroMarca, setFiltroMarca] = useState('')
  const [sortModel, setSortModel] = useState(null)

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
        console.log(sortModel);
        columname = sortModel[0]?.field || '';
        booleano = sortModel[0]?.sort === 'asc' ? true : sortModel[0]?.sort === 'desc' ? false : null;
      }

      // Llama a tu API con el valor correcto de 'init' y 'pageSize'
      const res = await getAllCubiertas(
        init,
        paginationModel.pageSize,
        debouncedFiltroNroInterno,
        startDateFormatted,
        endDateFormatted,
        debouncedFiltroModelo,
        debouncedFiltroMarca,
        "MOVIMIENTO INTERNO",
        null,
        columname,
        booleano
      )

      //console.log(res);
      setData(res.CUB_LIST);
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
}, [paginationModel,debouncedFiltroNroInterno, debouncedFiltroModelo, startDate, endDate,debouncedFiltroMarca, reload, sortModel]);


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
       {selectedRow && <FormModificarCubiertaMovInterno setReload={setReload} data={selectedRow} open={open} onClose={handleClose} /> }
    <Card>
      <CardHeader title='Cubiertas Baja' />
      <Grid container spacing={2} sx={{ padding: 2 }}>
        <Grid item xs={4}>
          <CustomTextField
            fullWidth
            label="Nro. Interno"
            variant="outlined"
            value={filtroNroInterno}
            onChange={(e) => handleFilterChange(e, 'chofer')}
          />
        </Grid>
        <Grid item xs={4}>
          <CustomTextField
            fullWidth
            label="Filtro Modelo"
            variant="outlined"
            value={filtroModelo}
            onChange={(e) => handleFilterChange(e, 'flota')}
          />
        </Grid>
{/*         <Grid item xs={4} sx={{display: 'flex', flexDirection: 'column', gap: 1, mb: 5,height: '57px',alignItems: 'initial', justifyContent: 'center'}}>
 */}
        <Grid item xs={4}>

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
        getRowId={(row) => row.CUBIERTA.cub_id}
        rowCount={totalRows}
        rowHeight={120}
        onColumnHeaderClick={(e) => console.log(e)}
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

export default TablaCubiertasMovimientoInterno


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
