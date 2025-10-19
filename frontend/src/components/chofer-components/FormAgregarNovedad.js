// ** React Imports
import React, { Fragment, useState, useEffect } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { Grid, Switch, Box, Typography, InputLabel, FormHelperText, FormLabel, RadioGroup, FormControlLabel, Radio, DialogContentText } from '@mui/material'
import { forwardRef } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { useRouter } from 'next/router'
import { getCatNovedadesHDR } from 'src/services/chofer_endpoints/cat_novedad'

// FORMULARIOS Y VALIDACIONES
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import FormControl from '@mui/material/FormControl'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { postNovedadHDR, putNovedadHDR } from 'src/services/chofer_endpoints/novedad'


//context chofer
import { useContext } from 'react'
import { AuthContext } from 'src/context/AuthContext'
import { postFoto } from 'src/services/foto'
import ToggleButton from 'src/@core/theme/overrides/toggleButton'
import { da, es } from 'date-fns/locale'
import { getUltimoKmHDR } from 'src/services/chofer_endpoints/movimiento'


// Componente para que funcione el picker
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

const FormCargaNovedad = ({ isOpen, onClose, dataUpdate, isAgregando, hdr_id, nov_id ,setNovedades}) => {

  const [catNovedades, setCatNovedades] = useState([])
  const [novTractor, setNovTractor] = useState(dataUpdate?.nov_tractor || true )
  const [listaImagenes,setListaImagenes] = useState([])
  const [listaImagenPreviewUrl, setListaImagenPreviewUrl] = useState([])
  const [apiErrors, setApiErrors] = useState([]);
  const [ultimoKmValidar, setKmValidar] = useState(0)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Inicializar estados con los valores por defecto o los proporcionados en data
  const [cargaNovedad, setCargaNovedad] = useState({
    nov_hdr_id: hdr_id,
    nov_fecha: dataUpdate?.nov_fecha || new Date().toISOString(),
    nov_lugar: dataUpdate?.nov_lugar || '',
    nov_desc: dataUpdate?.nov_desc || '',
    nov_km_odo: dataUpdate?.nov_km_odo || 0,
    nov_cat_id: dataUpdate?.nov_cat_id || 0,
    nov_img: dataUpdate?.nov_img || '',
    nov_solucionado: dataUpdate?.nov_solucionado || false,
    nov_observaciones: dataUpdate?.nov_observaciones || '',
    nov_estado: dataUpdate?.nov_estado || 'PENDIENTE',
    nov_tractor: dataUpdate?.nov_tractor || true,
  })

  useEffect(() => {
    if (dataUpdate!=null) {
      setCargaNovedad({
        nov_hdr_id: hdr_id,
        nov_fecha: dataUpdate?.nov_fecha|| new Date().toISOString(),
        nov_lugar: dataUpdate?.nov_lugar || '',
        nov_desc: dataUpdate?.nov_desc || '',
        nov_km_odo: dataUpdate?.nov_km_odo || 0,
        nov_cat_id: dataUpdate?.nov_cat_id || 0,
        nov_img: dataUpdate?.nov_img || '',
        nov_solucionado: dataUpdate?.nov_solucionado || false,
        nov_observaciones: dataUpdate?.nov_observaciones || '',
        nov_estado: dataUpdate?.nov_estado || 'PENDIENTE',
        nov_tractor: dataUpdate?.nov_tractor || true,
      })
    }
  }, [dataUpdate, hdr_id,catNovedades])



  const schemeAgregar = yup.object().shape({
    nov_lugar: yup.string("").min(4,"EL LUGAR DEBE CONTENER MAS DE 4 LETRAS").required("ESTE CAMPO ES REQUERIDO"),
    nov_desc: yup.string("").min(4,"EL LUGAR DEBE CONTENER MAS DE 4 LETRAS").required("INGRESE UNA DESCRIPCION DEL PROBLEMA"),
    nov_km_odo: yup.number("INGRESE UN NUMERO").min(1,"INGRESE UN NUMERO MAYOR").required("ESTE CAMPO ES REQUERIDO"),
    nov_cat_id: yup.number().min(1,"seleccione una opcion valida"),
    nov_solucionado: yup.bool().required("ESTE CAMPO ES REQUERIDO"),
    nov_observaciones: yup.string().max(150,"LA OBSERVACION ES DEMASIADO LARGA").notRequired(),

    //nov_estado: dataUpdate?.nov_estado || 'PENDIENTE'
  })

  const scheme = schemeAgregar

  //const scheme = isAgregando ? schemeAgregar : schemeCerrar

  const defaultValues = {
    nov_hdr_id: hdr_id,
    nov_fecha: dataUpdate?.nov_fecha || new Date().toISOString(),
    nov_lugar: dataUpdate?.nov_lugar || '',
    nov_desc: dataUpdate?.nov_desc || '',
    nov_km_odo: dataUpdate?.nov_km_odo || 0,
    nov_cat_id: dataUpdate?.nov_cat_id || 0,
    nov_img: dataUpdate?.nov_img || '',
    nov_solucionado: dataUpdate?.nov_solucionado || false,
    nov_observaciones: dataUpdate?.nov_observaciones || '',
    nov_estado: dataUpdate?.nov_estado || 'PENDIENTE',
    nov_tractor: dataUpdate?.nov_tractor || true,
  }
  const router = useRouter()

  const handleClose = () => {
    setCargaNovedad({
      nov_hdr_id: hdr_id,
      nov_fecha: dataUpdate?.nov_fecha || new Date().toISOString(),
      nov_lugar: dataUpdate?.nov_lugar || '',
      nov_desc: dataUpdate?.nov_desc || '',
      nov_km_odo: dataUpdate?.nov_km_odo || 0,
      nov_cat_id: dataUpdate?.nov_cat_id || 0,
      nov_img: dataUpdate?.nov_img || '',
      nov_solucionado: dataUpdate?.nov_solucionado || false,
      nov_observaciones: dataUpdate?.nov_observaciones || '',
      nov_estado: dataUpdate?.nov_estado || 'PENDIENTE',
      nov_tractor: dataUpdate?.nov_tractor || true,
    })
    reset(defaultValues)
    setListaImagenPreviewUrl([])
    setListaImagenes([])
    onClose()
  }

    // ULTIMO KILOMETRO
    useEffect(() => {
      const fetchData = async () => {
        try {
          const res = await getUltimoKmHDR()
          setKmValidar(res)
        } catch (error) {
          console.error('ERROR AL TRAER ULTIMO KILOMETRO:', error)
        }
      }
      fetchData()
    }, [])

  // TIPO DE NOVEDADES
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCatNovedades = await getCatNovedadesHDR()
        setCatNovedades(resCatNovedades)
      } catch (error) {
        console.error('Error traer las categorias de novedades:', error)
      }
    }
    fetchData()
  }, [])

  // funcion para solo numeros enteros
  const handleKeyDown = e => {
    const key = e.key || e.code
    if (key === 'Backspace' || key === 'Delete') {
      return
    }
    if (!(key >= '0' && key <= '9')) {
      e.preventDefault()
    }
  }

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues, mode: 'onBlur', resolver: yupResolver(scheme) })

  const handleChange = (field, value) => {
    setCargaNovedad(prevData => ({
      ...prevData,
      [field]: value
    }))
  }

  const handleChangeBool = (field, value) => {
    setCargaNovedad(prevData => ({
      ...prevData,
      [field]: value
    }))
  }

  const handleChangeNumeric = (field, value) => {
    const numericValue = value !== null && value !== '' ? parseFloat(value) : null

    setCargaNovedad(prevData => ({
      ...prevData,
      [field]: numericValue
    }))
  }
  const handleConfirm = async () => {
    setOpenConfirmDialog(false); // Cierra el diálogo

    let idRandom = Math.floor(Date.now() / 1000); // Genera un ID unico con la fecha.
    if (listaImagenPreviewUrl != []){
      var nuevaCargaNovedad = { ...cargaNovedad, nov_img: idRandom.toString() };
    }else{
      var nuevaCargaNovedad = { ...cargaNovedad, nov_img: idRandom.toString() };
    }

    if(cargaNovedad.nov_km_odo<ultimoKmValidar){
      setApiErrors([{error:422,message:" "+ultimoKmValidar}])
    }

    try {
      if (isAgregando) {
        //---------- AGREGANDO POST -------------------------------------------------------
        //SUBIDA DE IMAGENES
        for (const img of listaImagenes) {
          try {
            await postFoto("novedades", hdr_id, idRandom, img);
          } catch (error) {
            if(error.response && error.response.status === 422) {
              setApiErrors([{error:422,message:"NO SE PUDIERON CARGAR TODAS LAS FOTOS"}])
              console.log(error)
            }
          }
        }
          //SUBIDA DEL DATO
          try {
            nuevaCargaNovedad = { ...nuevaCargaNovedad, nov_tractor: novTractor };
            await postNovedadHDR(nuevaCargaNovedad)
            setNovedades(currentNovedades => [...currentNovedades, nuevaCargaNovedad]);
          } catch (error) {
            console.log(error)
          } finally{
            handleClose()
          }



      } else {
        //-------- UPDATE-----------------------------------------
        console.log('ACTUALIZANDO OBJETO: ', cargaNovedad)
        try {
          nuevaCargaNovedad = { ...nuevaCargaNovedad, nov_tractor: novTractor };
          nuevaCargaNovedad = { ...nuevaCargaNovedad, nov_img: dataUpdate?.nov_img || '' };
          await putNovedadHDR(dataUpdate.nov_id,  nuevaCargaNovedad)
        } catch (error) {
          console.log(error)
        } finally{
          handleClose()
        }
         router.reload('/chofer/chofer-novedades')
      }
      //router.reload('/chofer/chofer-novedades')
      handleClose() //
    } catch (error) {
      console.log(error)
    }
  };

  const onSubmit = async (data) => {

    if (data.nov_km_odo < ultimoKmValidar) {
      // Abrir diálogo de confirmación en lugar de enviar el formulario
      console.log("ENTRE A LA VALIDACION")
      setOpenConfirmDialog(true);
      return; // Detener la ejecución adicional para esperar la confirmación del usuario
    } else {



    let idRandom = Math.floor(Date.now() / 1000); // Genera un ID unico con la fecha.
    if (listaImagenPreviewUrl != []){
      var nuevaCargaNovedad = { ...cargaNovedad, nov_img: idRandom.toString() };
    }else{
      var nuevaCargaNovedad = { ...cargaNovedad, nov_img: idRandom.toString() };
    }

    if(cargaNovedad.nov_km_odo<ultimoKmValidar){
      setApiErrors([{error:422,message:" "+ultimoKmValidar}])
    }

    try {
      if (isAgregando) {
        //---------- AGREGANDO POST -------------------------------------------------------
        //SUBIDA DE IMAGENES
        for (const img of listaImagenes) {
          try {
            await postFoto("novedades", hdr_id, idRandom, img);
          } catch (error) {
            if(error.response && error.response.status === 422) {
              setApiErrors([{error:422,message:"NO SE PUDIERON CARGAR TODAS LAS FOTOS"}])
              console.log(error)
            }
          }
        }
          //SUBIDA DEL DATO
          try {
            nuevaCargaNovedad = { ...nuevaCargaNovedad, nov_tractor: novTractor };
            await postNovedadHDR(nuevaCargaNovedad)
            setNovedades(currentNovedades => [...currentNovedades, nuevaCargaNovedad]);
          } catch (error) {
            console.log(error)
          } finally{
            handleClose()
          }



      } else {
        //-------- UPDATE-----------------------------------------
        console.log('ACTUALIZANDO OBJETO: ', cargaNovedad)
        try {
          nuevaCargaNovedad = { ...nuevaCargaNovedad, nov_tractor: novTractor };
          nuevaCargaNovedad = { ...nuevaCargaNovedad, nov_img: dataUpdate?.nov_img || '' };
          await putNovedadHDR(dataUpdate.nov_id,  nuevaCargaNovedad)
        } catch (error) {
          console.log(error)
        } finally{
          handleClose()
        }
         router.reload('/chofer/chofer-novedades')
      }
      //router.reload('/chofer/chofer-novedades')
      handleClose() //
    } catch (error) {
      console.log(error)
    }
  }
  }



  const handleTipoCatChange = (event, newValue, onChange) => {
    event.preventDefault()

    // Verificar si el valor seleccionado está en las opciones válidas
    const isValidOption = catNovedades.some(option => option.cn_id === (newValue ? newValue.cn_id : 0))

    if (isValidOption) {
      handleChange('nov_cat_id', newValue ? newValue.cn_id : 0)
      onChange(newValue? newValue.cn_id : 0)
    }
  }



  const handleFileChange = async(event) => {
    const files = event.target.files; // Esto te permite trabajar con múltiples archivos si decides hacerlo
    try {
      for (let file of files) {
        if (file) {
          // Añade el archivo al estado de imágenes
          setListaImagenes(currentImages => [...currentImages, file]);

          // Crea una URL para el archivo y la añade al estado de URLs de vista previa
          const url = URL.createObjectURL(file);
          setListaImagenPreviewUrl(currentUrl => [...currentUrl, url]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };


  const hasImage = cargaNovedad && cargaNovedad.nov_img

  return (
    <Fragment>
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>{"Kilometraje Inferior"}</DialogTitle>
          <DialogContent>
              El kilometraje ingresado es inferior al último registrado. ¿Deseas continuar?
          </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} autoFocus>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        aria-labelledby='form-dialog-title'
        maxWidth='lg'
        fullWidth={true}
      >
        {isAgregando ? (
          <DialogTitle id='form-dialog-title'>Agregar Novedad</DialogTitle>
        ) : (
          <DialogTitle id='form-dialog-title'>Modificar Novedad</DialogTitle>
        )}{' '}
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography autoFocus variant='h5'>
              Ingrese los datos especificados
            </Typography>

            <Controller
              name='nov_lugar'
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  id='nov-lugar'
                  fullWidth
                  type='text'
                  label='Ubicacion'
                  sx={{ mt: 1, mb: 1 }}
                  onChange={e => {
                    handleChange('nov_lugar', e.target.value)
                    onChange(e)
                  }}
                  value={value}
                  error={Boolean(errors.nov_lugar)}
                  {...(errors.nov_lugar && { helperText: errors.nov_lugar.message })}
                />
              )}
            />

            <Box sx={{ mt: 5, mb: 1 }}>
              <Controller
                name='nov_fecha'
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      showTimeSelect
                      timeFormat='HH:mm'
                      timeIntervals={15}
                      selected={value ? new Date(value) : null}
                      id='fecha-novedad'
                      dateFormat='dd/MM/yyyy h:mm aa'
                      popperPlacement={'auto'}
                      locale={es}
                      onChange={date => {
                        onChange(date)
                        handleChange('nov_fecha', date.toISOString())
                      }}
                      customInput={
                        <PickersComponent label='Fecha y Hora de la novedad' inputProps={{ readOnly: true }} />
                      }
                      error={!!errors.nov_fecha}
                      helperText={errors.nov_fecha?.message}
                    />
                  </DatePickerWrapper>
                )}
              />
            </Box>

            <Controller
              name='nov_km_odo'
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  id='km-novedad'
                  fullWidth
                  type='text'
                  label='Km Actual de la novedad'
                  sx={{ mt: 1, mb: 1 }}
                  onKeyDown={handleKeyDown}
                  onChange={e => {
                    handleChangeNumeric('nov_km_odo', e.target.value)
                    onChange(e)
                  }}
                  value={value}
                  error={Boolean(errors.nov_km_odo)}
                  {...(errors.nov_km_odo && { helperText: errors.nov_km_odo.message })}
                />
              )}
            />
            <Controller
              name='nov_cat_id'
              control={control}
              render={({ field: { onChange, value ,onBlur} }) => (
                <CustomAutocomplete
                  sx={{ width: '100%' }}
                  onBlur={onBlur}
                  options={catNovedades}
                  value={catNovedades.find(option => option.cn_id === value)}
                  //defaultValue={dataUpdate? catNovedades[dataUpdate?.nov_cat_id] : null}
                  error={errors.nov_cat_id ? Boolean(errors.nov_cat_id) : undefined}
                  id='cmb-tipo-novedad'
                  getOptionLabel={option => option.cn_nombre || 'Sin valor'}
                  onChange={(event, newValue) => {handleTipoCatChange(event, newValue,onChange)}}

                  /* value={cargaNovedad.nov_cat_id} */
                  renderInput={params =>
                    (<div>
                      <CustomTextField {...params} label='SELECCIONE UNA CATEGORIA DE NOVEDAD' />
                      {errors.nov_cat_id && (
                      <FormHelperText sx={{ color: 'error.main' }}>
                        {errors.nov_cat_id.message}
                      </FormHelperText>
                     )}
                     </div>)}
                />
              )}
            />
            <Controller
              name='nov_desc'
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomTextField
                  id='descripcion-problema'
                  fullWidth
                  type='text'
                  label='Cual es el problema?'
                  value={value}
                  onChange={e => {
                    handleChange('nov_desc', e.target.value)
                    onChange(e)
                  }}
                  sx={{ mt: 1, mb: 1 }}
                  error={Boolean(errors.nov_desc)}
                  {...(errors.nov_desc && { helperText: errors.nov_desc.message })}
                />
              )}
            />
            {/* --------------IMAGEN ----------------------------------------- */}

            <FormControl fullWidth margin='normal'>
              <Button variant='contained' component='label' fullWidth>
                {listaImagenPreviewUrl.length > 0 ? 'Subir Otra' : isAgregando ? 'Subir Imagenes' : 'Subir Imagenes de nuevo'}
                <input type='file' hidden accept='image/*' onChange={handleFileChange} multiple />
              </Button>
                {listaImagenPreviewUrl.map((imagenUrl, index) => (
                 <img key={index} src={imagenUrl} alt={`Vista previa ${index + 1}`} style={{ maxWidth: '70%', height: 'auto', margin: "auto", marginTop: "30px", marginBottom: "15px"}} />
               ))}
            </FormControl>

            {/* ------------SWITCHES-------------------------------------------------- */}
            <Grid component='label' direction='column' container alignItems='left' spacing={1} sx={{ pl: 5, mt: 5 }}>
              <Grid item>Pudo Solucionarlo?</Grid>
              <Grid item>
                <Switch
                  checked={cargaNovedad.nov_solucionado}
                  onChange={() => handleChangeBool('nov_solucionado', !cargaNovedad.nov_solucionado)}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </Grid>
            </Grid>

            {/* ------------RADIO BUTTONS-------------------------------------------------- */}
            <Grid sx={{mt: 5}}>
                <Typography>La novedad corresponde a tractor o batea?</Typography>
            </Grid>
            <Grid container alignItems='start' spacing={1} sx={{ pl: 7, mt: 1 }}>

              <Grid item>
                <RadioGroup
                  aria-label="platform"
                  name="platform"
                  value={novTractor}
                  onChange={(event) => setNovTractor(event.target.value)}
                >
                  <FormControlLabel value={true} control={<Radio />} label="TRACTOR" />
                  <FormControlLabel value={false} control={<Radio />} label="BATEA" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Controller
              name='nov_observaciones'
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomTextField
                  id='observaciones'
                  fullWidth
                  type='text'
                  label='Observaciones para agregar?'
                  value={value}
                  onChange={e => {
                    handleChange('nov_observaciones', e.target.value)
                    onChange(e)
                  }}
                  sx={{ mt: 1, mb: 1 }}
                  error={Boolean(errors.nov_observaciones)}
                  {...(errors.nov_observaciones && { helperText: errors.nov_observaciones.message })}
                />
              )}
            />
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleClose}>CANCELAR</Button>
          <Button type='submit'>{isAgregando? "AGREGAR NOVEDAD" : "MODIFICAR NOVEDAD"}</Button>
        </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}

export default FormCargaNovedad
