// ** React Imports
import react from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { Box, Typography } from '@mui/material'
import ControladorCargaComb from '../formComponents/ControladorCargaComb'
import { useRouter } from 'next/router'
import { useForm} from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { putViaticoHDR } from 'src/services/chofer_endpoints/viatico'
import ControladorCargaNum from '../formComponents/ControladorCargaNum'

const FormAgregarViatico = ({ isOpen, onClose ,dataHDR, setViaticos, setCambio}) => {
  const initialValues = {
    hdr_id:dataHDR.hoja_de_ruta.hdr_id,
    viatico_nacional:0,
    adelanto_viaje:0,
    viatico_plus:0
  }
  const router = useRouter()
  console.log(dataHDR)

  const schema = yup.object().shape({
    viatico_nacional:yup.number("solo se admiten numeros").min(0,"Ingrese un valor mayor").notRequired().typeError('INGRESE UN NÚMERO'),
    adelanto_viaje: yup.number("solo se admiten numeros").min(0,"Ingrese un valor mayor").notRequired().typeError('INGRESE UN NÚMERO'),
    viatico_plus: yup.number("solo se admiten numeros").min(0,'Ingrese un valor mayor').notRequired().typeError('INGRESE UN NÚMERO'),
})

const {
    reset,
    control,
    handleSubmit,
    formState: {errors}
} = useForm({
    mode: 'onBlur',
    defaultValues:initialValues,
    resolver: yupResolver(schema)
})


  const handleClose = () => {
    reset(initialValues)
    onClose()
  }

  const onSubmit = async (data) => {
    try {
      await putViaticoHDR(dataHDR.hoja_de_ruta.hdr_id,data)
      // Revisar para cambiar el estado e viaticos con los nuevos datos
      setCambio(prev => prev=!prev)
    } catch (error) {
      console.error('Error traer los tipos de combustible:', error)
    }
    /*const newHDR = {
      ...dataHDR.hoja_de_ruta,
      hdr_adelanto:dataHDR.hoja_de_ruta.hdr_adelanto + data.adelanto_viaje,
      hdr_viatico_nac:dataHDR.hoja_de_ruta.hdr_viatico_nac + data.viatico_nacional,
      hdr_viatico_plus:dataHDR.hoja_de_ruta.hdr_viatico_plus + data.viatico_plus
    }
    const newObj = {
      ...dataHDR,
      hoja_de_ruta:newHDR
    } */
    //setData(newObj)
    // router.push('/chofer/chofer-general')
    handleClose()
  }

  return (
      <Dialog open={isOpen} onClose={handleClose} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title' variant='h4'>
          Agregar adelanto
        </DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Typography variant='h5' sx={{ fontWeight: 600, mb:8 }}>
            Por favor ingrese los datos especificados
          </Typography>
          <Box sx ={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <ControladorCargaNum name= 'viatico_nacional' label="VIATICO NACIONAL" control={control} err= {errors.viatico_nacional} autoFocus={true}/>
          <ControladorCargaNum name= 'adelanto_viaje' label="ADELANTO DE VIAJE" control={control} err= {errors.adelanto_viaje} />

          {dataHDR.destino.tipo === 'Internacional' ? (<ControladorCargaNum name= 'viatico_plus' label="VIATICO PLUS" disabled={false} control={control} err= {errors.viatico_plus}  />)
          :dataHDR.destino.tipo === 'Nacional' ?(<ControladorCargaNum name= 'viatico_plus' label="VIATICO PLUS" disabled={true} control={control} err= {errors.viatico_plus}  />) : null}

          </Box>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button type='submit'>AGREGAR</Button>
          <Button onClick={handleClose} >CANCELAR</Button>
        </DialogActions>
        </form>
      </Dialog>
  )
}

export default FormAgregarViatico
