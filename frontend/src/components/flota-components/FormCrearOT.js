// ** React Imports
import React, { Fragment, useState, useEffect } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { Box, Typography, FormLabel, Alert, Paper, Grid, Divider } from '@mui/material'
import { useRouter } from 'next/router'

// FORMULARIOS Y VALIDACIONES
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import ControladorCargaComb from '../formComponents/ControladorCargaComb'
import ErrorDialog from '../ErrorDialog'
import ControladorCargaDate from '../formComponents/ControladorCargaDate'
import ControladorCargaSwitch from '../formComponents/ControladorCargaSwitch'
import { postOT } from 'src/services/flota_endpoints/ot_admin'
import { uploadFile } from 'src/services/foto'
import ControladorCargaCombo from '../formComponents/ControladorCargaCombo'

const FormCrearOT = ({ isOpen, onClose, lista_nov, setReset }) => {
  const initialValues = {
    nueva_ot: {
      ot_fecha: new Date(),
      ot_patente: lista_nov[0]?.PATENTE,
      ot_taller: null,
      ot_programada: false,
      ot_fecha_taller: new Date(),
      ot_observaciones: '',
      ot_estado: 'ASIGNADA',
      ot_nr_factura: '',
      ot_proveedor: null,
      ot_monto : 0,
      ot_imgs: '',
    },
    lista_nov: lista_nov.map(nov => nov.NOVEDAD.nov_id)
  }

  const talleres = [
    { vkey: 'Interno', value: 'Interno' },
    { vkey: 'Externo', value: 'Externo' },

  ]

  const scheme = yup.object().shape({
    ot_taller: yup.string().required('El taller es obligatorio'),
    ot_observaciones: yup.string().min(3, 'Las observaciones deben tener al menos 3 caracteres').required('Las observaciones son obligatorias'),
    ot_programada: yup.bool(),
    //ot_nr_factura: yup.number("El numero de factura debe ser un entero")
    //.required('El numero de factura es obligatorio')
    //.integer("El numero de factura debe ser un entero")
    //.typeError("El numero de factura debe ser un entero"), // entero
    ot_observaciones: yup.string().required('Las observaciones son obligatorias'),
    ot_programada: yup.bool().required('El estado de la programación es obligatorio')
  })

  const router = useRouter()

  const handleClose = () => {
    setErroresValidacion([])
    reset(initialValues)
    onClose()
  }

  const [erroresValidacion, setErroresValidacion] = useState([])

  const {
    reset,
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: initialValues.nueva_ot,
    mode: 'onChange',
    reValidateMode: 'onBlur',
    resolver: yupResolver(scheme)
  })

  // Variable para escuchar los cambios del switch y inhabilitar la fecha de taller
  const otProgramada = watch('ot_programada')
  const otTipoTaller = watch('ot_taller')

  const handleCloseDialog = () => {
    setErroresValidacion([])
  }

  const onSubmit = async (data) => {
    // Validación de novedades
    const erroresValidacion = await validarNovedades();
    let hasError = false
    if(data.ot_programada){
      if(new Date(data.ot_fecha_taller) < new Date()){
        setErroresValidacion([... erroresValidacion,{ message: 'La fecha de taller no puede ser menor a la fecha actual' }])
        hasError = true
      }
    }
    if (erroresValidacion.length === 0 && !hasError) {
      try {
        let dataEnviar = { ...data };
        const fechaActualIso = new Date().toISOString();

        // Verifica si ot_programada está marcado
        if (dataEnviar.ot_programada) {
          dataEnviar.ot_fecha = fechaActualIso;
          dataEnviar.ot_fecha_taller = new Date(dataEnviar.ot_fecha_taller).toISOString();

        } else {
          dataEnviar.ot_fecha = fechaActualIso;
          dataEnviar.ot_fecha_taller = fechaActualIso;
        }

    // Recolectar fotos
        const fotos = getValues('ot_fotos');
        console.log( fotos )
        let imagenes = "";

        if (fotos && fotos.length > 0) {
          for (const file of fotos) {
            try {
              const uploadedFilename = await uploadFile(file, 'FOTOS');
              imagenes = `${imagenes}${uploadedFilename},`;
            } catch (uploadError) {
              console.error('Error subiendo archivo:', uploadError);
            }
          }
          // si no esta vacio las imagenes, remueve la ultima coma
          if (imagenes.length > 0) {
            imagenes = imagenes.slice(0, -1);
          }

        }

        // Prepara el objeto final para enviar
        let objetoFinal = {
          nuevo_ot: {
            ot_fecha: dataEnviar.ot_fecha,
            ot_patente: lista_nov[0]?.PATENTE || '',
            ot_taller: dataEnviar.ot_taller == 'Interno' ? 1 : 2,
            ot_programada: dataEnviar.ot_programada,
            ot_fecha_taller: dataEnviar.ot_fecha_taller,
            ot_observaciones: dataEnviar.ot_observaciones || '',
            ot_estado: dataEnviar.ot_programada ? 'PROGRAMADO' : 'EN TALLER',
            //ot_nr_factura: dataEnviar.ot_nr_factura || '',
            //ot_proveedor: dataEnviar.ot_proveedor || null,
            //ot_monto: dataEnviar.ot_monto || 0,
            //ot_imgs: imagenes // Agrega el arreglo de imágenes subidas
          },
          lista_nov: lista_nov.map(nov => nov.NOVEDAD.nov_id)
        };

        await postOT(objetoFinal);

        setReset(prev=>!prev);
        handleClose();
      } catch (error) {
        if (error.response) {
          setErroresValidacion([{ ...erroresValidacion, error: 'ERROR DE SERVIDOR', message: error.toString() }]);
          console.log(error);
        }
      }
    }
  };


  const validarNovedades = async () => {
    let erroresTemp = []
    const patenteInicial = lista_nov[0]?.PATENTE

    lista_nov.forEach(novedad => {
      if (novedad.PATENTE !== patenteInicial) {
        erroresTemp.push({ message: 'Las novedades deben tener la misma patente.' })
      }
      if (novedad.NOVEDAD.nov_estado !== 'PENDIENTE') {
        erroresTemp.push({ message: `La novedad con ID ${novedad.NOVEDAD.nov_id} no está en estado PENDIENTE.` })
      }
      if (novedad.DISPONIBILIDAD === 'En Ruta' && !otProgramada) {
        erroresTemp.push({
          message: `La novedad con ID ${novedad.NOVEDAD.nov_id} tiene una disponibilidad no permitida para esta operación: EN RUTA. \n Programe la OT para una fecha posterior o un asignela en un taller externo`
        })
      }
    })
    // Eliminar mensajes de error duplicados, si los hay
    const erroresUnicos = [...new Set(erroresTemp)]
    setErroresValidacion(erroresUnicos)
    return [...new Set(erroresTemp.map(error => JSON.stringify(error)))].map(error => JSON.parse(error));
  }

  /// USE EFFECT DE VALIDACION
