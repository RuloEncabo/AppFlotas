import { CircularProgress, FormLabel, LinearProgress, MenuItem, Select, Typography } from '@mui/material'
import { Box, width } from '@mui/system'
import { DataGrid } from '@mui/x-data-grid'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import React, { Fragment, useEffect, useState } from 'react'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import FiltroTablaDesplegable from 'src/components/formComponents/Filtros'
import { getAllCubiertas, getCubiertaPorNroInterno, getHistoricoCubiertaPorId } from 'src/services/flota_endpoints/cubiertas_flota'
export const HistoricoCubiertaView = () => {
  const [apiErrors, setApiErrors] = useState([])
  const [data, setData] = useState([])
  const [dataCubierta, setDataCubierta] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCub, setSelectedCub] = useState(null)
  const [nroInterno, setNroInterno] = useState(null)
  const [dataHistory, setDataHistory] = useState([])
  const[ dataKmSeleccionada,setDataKmSeleccionada] = useState(null)
  const [accion , setAccion] = useState(null)
  const [sortModel, setSortModel] = useState();


  const columns = [
    {
      field: 'his_fecha', headerName: 'Fecha', flex: 1, sortable: true,
      valueGetter: (params) => new Date(params.value),
      renderCell: (params) =>(
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography>{format(new Date(params.value), 'dd/MM/yyyy', { locale: es })}</Typography>
        </Box>),
      sortComparator: (v1, v2) => v1 - v2,
    },
    /* { field: 'his_cub_id', headerName: 'CUB ID', flex: 1 ,sortable: false}, */
    { field: 'his_deposito', headerName: 'Deposito', flex: 1 ,sortable: true,},
    { field: 'his_tractor', headerName: 'Patente', flex: 1 ,sortable: true},
    { field: 'his_observaciones', headerName: 'Observaciones', flex: 1 ,sortable: true},
    { field: 'his_valor', headerName: 'Valor', flex: 1 ,sortable: true},
    { field: 'his_posicion',headerName: 'Posicion', flex: 1 ,sortable: true, flex: 1.4},
    { field: 'his_km', headerName: 'Km', flex: 1 ,sortable: true},
    { field: 'his_mm', headerName: 'MM', flex: 1 ,sortable: true},
    { field: 'his_accion', headerName: 'Acción', flex: 1 ,sortable: true},
/*     { field: 'id', headerName: 'ID', flex: 1 ,sortable: false},*/
  ];


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (nroInterno === null) {
          const res = await getAllCubiertas(0, 100000, null, null, null, null, null, null)
          setData(res.CUB_LIST);
          console.log(res)
        } else {
          const res = await getAllCubiertas(0, 100000, nroInterno , null, null, null, null,null)
          setData(res.CUB_LIST);
          console.log(res)
        }
      } catch (error) {
        console.log('Error al recibir la data:', error);

        if (error.response) {
            const errorDetails = error.response.data.detail;
            if (Array.isArray(errorDetails)) {
              let arrayErrores = []
              for (error in errorDetails) {
                arrayErrores = [...arrayErrores,{error:422,message:errorDetails[error].msg}]
              }
              setApiErrors(arrayErrores);
            } else {
                setApiErrors([{ error: 423, message: errorDetails}]);
            }
        } else {
            console.error("Error en la solicitud que no proviene de una respuesta HTTP:");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchData()
  }, [nroInterno]);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (selectedCub !== null) {

          let columname = null;
          let booleano = null;

          if( sortModel != null){
            columname = sortModel[0]?.field || '';
            booleano = sortModel[0]?.sort === 'asc' ? true : sortModel[0]?.sort === 'desc' ? false : null;
          }
          console.log("buscando con params:" + dataCubierta["cub_id"] + " " + accion + " " + columname + " " + booleano)
          const res = await getHistoricoCubiertaPorId(dataCubierta["cub_id"], accion ,columname, booleano)
          setDataHistory(res);
          console.log(res)
        }
      } catch (error) {
        console.log('Error al recibir la data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData()

  }, [dataCubierta, accion, sortModel]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedCub !== null) {
          const res = await getCubiertaPorNroInterno(dataCubierta["cub_nro_interno"])
          setDataKmSeleccionada(res);
          console.log(res)
        }
      } catch (error) {
        console.log('Error al recibir la data:', error);
      }
    }
    fetchData()

  }, [selectedCub]);


  return (
    <Fragment>
    <Typography variant="h2"> HISTORICO CUBIERTAS</Typography>
    <Box>
      <Box sx={{ display: 'flex-row', alignItems: 'start', justifyContent: 'left' }}>
              <Typography variant='h4' sx={{ mb: 2 }}>BUSCAR CUBIERTA</Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'left', width: '60%',gap: 2, justifyContent: 'space-between' }}>
                  <CustomAutocomplete
                    options={data}
                    fullWidth
                    value={data.find(option => option.CUBIERTA["cub_nro_interno"] === selectedCub) || null}
                    getOptionLabel={option => option.CUBIERTA["cub_nro_interno"] || 'Sin valor'}
                    onChange={(event,newValue) => { setSelectedCub(newValue ? newValue.CUBIERTA["cub_nro_interno"] : null)
                    setDataCubierta(newValue ? newValue.CUBIERTA : null)
                    }}
                    isOptionEqualToValue={(option, value) => option["cub_nro_interno"] === value["cub_nro_interno"]}
                    sx={{ width: '100%' }}
                    renderInput={params => (
                      <CustomTextField {...params} label={'Seleccione la cubierta'} />
                    )}
                  />
                  <Box sx={{ display: 'flex',flexDirection: 'column' ,alignItems: 'left' , width: '100%' }}>
                  <FormLabel style={{ fontSize: '0.8rem' }}>Acciones</FormLabel>
                  <Select
                    label="Acciones"
                    value={accion}
                    style={ { fontSize: '0.8rem' , height: '40px' , width: '100%'} }
                    onChange={e => setAccion(e.target.value)}
                  >
                    <MenuItem value={null}>TODAS</MenuItem>
                    <MenuItem value="ALTA">ALTA</MenuItem>
                    <MenuItem value="BAJA">BAJA</MenuItem>
                    <MenuItem value="DEFINITIVA">DEFINITIVA</MenuItem>
                    <MenuItem value="ROTACION">ROTACION</MenuItem>
                    <MenuItem value="UBICACION">UBICACION</MenuItem>
                    <MenuItem value="RECAPADO">RECAPADO</MenuItem>
                    <MenuItem value="REPARACION">REPARACION</MenuItem>
                    <MenuItem value="MANTENIMIENTO">MANTENIMIENTO</MenuItem>
                    <MenuItem value="DESGASTE">DESGASTE</MenuItem>
                  </Select>
                  </Box>
                </Box>
                <Typography variant='h4' sx={{ mb: 2 }}>INFORMACION CUBIERTA</Typography>

                {
                  dataKmSeleccionada === null ? (
                    <></>
                  ) : (
                    <Box sx={{ display: 'flex',flexDirection: 'row',mt:8,ml:8 ,alignItems: 'left', width: '60%',gap: 2, justifyContent: 'space-between' }}>
                      <Typography variant='h6' sx={{ mb: 2 }}> KM TOTAL: {dataKmSeleccionada?.CUBIERTA["cub_km_totales"]}</Typography>
                      <Typography variant='h6' sx={{ mb: 2 }}> DEPOSITO: {dataKmSeleccionada?.DEPOSITO}</Typography>
                      <Typography variant='h6' sx={{ mb: 2 }}> PATENTE: {dataKmSeleccionada?.PATENTE}</Typography>
                    </Box>
                  )
                }

      </Box>

      {isLoading ? (
          <LinearProgress />
        ) : (
          <Box sx={{ height: 400, width: '100%' ,mt:4}}>
          <DataGrid
            columns={columns}
            rows={dataHistory["historicos"] || []}
            autoPageSize = {true}
            getRowId={(row) => row.id}
            onSortModelChange={( model ) => setSortModel(model)}
            loading={isLoading}
          />
          </Box>
        )}

    </Box>
    </Fragment>
  )
}




