import React, { Fragment, useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup'
import { useForm } from 'react-hook-form';
import ControladorCargaComb from '../formComponents/ControladorCargaComb';
import { ControladorCargaDateV2 } from '../formComponents/ControladorCargaDate';
import ControladorCargaCombo, { ControladorCargaComboAsync } from '../formComponents/ControladorCargaCombo';
import { Alert, Box, Button, Card, Grid, Typography } from '@mui/material';
import { getAllCubiertas, putCubiertaBajaComun} from 'src/services/flota_endpoints/cubiertas_flota';
import ErrorDialog from '../ErrorDialog';
import Snackbar from '@mui/material/Snackbar'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete';
import CustomTextField from 'src/@core/components/mui/text-field';
import ControladorCargaFotos from '../formComponents/ControladorCargaFoto';
import { uploadFile } from 'src/services/foto';
import { es } from 'date-fns/locale';

function FormBajaCubierta({setReload}) {
  const [apiErrors, setApiErrors] = useState([])
  const [data, setData] = useState([])
  const [dataCubierta, setDataCubierta] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCub, setSelectedCub] = useState(null)
  const [nroInterno, setNroInterno] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [resetSignal, setResetSignal] = useState(false);
  const [mensajeAlert, setMensajeAlert] = useState('');



useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true)
    try {
      if (nroInterno === null) {
        const res = await getAllCubiertas(0, 1000000, null, null, null, null, null, "ACTIVA")
        setData(res.CUB_LIST);
        console.log(res)
      } else {
        const res = await getAllCubiertas(0, 1000000, nroInterno , null, null, null, null, "ACTIVA")
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



  const initialValues = {
    cub_motivo: '',
    cub_observaciones: '',
    cub_fecha_baja: new Date(),
    fotos : []
  }

  const { handleSubmit, control ,formState: { errors },watch ,reset,setValue} = useForm({
    defaultValues: initialValues, mode: 'onBlur',
    resolver: yupResolver(
      yup.object().shape({
        cub_fecha_baja: yup.date().typeError('Ingrese una fecha').required('Requerido'),
        cub_motivo: yup.string().typeError('Requerido').required('Requerido'),
        cub_observaciones: yup.string().typeError('Requerido').notRequired(),
        cub_id_dep: yup.number().typeError('Ingrese un número').typeError('Requerido').required('Requerido'),
        fotos: yup.array().typeError('Requerido').min(1,'Requerido'),
      })
    )
  });


  const onSubmit = async (data, event) => {
    const actionType = event.nativeEvent.submitter.value; //TODO  baja o movimiento

    setIsLoading(true);
    setApiErrors([]);
    const fotos = watch('fotos');
    let cub_imgs = '';

    if (selectedCub === null) {
      setApiErrors([{ error: 423, message: 'Debe seleccionar una cubierta'}]);
      setIsLoading(false);
      return;
    }

    try {
      if (fotos.length > 0) {
        for (const file of fotos) {
          try {
            const uploadedFilename = await uploadFile(file, 'FOTOS');
            cub_imgs = `${cub_imgs}${uploadedFilename},`;
          } catch (uploadError) {
            console.error('Error subiendo archivo:', uploadError);
          }
        }
        cub_imgs = cub_imgs.slice(0, -1);
      }

      const fechaModificada = new Date(data.cub_fecha_baja).toISOString().split('T')[0];
      let estado = actionType == "baja" ? "BAJA" : actionType == "movimiento" ? "MOVIMIENTO INTERNO" : null;
      setMensajeAlert(estado==="BAJA" ? "Cubierta dada de baja" : "Cubierta en movimiento interno");
      console.log(estado)
      if (estado == null){
        throw "ESTADO NO DEFINIDO"
      }

      let dataCopy = { ...data, cub_fecha_baja: fechaModificada, cub_estado: estado }; // 'BAJA'

      if(cub_imgs !== '') {
        dataCopy = { ...dataCopy, cub_imgs };
      }

      await putCubiertaBajaComun(dataCubierta.cub_nro_interno, dataCopy);
      setResetSignal(prev => !prev); // Cambia resetSignal
      setReload(prev => !prev);
      reset(initialValues);
      setSelectedCub(null);
      setNroInterno(null);
      setSnackbarOpen(true);
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


  return (
    <Fragment>
    <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="warning"
          variant="filled"
          sx={{ width: '100%' }}
        >
           {mensajeAlert}
        </Alert>
      </Snackbar> { apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores de Validación'} />}
    <Box>
      <Typography variant='h4' sx={{ mb: 2 }}>BUSCAR CUBIERTA</Typography>
      <Box sx={{ display: 'inline-flex', alignItems: 'left', width: '40%',gap: 2, justifyContent: 'space-between' }}>
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

      </Box>

        <Typography variant='h4' sx={{  mt: 7}}>DATOS CUBIERTA</Typography>
      {dataCubierta&&(<Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6}>
        <CustomTextField label={'Deposito'} disabled value={dataCubierta.cub_id_dep} fullWidth/>
        </Grid>
        <Grid item xs={12} sm={6}>
        <CustomTextField label={'Kilometro'} disabled value={dataCubierta.cub_km_recorridos} fullWidth/>
        </Grid>
        <Grid item xs={12} sm={6}>
        <CustomTextField label={'Modelo'} disabled value={dataCubierta.cub_modelo} fullWidth/>
        </Grid>
        <Grid item xs={12} sm={6}>
        <CustomTextField label={'Marca'} disabled value={dataCubierta.cub_marca} fullWidth/>
        </Grid>
        <Grid item xs={12} sm={6}>
        <CustomTextField label={'Medida'} disabled value={dataCubierta.cub_medida} fullWidth/>
        </Grid>
        <Grid item xs={12} sm={6}>
        <CustomTextField label={'MM'} disabled value={dataCubierta.cub_mm} fullWidth/>
        </Grid>
        <Grid item xs={12} sm={6}>
        <CustomTextField label={'Banda'} disabled value={dataCubierta.cub_banda} fullWidth/>
        </Grid>
      </Grid>)}
    </Box>

 <Card sx={{ p: 8, mt: 8 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'inline-flex',width: '40%',flexDirection: 'column' , gap: 2, mb: 4 }}>
          <Box sx={{ width: '100%'}} ><ControladorCargaDateV2 name="cub_fecha_baja" label="Fecha de baja" control={control} err={errors.cub_fecha_baja} /></Box>
          <Box sx={{ width: '100%'}} ><ControladorCargaCombo name="cub_motivo" label="Motivo de baja" control={control} options={[{'id':1,'depositoName':"Baja por tiempo"},{'id':2,'depositoName':"Baja por falla"},{'id':3,'depositoName':"Baja por incumplimiento"}]} optionLabelKey='depositoName' optionValueKey='depositoName' errors={errors} /></Box>
         </Box>
         <Box sx={{ display: 'inline-flex',width: '50%',flexDirection: 'column' , gap: 2,ml: 5, mb: 4 }}>
         <ControladorCargaComb name="cub_observaciones" label="Observaciones" multiline={true} rows={4} control={control} err={errors.cub_observaciones} />
         <ControladorCargaComboAsync control = {control} name="cub_id_dep" label="Deposito" endpoint='/params/deposito/' optionValueKey='id' optionLabelKey='dep_nombre' errors={errors.cub_id_dep} />

         </Box>
         <ControladorCargaFotos name="fotos" label="Fotos" control={control} errors={errors} resetSignal={resetSignal} />

        <Box sx={{ display: 'flex',width: '90%',flexDirection: 'row-reverse', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
    {isLoading ?
      <Button disabled variant="contained" sx={{mt:5 ,width:'130px'}}>Cargando...</Button> :
      <Button
        type="submit"
        name="action"
        value="baja"
        variant="contained"
        sx={{mt:5 ,width:'130px'}}
      >
        Dar Baja
      </Button>
    }
    {isLoading ?
      <Button disabled variant="contained" sx={{mt:5 ,width:'130px'}}>Cargando...</Button> :
      <Button
        type="submit"
        name="action"
        value="movimiento"
        variant="contained"
        sx={{mt:5 ,width:'130px'}}
      >
        Movimiento interno
      </Button>
    }
    </Box>
      </form>
    </Card>
    </Fragment>
  )
}

export default FormBajaCubierta
