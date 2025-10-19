import React, { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Switch from '@mui/material/Switch'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import ErrorDialog from 'src/components/ErrorDialog'

import { useRouter } from 'next/router'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import * as Yup from 'yup'

// Importar servicios
import { getFlotas } from 'src/services/chofer_endpoints/flota'
import { getBateas } from 'src/services/chofer_endpoints/batea'
import { getDestinos } from 'src/services/chofer_endpoints/destino'
import { createHDR } from 'src/services/chofer_endpoints/hdr'

const FormCrearHDR = () => {
  const [formData, setFormData] = useState({
    hdr_flota_id: 0,
    hdr_batea_id: 1,
    hdr_adelanto: 0,
    hdr_viatico_nac: 0,
    hdr_viatico_plus: 0,
    hdr_destino_id: 1,
    hdr_comentarios: "",
    hdr_tanque_lleno: false,
    hdr_tanque_lleno_urea: false,
  })

  // ESQUEMA DE VALIDACION - YUP
  const validationSchema = Yup.object().shape({
    hdr_flota_id: Yup.number().integer().required().min(1, 'Seleccione una flota'),
    hdr_batea_id: Yup.number().integer(),
    hdr_destino_id: Yup.number().integer().required('Seleccione un destino').min(1, 'Seleccione un destino valido'),
    hdr_adelanto: Yup.number().integer().min(0, 'El adelanto debe ser un valor positivo').notRequired(),
    hdr_viatico_nac: Yup.number()
      .integer()
      .min(0, 'El adelanto debe ser un valor positivo o igual a 0')
      .notRequired()
      .max(1000000, 'El viatico nacional maximo es de 1000000$ ARS'),
    hdr_viatico_int: Yup.number()
      .integer()
      .min(0, 'El adelanto debe ser un valor positivo o igual a 0')
      .notRequired()
      .max(2000, 'El viatico internacional maximo es 2000$ USD'),
    hdr_viatico_plus: Yup.number()
      .integer()
      .min(0, 'El viatico plus debe ser un valor o igual a 0')
      .notRequired()
      .max(80000, 'El viatico plus limite es de 80000$ USD'),
    hdr_km_trans: Yup.number().integer(),

    hdr_tanque_lleno: Yup.bool().required('Este campo es obligatorio'),
    hdr_tanque_lleno_urea: Yup.bool().required('Este campo es obligatorio')
  })

  const [flotaOptions, setFlotaOptions] = useState([])
  const [batOptions, setBatOptions] = useState([])
  const [desOptions, setDesOptions] = useState([])
  const [dominioTractor, setDominioTractor] = useState('')
  const [showViaticoPlus, setShowViaticoPlus] = useState(false)
  const [tanqueLleno, setTanqueLleno] = useState(false)
  const [tanqueLlenoUrea, setTanqueLlenoUrea] = useState(false)
  const [desOptionsNacional, setDesOptionsNacional] = useState([])
  const [desOptionsInternacional, setDesOptionsInternacional] = useState([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [tipoViaje, setTipoViaje] = useState('nacional')
  const [des, setDes] = useState('')
  const [selectedFlota, setSelectedFlota] = useState(null)
  const [erroresValidacion, setErroresValidacion] = useState([])

  const router = useRouter()

  //inicializar listas desplegables
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener flotas
        const respuestaFlotas = await getFlotas()
        const misFlotas = respuestaFlotas.data
        setFlotaOptions(misFlotas)

        // Obtener bateas
        const respuestaBat = await getBateas()
        const misBat = respuestaBat.data
        setBatOptions(misBat)
        // Obtener destinos

        const respuestaDes = await getDestinos()
        const misDesNacionales = respuestaDes.data.filter(des => des.des_tipo === 1)
        const misDesInternacionales = respuestaDes.data.filter(des => des.des_tipo === 2)

        setDesOptions(misDesNacionales)
        setDesOptionsNacional(misDesNacionales)
        setDesOptionsInternacional(misDesInternacionales)
      } catch (error) {
        console.error('Error al obtener datos:', error)
      }
    }

    fetchData()
  }, [ setFlotaOptions, setBatOptions, setDesOptions, setDesOptionsNacional, setDesOptionsInternacional ])

  const onSubmit = async e => {
    e.preventDefault()
    try {
      // Validar el formulario con Yup
      await validationSchema.validate(formData, { abortEarly: false })


      await createHDR(formData,formData.hdr_viatico_nac,formData.hdr_viatico_plus,formData.hdr_adelanto)

      // Actualizar el estado del Snackbar
      setSnackbarMessage('Creando HDR')
      setSnackbarOpen(true)

      // Redirección después de 3 segundos
      setTimeout(() => {
        setSnackbarOpen(false)
        router.push('/chofer/chofer-combustibles')
      }, 3000)
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = error.inner.map(err => ({
          field: err.path,
          message: err.message
        }))
        setErroresValidacion([...validationErrors, ...error.validationErrors || []])
      } else {
        console.error('Error al crear HDR:', error)
        setErroresValidacion([{error:409,message:`Verificar datos: ${error.response.data.detail }`}])
      }
    }
  }

  const handleCloseDialog = () => {
    setErroresValidacion([])
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const handleChange = (field, value) => {
    const numericValue = value !== null && value !== '' ? parseFloat(value) : null

    setFormData(prevData => ({
      ...prevData,
      [field]: numericValue
    }))
  }

  const handleChangeBool = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }))
  }

  const handleFlotaChange = (event, newValue) => {
    event.preventDefault()

    // Verificar si el valor seleccionado está en las opciones válidas
    const isValidOption = flotaOptions.some(option => option.flo_id === (newValue ? newValue.flo_id : ''))
    if (isValidOption) {
      handleChange('hdr_flota_id', newValue ? newValue.flo_id : '')
      setDominioTractor(newValue ? newValue.flo_dom_tractor : '')
      setSelectedFlota(newValue)
    }
  }

  const handleBatChange = (event, newValue) => {
    event.preventDefault()

    // Verificar si el valor seleccionado está en las opciones válidas
    const isValidOption = batOptions.some(option => option.bat_id === (newValue ? newValue.bat_id : ''))

    if (isValidOption) {
      handleChange('hdr_batea_id', newValue ? newValue.bat_id : '')
    }
  }

  const handleDesChange = (event, newValue) => {
    event.preventDefault()

    // Verificar si el valor seleccionado está en las opciones válidas
    const isValidOption = desOptions.some(option => option.des_id === (newValue ? newValue.des_id : ''))

    if (isValidOption) {
      const desId = newValue ? newValue.des_id : ''
      setDes(newValue.des_id ? newValue : '')
      handleChange('hdr_destino_id', desId)
    }
  }

  const restaurarDest = (e) =>{
    e.preventDefault()
    setDes(null)
    if (e.target.value === "nacional") {
      handleChange('hdr_destino_id',1)
    }else{
      handleChange('hdr_destino_id',null)
    }
  }

  const handleTanqueLlenoChange = () => {
    setTanqueLleno(!tanqueLleno)
    handleChangeBool('hdr_tanque_lleno', !tanqueLleno)
  }

  const handleTanqueLlenoUreaChange = () => {
    setTanqueLlenoUrea(!tanqueLlenoUrea)
    handleChangeBool('hdr_tanque_lleno_urea', !tanqueLlenoUrea)
  }

  // funcion para solo numeros enteros
  const handleKeyDown = e => {
    const key = e.key || e.code
    if (key === 'Backspace' || key === 'Delete' || key === 'Tab') {
      return
    }
    if (!(key >= '0' && key <= '9')) {
      e.preventDefault()
    }
  }

  const handleChangeNumeric = (field, value) => {
    const numericValue = value !== null && value !== '' ? parseFloat(value) : null

    setFormData(prevData => ({
      ...prevData,
      [field]: numericValue
    }))
  }

  const handleFlotantes = e => {
    const key = e.key || e.code
    if (key === '+' || key === '-') {
      e.preventDefault()
    }
  }

  return (
    <Card>
      <CardHeader title='Crear Hoja de Ruta' />
      <Divider sx={{ m: '0 !important' }} />
      <form onSubmit={onSubmit}>
        {erroresValidacion.length > 0 && <ErrorDialog errores={erroresValidacion} onClose={handleCloseDialog} />}
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                Datos de la Hoja de Ruta
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomAutocomplete
                sx={{ width: '100%' }}
                options={flotaOptions}
                id='cmb-flota'
                getOptionLabel={option => option.flo_nombre || 'Sin valor'}
                onChange={(event, newValue) => {
                  handleFlotaChange(event, newValue)
                }}
                renderInput={params => <CustomTextField {...params} label='SELECCIONE LA FLOTA' />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomTextField label={`KM ACTUALES DE TRACTOR:`} disabled fullWidth value={selectedFlota && selectedFlota.flo_km_odo}  />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomAutocomplete
                sx={{ width: '100%' }}
                options={batOptions}
                id='cmb-bat'
                getOptionLabel={option => option.bat_dominio || 'Sin valor'}
                onChange={(event, newValue) => handleBatChange(event, newValue)}
                renderInput={params => <CustomTextField {...params} label='SELECCIONE DOMINIO BATEA' />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomTextField label={`DOMINIO TRACTOR:`} disabled fullWidth value={dominioTractor} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RadioGroup
                row
                value={tipoViaje}
                name='rbtn-tipo-viaje'
                onChange={e => {
                  if (e.target.value === 'nacional') {
                    setShowViaticoPlus(false)
                    setTipoViaje(e.target.value)
                    const valor = e.target.value === 'nacional' ? desOptionsNacional : desOptionsInternacional
                    setDesOptions(valor)
                    restaurarDest(e)

                    //restaurarDest(e)
                  } else setShowViaticoPlus(true)
                  setTipoViaje(e.target.value)
                  const valor = e.target.value === 'nacional' ? desOptionsNacional : desOptionsInternacional
                  handleChangeNumeric('hdr_viatico_plus', 0)
                  setDesOptions(valor)
                  restaurarDest(e)
                }}
                aria-label='Seleccione una opcion'
              >
                <FormControlLabel value='nacional' control={<Radio />} label='Nacional' />
                <FormControlLabel value='internacional' control={<Radio />} label='Internacional' />
              </RadioGroup>
            </Grid>
            {tipoViaje === 'internacional' && (
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  sx={{ width: '100%' }}
                  options={desOptionsInternacional}
                  value={des}
                  id='cmb-des'
                  onChange={(event, newValue) => {
                    handleDesChange(event, newValue)
                  }}
                  getOptionLabel={option => option.des_nombre || 'seleccione el tipo de viaje'}
                  renderInput={params => <CustomTextField {...params} label='Seleccionar destino' />}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <CustomTextField
                label='Viatico nacional'
                type='text'
                fullWidth
                value={formData.hdr_viatico_nac || 0}
                onKeyDown={handleKeyDown}
                onChange={e => handleChangeNumeric('hdr_viatico_nac', e.target.value)}
              />
            </Grid>
            {showViaticoPlus && (
              <Grid item xs={12} md={6}>
                <CustomTextField
                  label='Viatico Plus internacional'
                  type='text'
                  fullWidth
                  onKeyDown={handleKeyDown}
                  value={formData.hdr_viatico_plus || 0}
                  onChange={e => handleChange('hdr_viatico_plus', e.target.value)}
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <CustomTextField
                label='Adelanto de viaje'
                type='text'
                fullWidth
                onKeyDown={handleKeyDown}
                value={formData.hdr_adelanto || 0}
                onChange={e => handleChange('hdr_adelanto', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <Typography component='div'>
                <Grid component='label' container alignItems='center' spacing={1}>
                  <Grid item>
                    <Switch
                      checked={tanqueLleno}
                      onChange={() => handleTanqueLlenoChange()}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />
                  </Grid>
                  <Grid item>Tanque Combustible lleno?</Grid>
                </Grid>
              </Typography>
            </Grid>
            <Grid item xs={12} md={12}>
              <Typography component='div'>
                <Grid component='label' container alignItems='center' spacing={1}>
                  <Grid item>
                    <Switch
                      checked={tanqueLlenoUrea}
                      onChange={() => handleTanqueLlenoUreaChange()}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />
                  </Grid>
                  <Grid item>Tanque Urea lleno?</Grid>
                </Grid>
              </Typography>
            </Grid>

          </Grid>
        </CardContent>
        <CardActions>
          <Button type='submit' sx={{ mr: 2 }} variant='contained'>
            Crear Hoja de Ruta
          </Button>
          <Button type='button' color='secondary' variant='tonal' onClick={router.back}>
            Cancelar
          </Button>
        </CardActions>
      </form>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <MuiAlert onClose={handleSnackbarClose} severity='success'>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Card>
  )
}

export default FormCrearHDR
