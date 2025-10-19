// ** React Imports
import React, { Fragment, useState, useEffect } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { Box, Typography, FormLabel, Alert, LinearProgress } from '@mui/material'
import { useRouter } from 'next/router'

// FORMULARIOS Y VALIDACIONES
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import ControladorCargaNum from '../formComponents/ControladorCargaNum'
import ControladorCargaComb from '../formComponents/ControladorCargaComb'
import ErrorDialog from '../ErrorDialog'
import ControladorCargaDate from '../formComponents/ControladorCargaDate'
import ControladorCargaSwitch from '../formComponents/ControladorCargaSwitch'
import ControladorCargaCombo from '../formComponents/ControladorCargaCombo'
import { postOT } from 'src/services/flota_endpoints/ot_admin'
import { getCatNovedadesHDR } from 'src/services/chofer_endpoints/cat_novedad'
import { updateNov } from 'src/services/flota_endpoints/novedad_admin'
import { getHDRbyId } from 'src/services/flota_endpoints/hdr_admin'

const FormEditarNov = ({ isOpen, onClose, data ,dataHDR }) => {

  const [initialValues,setInitialValues] = useState({
      nov_id: data?.nov_id,
      nov_hdr_id: data?.nov_hdr_id,
      nov_fecha: new Date(data?.nov_fecha),
      nov_lugar: data?.nov_lugar ,
      nov_desc: data?.nov_desc,
      nov_km_odo: data?.nov_km_odo,
      nov_cat_id: data?.nov_cat_id,
      nov_img: data?.nov_img,
      nov_solucionado: data?.nov_solucionado,
      nov_tractor: data?.nov_tractor,
      nov_observaciones: data?.nov_observaciones,
      nov_estado: data?.nov_estado,
      nov_asignacion: data?.nov_asignacion
    })

    const [catNovedades, setCatNovedades] = useState([])
    const isHDRClosed = dataHDR?.hoja_de_ruta?.hdr_active // bool

    // inicializar
    useEffect(() => {
      reset(initialValues)
    }, [data,catNovedades])

    const nov_id = data?.nov_id
    const nov_img = data?.nov_img

  // TIPO DE NOVEDADES
  useEffect(() => {
    const fetchData = async () => {
      console.log("LA DATA HDR ES: ",dataHDR)
      try {
        const resCatNovedades = await getCatNovedadesHDR()
        setCatNovedades(resCatNovedades)
      } catch (error) {

        console.error('Error traer las categorias de novedades:', error)
      }
    }
    fetchData()
  }, [])

  const estadoNovedades = [
    { vkey: 'PENDIENTE', value: 'PENDIENTE' },
    { vkey: 'RESUELTA', value: 'RESUELTA' },
    { vkey: 'ASIGNADA', value: 'ASIGNADA' },
    { vkey: 'ATENDIDA', value: 'ATENDIDA' },
    { vkey: 'CERRADA', value: 'CERRADA' }
  ]

  const asignacion = [
    { vkey: 'SIN ASIGNAR', value: 'SIN ASIGNAR'},
    { vkey: 'ADMIN 1', value: 'ADMIN 1' },
    { vkey: 'ADMIN 2', value: 'ADMIN 2' },
  ]

  const scheme = yup.object().shape({
    nov_lugar: yup.string().required(),
    nov_desc: yup.string().required(),
    nov_km_odo: yup.number().required(),
    nov_cat_id: yup.number().required(),
    nov_solucionado: yup.boolean(),
    nov_tractor: yup.boolean(),
    nov_observaciones: yup.string(),
    nov_estado: yup.string().required(),
    nov_asignacion: yup.string(),
  })

  const router = useRouter()

  const handleClose = () => {
    setErroresValidacion([])
    reset(initialValues)
    onClose()
    router.reload()
  }

  const [erroresValidacion, setErroresValidacion] = useState([])

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: initialValues.nueva_ot,
    mode: 'onChange',
    reValidateMode: 'onBlur',
    resolver: yupResolver(scheme)
  })

  // Variable para escuchar los cambios del switch y inhabilitar la fecha de taller
  //const otProgramada = watch('ot_programada')

  const handleCloseDialog = () => {
    setErroresValidacion([])
  }

  const onSubmit = async data => {
    setErroresValidacion([])
    const erroresValidacion = await ejecutarValidaciones()
    if (erroresValidacion.length === 0) {
      try {
        let dataEnviar = { ...data }
        // Transformar fecha
        const fechaTransformada = data.nov_fecha.toISOString()
          dataEnviar.nov_fecha =  fechaTransformada
        // Prepara el objeto final para enviar
        let objetoFinal = {
          nov_hdr_id: dataEnviar.nov_hdr_id,
          nov_id: nov_id,
          nov_lugar: dataEnviar.nov_lugar,
          nov_desc: dataEnviar.nov_desc,
          nov_fecha: dataEnviar.nov_fecha,
          nov_km_odo: dataEnviar.nov_km_odo,
          nov_cat_id: dataEnviar.nov_cat_id,
          nov_solucionado: dataEnviar.nov_solucionado,
          nov_tractor: dataEnviar.nov_tractor,
          nov_observaciones: dataEnviar.nov_observaciones,
          nov_asignacion: dataEnviar.nov_asignacion,
          nov_estado: dataEnviar.nov_estado,
          nov_img: nov_img
        }
        //console.log(erroresValidacion)
        console.log(objetoFinal)
        await updateNov(nov_id, objetoFinal)
      } catch (error) {
        if (error.response) {
          setErroresValidacion([{ ...erroresValidacion, error: 'ERROR DE SERVIDOR', message: error.toString() }])
          console.log(error)
        }
      } finally {
        if (erroresValidacion.length == 0){
          handleClose()
        }
      }
    }
  }


  const ejecutarValidaciones = async () => {
    /*let erroresTemp = []
    const patenteInicial = lista_nov[0]?.PATENTE

    lista_nov.forEach(novedad => {
      if (novedad.PATENTE !== patenteInicial) {
        erroresTemp.push({ message: 'Las novedades deben tener la misma patente.' })
      }
      if (novedad.NOVEDAD.nov_estado !== 'PENDIENTE') {
        erroresTemp.push({ message: `La novedad con ID ${novedad.NOVEDAD.nov_id} no está en estado PENDIENTE.` })
      }
      if (novedad.NOVEDAD.nov_asignacion !== 'SIN ASIGNAR') {
        erroresTemp.push({ message: `La novedad con ID ${novedad.NOVEDAD.nov_id} no está en estado SIN ASIGNAR.` })
      }
      if (novedad.DISPONIBILIDAD === 'En Ruta' && !otProgramada) {
        erroresTemp.push({
          message: `La novedad con ID ${novedad.NOVEDAD.nov_id} tiene una disponibilidad no permitida para esta operación: EN RUTA. \n Programe la OT para una fecha posterior`
        })
      }
    })
    // Eliminar mensajes de error duplicados, si los hay
    const erroresUnicos = [...new Set(erroresTemp)]
    setErroresValidacion(erroresUnicos)
    return [...new Set(erroresTemp.map(error => JSON.stringify(error)))].map(error => JSON.parse(error));*/

    return []
  }

  /// USE EFFECT DE VALIDACION