/*   useEffect(() => {
    validarNovedades()
  }, [lista_nov, otProgramada, isOpen]) */

  /* useEffect(()=>{
  console.log(errors)
},[errors]) */

useEffect(() => {
    const subscription = watch((value, { name, type }) => console.log(value, name, type))
    return () => subscription.unsubscribe()
  }, [watch])

  return (
    <Fragment>
      <Dialog open={isOpen} onClose={handleClose} aria-labelledby='form-dialog-title' maxWidth='lg' fullWidth={true}>
        <DialogTitle id='form-dialog-title'>CREAR OT</DialogTitle>

        <DialogContent sx={{ height: 'auto', minHeight: '600' }}>
          {erroresValidacion.length > 0 && (
            <ErrorDialog errores={erroresValidacion} titulo={'Advertencia'} onClose={handleCloseDialog} />
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography autoFocus variant='h5' mb={2}>
              Ingrese los datos especificados
            </Typography>

            <Typography variant='h2' mb={4} mr={4} sx={{ textAlign: 'right' }}>
              PATENTE: {lista_nov[0]?.PATENTE}
            </Typography>

            <Divider sx={{ mt: '20px' , mb: '20px'}} />

            <FormLabel> • SE AGREGARAN LAS SIGUIENTES NOVEDADES:</FormLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100px', overflowY: 'auto', mt: '10px' }}>
                {/* ENCABEZADO */}
                <Paper elevation={2} sx={{ marginBottom: '10px', marginLeft: '40px', padding: '10px' }}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <b>{"ID NOVEDAD"} </b>
                  </Grid>
                  <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <b>{"DESCRIPCION DEL PROBLEMA"}</b>
                  </Grid>
                  <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <b>{"OBSERVACIONES"}</b>
                  </Grid>
                </Grid>
              </Paper>
              {/* LISTA DE NOVEDADES */}
              {lista_nov.map(nov =>
              (
                <Paper key={nov.NOVEDAD.nov_id} elevation={2} sx={{ marginBottom: '10px', marginLeft: '40px', padding: '10px' }}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {nov.NOVEDAD.nov_id}
                  </Grid>
                  <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {nov.NOVEDAD.nov_desc}
                  </Grid>
                  <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {nov.NOVEDAD.nov_observaciones}
                  </Grid>
                </Grid>
              </Paper>
              ))}
            </Box>

            <Box sx={{ height: '20px' }} />
            <ControladorCargaCombo
              control={control}
              name='ot_taller'
              options={talleres}
              label='Seleccione el tipo de Taller'
              optionValueKey='vkey'
              optionLabelKey='value'
              errors={errors ? errors : null}
            />
            <Box sx={{ height: '20px' }} />
            <FormLabel>Desea programar esta OT?</FormLabel>
            <ControladorCargaSwitch control={control} name='ot_programada' label='Programada' err={errors?.nueva_ot} />
            <Box sx={{ height: '20px' }} />
            <ControladorCargaDate
              control={control}
              name='ot_fecha_taller'
              label='Fecha taller'
              err={errors}
              disabled={!otProgramada}
            />
            <Box sx={{ height: '20px' }} />
            <ControladorCargaComb
              control={control}
              type={'text'}
              name='ot_observaciones'
              label='Agregar Observacion Extra'
              err={errors.ot_observaciones}
            />


            <DialogActions className='dialog-actions-dense'>
              <Button onClick={handleClose} variant='contained'>
                CANCELAR
              </Button>
              <Button type='submit' variant='contained'>
                CREAR OT
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}

export default FormCrearOT
