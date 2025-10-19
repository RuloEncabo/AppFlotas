// ** React Imports
import React, { Fragment, useState, useEffect } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import {Box, Typography, FormHelperText } from '@mui/material'
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
import { postGastoHDR, putGastoHDR,getGastosHDR } from 'src/services/chofer_endpoints/gasto'


//context chofer
import { useContext } from 'react'
import { AuthContext } from 'src/context/AuthContext'
import { postFoto } from 'src/services/foto'
import ControladorCargaComb from '../formComponents/ControladorCargaComb'
import ControladorCargaNum from '../formComponents/ControladorCargaNum'
import ErrorDialog from '../ErrorDialog'
import { es } from 'date-fns/locale'


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

const FormCargaGasto = ({ isOpen, onClose, dataUpdate, isAgregando, hdr_id,setGastos, listNovedades}) => {
  const initialValues={
    gas_hdr_id: hdr_id,
    gas_fecha: dataUpdate?.gas_fecha || new Date().toISOString(),
    gas_lugar: dataUpdate?.nov_lugar || '',
    gas_ticket: null,
    gas_cat_id: dataUpdate?.gas_cat_id || 1,
    gas_proveedor: dataUpdate?.gas_proveedor || "",
    gas_monto: null,
    gas_img: dataUpdate?.gas_img || '',
  }

  const [cargaGasto, setCargaNovedad] = useState(initialValues)
  const [catNovedades, setCatNovedades] = useState([])
  const [fotoFactura,setFotoFactura] = useState()
  const [imagenPreviewUrl, setImagenPreviewUrl] = useState('');
  const [apiErrors, setApiErrors] = useState([]);

  const scheme = yup.object().shape({
    gas_ticket: yup.number().required('Ticket es requerido'),
    gas_proveedor: yup.string().required('Proveedoredor es requerido'),
    gas_lugar: yup.string().required('Lugar es requerido'),
    gas_cat_id: yup.number().required('Categoría es requerido'),
    gas_monto: yup.number().required('Monto es requerido'),
  })

  const router = useRouter()

  const handleClose = () => {
    setCargaNovedad(initialValues)
    if (imagenPreviewUrl) {
      URL.revokeObjectURL(imagenPreviewUrl);
      setImagenPreviewUrl('');
    }
    setApiErrors([])
    setFotoFactura()
    reset(initialValues)
    onClose()
  }

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

  const {
    reset,
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({ defaultValues:initialValues, mode: 'onSubmit', resolver: yupResolver(scheme) })


  const handleCloseDialog = () => {
    setApiErrors([])
  }

  const { user } = useContext(AuthContext)

  const onSubmit = async (data) => {
    let idRandom = Math.floor(Date.now() / 1000); // Genera un ID unico con la fecha.
    if(imagenPreviewUrl!=""){
      var obj = {...data, gas_img:idRandom.toString()} // LA CARGO EN EL OBJETO
    }else{
      var obj = data // EN CASO DE QUE NO HUBIERA CARGADO IMAGENES, NO LE ASIGNO EL ID
    }

    try {
      if(imagenPreviewUrl!=""){
      await postFoto("facturas",hdr_id,idRandom,fotoFactura)
      }else{
        setApiErrors([{error:422,message:"SELECCIONE UNA FOTO VALIDA"}])
        return
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setApiErrors([{error:422,message:"SELECCIONE UNA FOTO VALIDA"}])
        console.log(error)
      }else{
        handleClose()
      }
    } finally{
      try {
        const response = await postGastoHDR(obj)
        setGastos(currentGastos => {
          console.log(response)
          console.log("CURRENT GASTOS", currentGastos)
          return [...currentGastos, {"Gasto":response,"Categoria": listNovedades.find(item => item.cn_id === response.gas_cat_id)?["cn_nombre"] :""}]
        });
        handleClose()
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleFileChange = async(event) => {
    const file = event.target.files[0]

    try {
      if (file) {
        if (imagenPreviewUrl) {
          URL.revokeObjectURL(imagenPreviewUrl);
        }
        setFotoFactura(file)
        const url = URL.createObjectURL(file);
        setImagenPreviewUrl(url);

      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    console.log(errors)
  }, [errors])


  return (
    <Fragment>
      {apiErrors.length > 0 && <ErrorDialog errores={apiErrors} titulo={"La foto de la factura es requerida"} onClose={handleCloseDialog} />}
      <Dialog
        open={isOpen}
        onClose={handleClose}
        aria-labelledby='form-dialog-title'
        maxWidth='lg'
        fullWidth={true}
        //fullScreen={true}
      >
        {isAgregando ? (
          <DialogTitle id='form-dialog-title'>Agregar Gasto</DialogTitle>
        ) : (
          <DialogTitle id='form-dialog-title'>Modificar Gasto</DialogTitle>
        )}
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography autoFocus variant='h5'>
              Ingrese los datos especificados
            </Typography>

            <Box sx={{ mt: 5, mb: 1 }}>
              <Controller
                name='gas_fecha'
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      showTimeSelect
                      timeFormat='HH:mm'
                      timeIntervals={15}
                      selected={new Date(value)}
                      id='fecha-gasto'
                      locale={es}
                      dateFormat='dd/MM/yyyy h:mm aa'
                      popperPlacement={'auto'}
                      onChange={date => {
                        onChange(date)
                      }}
                      customInput={
                        <PickersComponent label='Fecha y Hora del gasto' inputProps={{ readOnly: true }} />
                      }
                      error={!!errors.gas_fecha}
                      helperText={errors.gas_fecha?.message}
                    />
                  </DatePickerWrapper>
                )}
              />
            </Box>
            <ControladorCargaNum name= 'gas_ticket' label="Nro Ticket Factura" control={control} err= {errors.gas_ticket}/>
            <ControladorCargaComb name= 'gas_proveedor' label="Nombre Proveedor" type='text' control={control} err= {errors.gas_proveedor}/>
            <ControladorCargaComb name= 'gas_lugar' label="Ubicacion de la reparacion" type='text' control={control} err= {errors.gas_lugar}/>

            <FormControl>
              <Controller
                name="gas_cat_id"
                control={control}
                render={({ field: { value, onBlur, onChange } }) => (
                  <div>
                    <CustomAutocomplete
                      sx={{ width: '150%'}}
                      options={catNovedades}
                      value={catNovedades.find(option => option.cn_id === value) || null}
                      getOptionLabel={option => option.cn_nombre || 'Sin valor'}
                      onBlur={onBlur}
                      error={errors.gas_cat_id ? Boolean(errors.gas_cat_id) : undefined}
                      onChange={(event, newValue) => {
                        onChange(newValue ? newValue.cn_id : null); // asegurarse de llamar a onChange con el valor a comparar
                      }}
                      isOptionEqualToValue={(option, value) => option.cn_id === value["cn_id"]}
                      renderInput={params => (
                        <div>
                          <CustomTextField {...params} label='Seleccione el tipo de gasto' />
                          {errors.gas_cat_id && (
                            <FormHelperText sx={{ color: 'error.main' }}>
                              {errors.gas_cat_id.message}
                            </FormHelperText>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}
              />

            </FormControl>
            <ControladorCargaNum name= 'gas_monto' label="Monto" isDecimal={true} control={control} err= {errors.gas_monto}/>
            <FormControl fullWidth margin='normal'>
              <Button variant='contained' component='label' fullWidth>
                {imagenPreviewUrl ? 'Cargar de nuevo' : 'Subir Imagen'}
                <input type='file' hidden accept='image/*' onChange={handleFileChange} />
              </Button>
              {imagenPreviewUrl && (
                <img src={imagenPreviewUrl} alt="Vista previa de la factura" style={{ maxWidth: '70%', height: 'auto' ,margin:"auto" , marginTop:"30px",marginBottom:"15px"}} />
              )}
            </FormControl>
            {/* <ControladorCargaComb name= 'gas_observaciones' label="Observaciones" type='text' control={control} err= {errors.car_observaciones}/> */}

        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleClose}>CANCELAR</Button>
          <Button type='submit'>{isAgregando? "AGREGAR GASTO" : "MODIFICAR GASTO"}</Button>
        </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}

export default FormCargaGasto