/*   useEffect(() => {
    validarNovedades()
  }, [lista_nov, otProgramada, isOpen]) */

  /* useEffect(()=>{
  console.log(errors)
},[errors]) */

/*   useEffect(() => {
    const subscription = watch((value, { name, type }) => console.log(value, name, type))
    return () => subscription.unsubscribe()
  }, [watch]) */

  return (
    <Fragment>
      <Dialog open={isOpen} onClose={handleClose} aria-labelledby='form-dialog-title' maxWidth='lg' fullWidth={true}>
        <DialogTitle id='form-dialog-title'>EDITANDO LA NOVEDAD {nov_id}</DialogTitle>
        <DialogContent sx={{ height: 'auto', minHeight: '600' }}>
          {erroresValidacion.length > 0 && (
            <ErrorDialog errores={erroresValidacion} titulo={'Advertencia'} onClose={handleCloseDialog} />
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography autoFocus variant='h5' mb={2}>
              Ingrese los datos especificados
            </Typography>

            <Box sx={{ height: '20px' }} />
            <ControladorCargaDate
              control={control}
              disabled={!isHDRClosed}
              name='nov_fecha'
              label='FECHA DE LA NOVEDAD'
              err={errors}
            />
            <Box sx={{ height: '20px' }} />
            <ControladorCargaComb
              control={control}
              disabled={!isHDRClosed}
              type={'text'}
              name='nov_lugar'
              label='Escriba el lugar de la novedad'
              err={errors.nov_lugar}
            />
            <Box sx={{ height: '20px' }} />
            <ControladorCargaComb
              control={control}
              disabled={!isHDRClosed}
              type={'text'}
              name='nov_desc'
              label='Describa la novedad'
              err={errors.nov_desc}
            />
            <Box sx={{ height: '20px' }} />

            <ControladorCargaNum
              disabled={!isHDRClosed}
              control={control}
              name='nov_km_odo'
              label='Ingrese el kilometraje del odometro'
              err={errors.nov_km_odo}
            />
            <Box sx={{ height: '20px' }} />

            <ControladorCargaCombo
              control={control}
              name='nov_cat_id'
              disabled={!isHDRClosed}
              options={catNovedades}
              label='Seleccione la categoria'
              optionValueKey='cn_id'
              optionLabelKey='cn_nombre'
              errors={errors ? errors : null}
            />
            <Box sx={{ height: '20px' }} />

            <FormLabel>Fue Solucionado?</FormLabel>
            <ControladorCargaSwitch
              disabled={!isHDRClosed}
              control={control}
              name='nov_solucionado'
              label='Fue solucionado?'
              err={errors.nov_solucionado}
            />

            <Box sx={{ height: '20px' }} />


            <FormLabel>Fue en el tractor?</FormLabel>
            <ControladorCargaSwitch
              disabled={!isHDRClosed}
              control={control}
              name='nov_tractor'
              label='Fue solucionado?'
              err={errors.nov_tractor}
            />

            <Box sx={{ height: '20px' }} />


            <ControladorCargaComb
              control={control}
              disabled={!isHDRClosed}
              type={'text'}
              name='nov_observaciones'
              label='Agregar Observacion Extra'
              err={errors.nov_observaciones}
            />
            <Box sx={{ height: '20px' }} />

            <ControladorCargaCombo
              control={control}
              name='nov_estado'
              options={estadoNovedades}
              label='Seleccione un estado de la novedad'
              optionValueKey='vkey'
              optionLabelKey='value'
              errors={errors ? errors : null}
            />

            <Box sx={{ height: '20px' }} />

            <DialogActions className='dialog-actions-dense'>
              <Button onClick={handleClose} variant='contained'>
                CANCELAR
              </Button>
              <Button type='submit' variant='contained'>
                EDITAR NOVEDAD
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}



export default FormEditarNov
