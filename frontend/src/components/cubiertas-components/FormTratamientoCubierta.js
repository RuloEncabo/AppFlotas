import React, { Fragment, useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup'
import { useForm } from 'react-hook-form';
import { ControladorCargaDateV2 } from '../formComponents/ControladorCargaDate';
import ControladorCargaCombo, { ControladorCargaComboAsync } from '../formComponents/ControladorCargaCombo';
import { Alert, Box, Button, Card, CardHeader, CircularProgress, FormLabel, Grid, MenuItem, Select, Typography } from '@mui/material';
import { getAllCubiertas, getCubiertaPorNroInterno, modificarEstadoCubierta, postCubierta, putCubierta } from 'src/services/flota_endpoints/cubiertas_flota';
import ErrorDialog from '../ErrorDialog';
import Snackbar from '@mui/material/Snackbar'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete';
import CustomTextField from 'src/@core/components/mui/text-field';
import { postOTC } from 'src/services/flota_endpoints/otc_flota';

function FormTratamientoCubierta({setReload}) {
  const [apiErrors, setApiErrors] = useState([])
  const [data, setData] = useState([])
  const [dataCubierta, setDataCubierta] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCub, setSelectedCub] = useState(null)
  const [nroInterno, setNroInterno] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [depositoUb , setDepositoUb] = useState(null)
  const [tipoActual, setTipoActual] = useState(1)

  // getCubiertaPorNroInterno

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      if (selectedCub === null) {
        return
      }

      try {
        const res = await getCubiertaPorNroInterno(selectedCub)
        setDataCubierta(res.CUBIERTA);
        setDepositoUb(res.PATENTE != null ? (res.PATENTE) : res.DEPOSITO)
      } catch (error) {
        console.log('Error al recibir la data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData()
  }, [selectedCub ]);

useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true)
    try {
      if (nroInterno === null) {
        const res1 = await getAllCubiertas(0, 100000, null, null, null, null, null, "ACTIVA")
        const res2 = await getAllCubiertas(0, 100000, null, null, null, null, null, "MOVIMIENTO INTERNO")
        const res3 = await getAllCubiertas(0, 100000, null, null, null, null, null, "BAJA")
        setData([...res1.CUB_LIST, ...res2.CUB_LIST, ...res3.CUB_LIST]);
      } else {
        const res1 = await getAllCubiertas(0, 100000, nroInterno , null, null, null, null, "ACTIVA")
        const res2 = await getAllCubiertas(0, 100000, nroInterno , null, null, null, null, "MOVIMIENTO INTERNO")
        const res3 = await getAllCubiertas(0, 100000, nroInterno , null, null, null, null, "BAJA")
        setData([...res1.CUB_LIST, ...res2.CUB_LIST, ...res3.CUB_LIST]);
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



  const initialValues = {
    otc_fecha: new Date(),
    //otc_prov_id: 0, // proveedor
    otc_trab_id: 1, // id trabajo
    //otc_dep_id: 0,  // id deposito
    otc_estado_id: 1,  // id estado
    otc_tipo: 1,  // id tipo de tratamiento 1 es RECAPADO 2 es REPARACION
    otc_trab_id:null
  }

  const { handleSubmit, control ,formState: { errors },watch ,reset,setValue} = useForm({
    defaultValues: initialValues, mode: 'onBlur',
    resolver: yupResolver(
      yup.object().shape({
        otc_fecha: yup.date().typeError('Ingrese una fecha').required('Requerido'),
        //otc_prov_id: yup.number().min(1, 'Requerido').required('Requerido'),
        otc_trab_id: yup.number().min(1, 'Requerido').required('Requerido'),
        //otc_dep_id: yup.number().min(1, 'Requerido').required('Requerido'),
        otc_tipo: yup.number().min(1, 'Requerido').required('Requerido'),
        otc_trab_id: yup.number().min(1, 'Requerido').required('Requerido'),
      })
    )
  });

  const onSubmit =  async (data) => {
    console.log("data: ",data)
    setIsLoading(true)
    setApiErrors([])
    try {
      const fechaModificada = new Date(data.otc_fecha).toISOString().split('T')[0]
      let dataCopy = { ...data, otc_fecha: fechaModificada }
      dataCopy = { ...dataCopy, otc_estado: "SIN ASIGNAR" }
      dataCopy = { ...dataCopy, cub_id: dataCubierta.cub_id }
      dataCopy = { ...dataCopy, otc_general_id: null }
      const response = await postOTC(dataCopy)
      setReload(prev => !prev)
      reset(initialValues)
      setSnackbarOpen(true)

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
            if(errorDetails ){
              setApiErrors([{ error: 422, message: errorDetails}]);
            }
            else{
              setApiErrors([{ error: 423, message:"Error inesperado en la validación de datos."}]);
            }

          }
      } else {
          // Manejo de errores que no son de Axios
          console.error("Error en la solicitud que no proviene de una respuesta HTTP:", error.message);
      }
    }
    setIsLoading(false)
  }


  return (
    <Fragment>
    <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Tarea creada exitosamente
        </Alert>
      </Snackbar>
      { apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores de Validación'} />}
    <Box>
      <Typography variant='h4' sx={{ mb: 2 }}>BUSCAR CUBIERTA</Typography>
      <Box sx={{ display: 'inline-flex', alignItems: 'left', width: '40%',gap: 2, justifyContent: 'space-between' }}>
              <CustomAutocomplete
                options={data}
                fullWidth
                value={data.find(option => option.CUBIERTA["cub_nro_interno"] === selectedCub) || null}
                getOptionLabel={option => option.CUBIERTA["cub_nro_interno"]?.toString() || 'Sin valor'}
                onChange={(event,newValue) => { setSelectedCub(newValue ? newValue.CUBIERTA["cub_nro_interno"] : null)
                setDataCubierta(newValue ? newValue.CUBIERTA : null)
                setDepositoUb(newValue ? newValue.DEPOSITO : null)
                }}
                isOptionEqualToValue={(option, value) => option["cub_nro_interno"] === value["cub_nro_interno"]}
                sx={{ width: '100%' }}
                renderInput={params => (
                  <CustomTextField {...params} label={'Seleccione la cubierta'} />
                )}
              />
      </Box>

      {dataCubierta&& depositoUb&&(
        <Box sx={{ display: 'flex',flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
        <Grid container spacing={2} sx={{ mt: 2 , width: '50%'}}>
          <Grid item xs={12} sm={12} >
          <Typography variant='h4' sx={{  mb:5}}> Datos de cubierta</Typography>
          </Grid>
          <Grid item xs={6} sm={6}>
          <CustomTextField label={'Deposito Actual'} disabled value={depositoUb} fullWidth/>
          </Grid>
          <Grid item xs={6} sm={6}>
          <CustomTextField label={'Kilometro'} disabled value={dataCubierta.cub_km_recorridos} fullWidth/>
          </Grid>
          <Grid item xs={6} sm={6}>
          <CustomTextField label={'Modelo'} disabled value={dataCubierta.cub_modelo} fullWidth/>
          </Grid>
          <Grid item xs={6} sm={6}>
          <CustomTextField label={'Marca'} disabled value={dataCubierta.cub_marca} fullWidth/>
          </Grid>
          <Grid item xs={6} sm={6}>
          <CustomTextField label={'Medida'} disabled value={dataCubierta.cub_medida} fullWidth/>
          </Grid>
          <Grid item xs={6} sm={6}>
          <CustomTextField label={'MM'} disabled value={dataCubierta.cub_mm} fullWidth/>
          </Grid>
          <Grid item xs={6} sm={6}>
          <CustomTextField label={'Banda'} disabled value={dataCubierta.cub_banda} fullWidth/>
          </Grid>
          <Grid item xs={6} sm={6}>
          <CustomTextField label={'Presion'} disabled value={dataCubierta.cub_presion} fullWidth/>
          </Grid>
          {/* <Grid item xs={12} sm={12}>
          <CustomTextField label={'Observaciones'} disabled value={dataCubierta.cub_observaciones} fullWidth/>
          </Grid> */}

        </Grid>
        <Box sx={{ width: '50%'}}>
        <Typography variant='h4' sx={{  mt: 7}}>Tratamiento</Typography>
        <Card sx={{ p: 8, m: 8,p:4}}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'inline-flex',width: '40%',flexDirection: 'column' , gap: 2, mb: 4 }}>
              <ControladorCargaDateV2 name="otc_fecha" label="Fecha" control={control} err={errors.otc_fecha} /></Box>
              {/* <ControladorCargaComboAsync name="otc_prov_id" label="Proveedor" endpoint={'/params/proveedores/'} optionValueKey={'id'} optionLabelKey={'prov_nombre'} control={control} errors={errors} /> */}
              {/* <ControladorCargaComboAsync name="otc_dep_id" label="Deposito" endpoint={'/params/deposito/'} optionValueKey={'id'} optionLabelKey={'dep_nombre'} control={control} errors={errors} removeKeys={[1,8,9]} /> */}
              <ControladorCargaComboAsync name="otc_tipo" label="Tipo de tratamiento" endpoint={'/params/tipo_tratamiento/'} optionValueKey={'id'} optionLabelKey={'tt_nombre'} control={control} errors={errors} />
              <ControladorCargaComboAsync name="otc_trab_id" label="Tipo de trabajo" endpoint={`/params/trabajo/${watch("otc_tipo") === 1 ? "recapados/" : "reparacion/"}`} optionValueKey={'id'} optionLabelKey={'tra_nombre'} control={control} errors={errors} />
            <Box sx={{ display: 'flex',width: '90%',flexDirection: 'row-reverse', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
            {isLoading ? <Button disabled type="submit" variant="contained" sx={{mt:5 ,width:'130px'}}>Cargando...</Button> : <Button type="submit" onClick={console.log(errors)} variant="contained" sx={{mt:5 ,width:'130px'}}> Confirmar</Button> }
            </Box>
          </form>
        </Card>
        </Box>
        </Box>
    )}
    </Box>
    </Fragment>
  )
}

export default FormTratamientoCubierta
