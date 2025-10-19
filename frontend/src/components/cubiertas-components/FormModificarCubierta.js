import React, { Fragment, forwardRef, useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup'
import { useForm } from 'react-hook-form';
import ControladorCargaComb from '../formComponents/ControladorCargaComb';
import { ControladorCargaDateV2 } from '../formComponents/ControladorCargaDate';
import ControladorCargaCombo, { ControladorCargaComboAsync } from '../formComponents/ControladorCargaCombo';
import { Alert, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, FormLabel, Slide, Snackbar } from '@mui/material';
import { putCubierta } from 'src/services/flota_endpoints/cubiertas_flota';
import ControladorCargaSwitch from '../formComponents/ControladorCargaSwitch';
import ControladorCargaNum from '../formComponents/ControladorCargaNum';
import ErrorDialog from '../ErrorDialog';

function FormModificarCubierta({setReload,data, open, onClose }) {
  const [apiErrors, setApiErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const id =data.CUBIERTA.cub_id

  const initialValues = {
    cub_fecha_alta: data.CUBIERTA.cub_fecha_alta,//"17/05/2024",//"2024-05-05"
    cub_serie: data.CUBIERTA.cub_serie,//0,
    cub_dot: data.CUBIERTA.cub_dot,//0,
    cub_id_dep: data.CUBIERTA.cub_id_dep,//0,
    cub_nro_interno:data.CUBIERTA.cub_nro_interno,//0,
    cub_modelo: data.CUBIERTA.cub_modelo,//"string",
    cub_marca: data.CUBIERTA.cub_marca,//"string",
    cub_mm: data.CUBIERTA.cub_mm,//0,
    cub_presion: data.CUBIERTA.cub_presion,//0,
    cub_banda: data.CUBIERTA.cub_banda,//"string",
    cub_medida: data.CUBIERTA.cub_medida,//0,
    cub_km_recorridos: data.CUBIERTA.cub_km_recorridos,//0,
    cub_observaciones: data.CUBIERTA.cub_observaciones,//"string",
    cub_pos_actual: 1,//0,
    cub_imgs: "",
    cub_estado : "ACTIVA",
    cub_fecha_baja: null,
    cub_no_km: true,
    cub_motivo: null,
  }

  const { handleSubmit, control ,formState: { errors },watch ,reset,setValue} = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(
      yup.object().shape({
        cub_fecha_alta: yup.date().typeError('Ingrese una fecha').required('Requerido'),
        cub_serie: yup.string().typeError('Requerido').required('Requerido'),
        //yup.number().typeError('Ingrese un número').required('Requerido'),
        cub_dot: yup.string().typeError('Requerido').required('Requerido'),
        /* yup.date().typeError('Ingrese un fecha')
        .when('cub_fecha_alta', (cub_fecha_alta, schema) => {
          return schema.min(cub_fecha_alta, 'La serie debe ser mayor a la fecha de alta')
        }).required('Requerido'), */
        cub_id_dep: yup.number().typeError('Ingrese un número').typeError('Requerido').required('Requerido'),
        cub_nro_interno: yup.number().typeError('Ingrese un número').required('Requerido'),
        cub_modelo: yup.string().typeError('Requerido').required('Requerido'),
        cub_marca: yup.string().typeError('Requerido').required('Requerido'),
        cub_mm: yup.number().typeError('Ingrese un número').required('Requerido'),
        cub_presion: yup.number().typeError('Ingrese un número').required('Requerido'),
        cub_banda: yup.string().typeError('Requerido').required('Requerido'),
        cub_medida: yup.string().typeError('Requerido').required('Requerido'),
        /*  yup.number().typeError('Ingrese un número').required('Requerido'), */
        cub_km_recorridos: yup.number().typeError('Ingrese un número').required('Requerido'),
        cub_observaciones: yup.string().typeError('Requerido').notRequired(),
      })
    )
  });

  const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction='up' ref={ref} {...props} />;
  })

  //resetear km recorridos si el watch cub_no_km = true
  const watchCub_no_km = watch('cub_no_km')
  useEffect(() => {
    if (watchCub_no_km === true) {
      //setValue('cub_km_recorridos', 0)
      setValue('cub_km_recorridos', data.CUBIERTA.cub_km_recorridos)
    }
  }, [watchCub_no_km])

  const onSubmit = async(data) => {
    setIsLoading(true)
    setApiErrors([])
    try {
      const fechaModificada = new Date(data.cub_fecha_alta).toISOString().split('T')[0]
      //const fechaDotModificada = new Date(data.cub_dot).toISOString().split('T')[0]
      //const dataCopy = { ...data, cub_dot: fechaDotModificada, cub_fecha_alta: fechaModificada }
      const dataCopy = { ...data, cub_fecha_alta: fechaModificada }
      const response = await putCubierta(id,dataCopy)
      setSnackbarOpen(true)
      await new Promise(resolve => setTimeout(resolve, 3000));
      setReload(prev => !prev)
      reset(initialValues)
      onClose()

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
              setApiErrors([{ error: 423, message:"Error inesperado en la validación de datos."}]);
          }
      } else {
          // Manejo de errores que no son de Axios
          console.error("Error en la solicitud que no proviene de una respuesta HTTP:", error.message);
      }
    }

    setIsLoading(false)
  }

  return (
    {data} &&(
    <Dialog
        open={open}
        keepMounted
        fullWidth={true}
        maxWidth={'xl'}
        aria-describedby="alert-dialog-slide-description"
      >
        <Snackbar open={snackbarOpen} autoHideDuration={3000} /* onClose={() => setSnackbarOpen(false)} */>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Cubierta modificada
        </Alert>
      </Snackbar>

        { apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores de Validación'} />}
        <form onSubmit={handleSubmit(onSubmit)}>

        <DialogTitle>{"Modificar Cubierta"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'inline-flex',width: '100%',flexDirection: 'row' , gap: 2, mb: 4 }}>
          <Card sx={{ p: 8 }}>
        <Box sx={{ display: 'inline-flex',width: '100%',flexDirection: 'row' , gap: 2, mb: 4 }}>
          <Box sx={{ width: '28%'}} ><ControladorCargaDateV2 name="cub_fecha_alta" label="Fecha" control={control} err={errors.cub_fecha_alta} /></Box>
          <Box sx={{ width: '30%'}} ><ControladorCargaComboAsync name="cub_id_dep" label="depositos" removeLabels={["Deposito Movimiento Interno", "Rodando", "Deposito Baja", "Deposito Baja Definitiva"]} endpoint={"/params/deposito/"} control={control} optionLabelKey='dep_nombre' optionValueKey='id' errors={errors} /></Box>
          {/* <Box sx={{ width: '25%'}} ><ControladorCargaNum name="cub_nro_interno" label="Nro Interno" control={control} err={errors.cub_nro_interno} /></Box> */}
          <Box sx={{ width: '28%'}} ><ControladorCargaComb name="cub_dot" label="DOT" control={control} err={errors.cub_dot} type={"text"} /></Box>
        </Box>
        <Box sx={{ display: 'inline-flex',width: '100%',flexDirection: 'row', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
        <Box sx={{ width: '30%'}} ><ControladorCargaComboAsync name="cub_marca" label="Marca" endpoint={"/params/marcas_modelos/"} control={control} optionLabelKey='marca' optionValueKey='marca' errors={errors} /></Box>
        <Box sx={{ width: '30%'}} ><ControladorCargaComboAsync name="cub_modelo" label="Modelo" endpoint={"/params/marcas_modelos/"} control={control} optionLabelKey='modelo' optionValueKey='modelo' errors={errors} /></Box>
        <Box sx={{ width: '30%'}} ><ControladorCargaComb name="cub_serie" label="Serie" control={control} err={errors.cub_serie} type={"text"} /></Box>
{/*         <Box sx={{ width: '30%'}} ><ControladorCargaCombo name="cub_serie" label="Serie" control={control} errors={errors} options={[{'id':1,'ser_nombre':"Serie 1"}]} optionLabelKey='ser_nombre' optionValueKey='id' /></Box>
 */}
        </Box>
        <Box sx={{ display: 'inline-flex',width: '100%',flexDirection: 'row', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
        <Box sx={{ width: '15%'}} ><ControladorCargaNum name="cub_mm" label="MM" control={control} err={errors.cub_mm} /></Box>
        {/* <Box sx={{ width: '15%'}} ><ControladorCargaNum name="cub_medida" label="Medida" control={control} err={errors.cub_medida} /></Box> */}
        <Box sx={{ width: '15%'}} ><ControladorCargaComb name="cub_medida" label="Medida" control={control} err={errors.cub_medida} type={"text"} /></Box>
        <Box sx={{ width: '15%'}} ><ControladorCargaNum name="cub_banda" label="Banda" control={control} err={errors.cub_banda} /></Box>
        <Box sx={{ width: '10%'}} ><ControladorCargaNum name="cub_presion" label="Presion" control={control} err={errors.cub_presion} /></Box>
        {/* <Box sx={{ width: '10%'}} ><ControladorCargaNum name="cub_km_recorridos" disabled={!watch('cub_no_km')} label="KM Recorridos" control={control} err={errors.cub_km_recorridos} /></Box>
        <Box sx={{ width: '10%'}} ><FormLabel htmlFor="cub_no_km">Cubierta con KM</FormLabel><ControladorCargaSwitch name="cub_no_km" label="No KM" control={control}  err={errors.cub_no_km}/></Box> */}
        </Box>
        <Box sx={{ display: 'inline-flex',width: '100%',flexDirection: 'row', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
        <ControladorCargaComb name="cub_observaciones" label="Observaciones" control={control} err={errors.cub_observaciones} />
        </Box>

          </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex',width: '90%',flexDirection: 'row-reverse', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
            {isLoading ? <Button disabled type="submit" variant="contained" sx={{mt:5 ,width:'130px'}}>Cargando...</Button> : <Button type="submit" variant="contained" sx={{mt:5 ,width:'130px'}}>Modificar</Button> }
            <Button type="button" variant="outlined" sx={{mt:5 ,width:'130px'}} onClick={onClose}>Cancelar</Button>
          </Box>
        </DialogActions>
      </form>

      </Dialog>
    )

  )
}

export default FormModificarCubierta
