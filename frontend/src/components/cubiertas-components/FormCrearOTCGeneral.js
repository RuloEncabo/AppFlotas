import React, { Fragment, forwardRef, useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup'
import { useForm } from 'react-hook-form';
import ControladorCargaComb from '../formComponents/ControladorCargaComb';
import { ControladorCargaDateV2 } from '../formComponents/ControladorCargaDate';
import ControladorCargaCombo, { ControladorCargaComboAsync } from '../formComponents/ControladorCargaCombo';
import { Alert, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, FormLabel, Slide, Snackbar, Typography } from '@mui/material';
import { putCubierta } from 'src/services/flota_endpoints/cubiertas_flota';
import ControladorCargaSwitch from '../formComponents/ControladorCargaSwitch';
import ControladorCargaNum from '../formComponents/ControladorCargaNum';
import ErrorDialog from '../ErrorDialog';
import { postOTCGeneral } from 'src/services/flota_endpoints/otc_flota';

function FormCrearOTCGeneral({setReload,data, open, onClose }) {
  const [apiErrors, setApiErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [myCubTasks, setMyCubTasks] = useState(data)

  /* DATA A ENVIAR
  {
  "nuevo_otc_general": {
    "otc_gen_fecha": "2024-10-04",
    "otc_prov_id": 0,
    "otc_estado_id": 0,
    "otc_gen_obs": "string"
  },
  "lista_otcs": [
      0
    ]
  }

  */


  const initialValues = {
    otc_gen_fecha: new Date(),
    otc_prov_id: 0,
    otc_estado_id: 1,
    otc_dep_id: 0,
    otc_gen_obs: '',
  }

  const { handleSubmit, control ,formState: { errors },watch ,reset,setValue} = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(
      yup.object().shape({
        otc_gen_fecha: yup.date().typeError('Ingrese una fecha').required('Requerido'),
        otc_prov_id: yup.number().typeError('Requerido').required('Requerido').min(1, 'Requerido'),
        otc_estado_id: yup.number().typeError('Requerido').required('Requerido').min(1, 'Requerido'),
        otc_dep_id: yup.number().typeError('Requerido').required('Requerido').min(1, 'Requerido'),
        otc_gen_obs: yup.string().typeError('Requerido').notRequired(),
      })
    )
  });

  const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction='up' ref={ref} {...props} />;
  })


  const onSubmit = async(data) => {
    setIsLoading(true)
    setApiErrors([])

    try {
      if (myCubTasks.length === 0) {
        setApiErrors([{ error: 423, message: 'Debe seleccionar al menos una tarea'}]);
        setIsLoading(false);
        return;
      }


      const fechaModificada = new Date(data.otc_gen_fecha).toISOString().split('T')[0]
      const dataCopy = { ...data, otc_gen_fecha: fechaModificada }
      const finalObject = {
        "nuevo_otc_general": dataCopy,
        "lista_otcs": myCubTasks.map(task => task.ID)
      }
      const response = await postOTCGeneral(finalObject)
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
          } else if (typeof errorDetails === 'string') {
            setApiErrors([{ error: 423, message: errorDetails}]);
          }
           else {
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

  const handleDeleteTask = (id) => {
    setMyCubTasks(prev => prev.filter(task => task.ID !== id))
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
        <Snackbar open={snackbarOpen} autoHideDuration={3000}>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          OTC Generada
        </Alert>
      </Snackbar>

        { apiErrors.length > 0 && <ErrorDialog errores={apiErrors} onClose={() => setApiErrors([])} titulo={'Errores de Validación'} />}
        <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{"Generar OTC"}</DialogTitle>
        <DialogContent>
        <Box sx={{ display: 'inline-flex',width: '100%',flexDirection: 'Column' , gap: 2, mb: 4 }}>
          <Card sx={{ p: 8 }}>
          <Box sx={{ width: '40%'}} ><ControladorCargaDateV2 name="otc_gen_fecha" label="Fecha" control={control} err={errors.otc_gen_fecha} /></Box>
          <Box sx={{ width: '40%'}} ><ControladorCargaComboAsync name="otc_prov_id" label="proveedor" endpoint={"/params/proveedores/"} control={control} optionLabelKey='prov_nombre' optionValueKey='id' errors={errors} /></Box>
          <Box sx={{ width: '40%'}} ><ControladorCargaComboAsync name="otc_dep_id" label="Deposito" endpoint={'/params/deposito/'} optionValueKey={'id'} optionLabelKey={'dep_nombre'} control={control} errors={errors} removeKeys={[1,8,9]} /></Box>
          <Box sx={{ width: '40%'}} ><ControladorCargaComb name="otc_gen_obs" label="Observaciones" multiline={true} control={control} err={errors.otc_gen_obs} /> </Box>
        </Card>

        <Box sx={{ display: 'inline-flex', width: '100%', flexDirection: 'column', gap: 2, mb: 4 }}>
          <Typography variant="h4" sx={{mt:5,mb:1}}>TAREAS</Typography>
          <Typography variant="h4" sx={{mt:5,mb:1}}>TAREAS</Typography>

          <Box sx={{ display: 'flex',paddingLeft: 4,paddingRight: 12, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">ID OTC</Typography>
          <Typography variant="h6">CUB ID</Typography>
          <Typography variant="h6">DEPOSITO</Typography>
          <Typography variant="h6">TIPO T</Typography>
          <Typography variant="h6">TRABAJO</Typography>
          <Typography variant="h6">ACCIONES</Typography>
          </Box>
          {myCubTasks.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between', // Para que los elementos se distribuyan en la fila
                alignItems: 'center',
                flexDirection: 'row',
                padding: 4,
                border: '1px solid #ccc', // Borde para separar cada tarea
                borderRadius: 2, // Bordes redondeados
              }}
            >
              <Typography variant="body1">{item.ID}</Typography>
              <Typography variant="body1">{item.CUBIERTA_NRO_INTERNO}</Typography>
              <Typography variant="body1">{item.DEPOSITO}</Typography>
              <Typography variant="body1">{item.TIPO}</Typography>
              <Typography variant="body1">{item.TRABAJO}</Typography>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDeleteTask(item.ID)}
              >
                Eliminar
              </Button>
            </Box>
          ))}
        </Box>

        </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex',width: '90%',flexDirection: 'row-reverse', flexWrap: 'wrap' , gap: 2, mb: 4 }}>
            {isLoading ? <Button disabled type="submit" variant="contained" sx={{mt:5 ,width:'130px'}}>Cargando...</Button>
                       : <Button type="submit" variant="contained" sx={{mt:5 ,width:'130px'}}>Generar OTC</Button> }
            <Button type="button" variant="outlined" sx={{mt:5 ,width:'130px'}} onClick={onClose}>Cerrar</Button>
          </Box>
        </DialogActions>
      </form>
      </Dialog>
    )

  )
}

export default FormCrearOTCGeneral
