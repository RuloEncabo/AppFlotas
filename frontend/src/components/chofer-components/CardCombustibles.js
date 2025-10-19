import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Icon from 'src/@core/components/icon'
import FormCargaCombustible from 'src/components/chofer-components/FormCargaCombustible'
import format from 'date-fns/format'
import { deleteCargaHDR } from 'src/services/chofer_endpoints/carga'
import { useRouter } from 'next/router'

const CardCombustibles = ({ data ,km , listaCombustibles,setCC}) => {
  const [collapse, setCollapse] = useState(false)

  const router = useRouter()

  const handleClick = () => {
    setCollapse(!collapse)
  }

  // estados Formulario Carga Combustible
  const [agregarCombustibleOpen, setAgregarCombustibleOpen] = useState(false)

  if (!data || Object.keys(data).length === 0) {
    return
  }

  const handleAgregarCombustibleOpen = () => {
    setAgregarCombustibleOpen(true)
  }

  const handleCloseCombustible = () => {
    setAgregarCombustibleOpen(false)
  }

  const eliminarCargaCombustible = async () => {
    try {
      const response = await deleteCargaHDR(data.Carga.car_id)
    } catch (error) {
      console.error('Error traer los tipos de combustible:', error)
    }
    router.reload('/chofer/chofer-combustibles')
  }

  const fecha = format(new Date(data.Carga?.car_fecha ?? Date.now()), 'dd-MM-yyyy',{ timeZone: 'UTC' })
  const hora = format(new Date(data.Carga?.car_fecha ?? Date.now()), 'HH:mm:ss', { timeZone: 'UTC' })

// Return null si la carga tiene 0 combustible o 0 urea
if(data.Carga?.car_lt_cargados === 0 && data.Carga?.car_lt_urea_cargados === 0 && data.Carga?.car_observaciones === "Inicio de hoja de ruta") return null
  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: '5px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Box shadow
        border: '1px solid #e0e0e0' // Borde
      }}
    >
      <FormCargaCombustible
        isOpen={agregarCombustibleOpen}
        onClose={handleCloseCombustible}
        dataUpdate={data}
        isCrear={false}
        km={km}
        hdr_id={data.car_hdr_id}
        setCC={setCC}
        listaCombustibles={listaCombustibles}
      />
      <CardContent>
        <Typography variant='h6' sx={{ mb: 0 }}>
          ID: {data.Carga.car_id}
        </Typography>
        <Typography variant='h6' sx={{ mb: 0 }}>
          Lugar: {data.Carga.car_lugar}
        </Typography>
      </CardContent>
      <CardActions className='card-action-dense'>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
          }}
        >
          <Box sx={{ width: '100%', display: 'flex',justifyContent:"space-between", gap: '30px' }}>
            <Button onClick={handleClick} size='small' variant='contained' >
              Ver Detalles
            </Button>
            <Box sx={{gap:"30px"}}>
            <Button
                onClick={eliminarCargaCombustible}
                variant='contained'
                endIcon={<Icon icon='tabler:trash' />}
                color='error'
                size='medium'
                fullWidth
              >
                Eliminar
              </Button>
              <Button onClick={handleAgregarCombustibleOpen} size='medium' variant='contained' fullWidth endIcon={<Icon icon='tabler:settings-filled' />}>
                Editar
              </Button>

            </Box>
          </Box>
          <IconButton size='small' onClick={handleClick}>
            <Icon fontSize='1.875rem' icon={collapse ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
          </IconButton>
        </Box>
      </CardActions>
      <Collapse in={collapse}>
        <Divider sx={{ m: '0 !important' }} />
        <CardContent sx={{display:"flex",flexDirection:"column" , gap:'15px'}}>
          <Typography sx={{ color: 'text.secondary' }}> FECHA: {<b>{fecha}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> HORA: {<b>{hora}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> KM carga: {<b>{data.Carga.car_km_odo}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> Ls Combustible: {<b>{data.Carga.car_lt_cargados}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> Ls Urea: {<b>{data.Carga.car_lt_urea_cargados}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> Observaciones: {<b>{data.Carga.car_observaciones}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> Tanque Lleno combustible?: {<b>{data.Carga.car_tanque_lleno ? 'SI' : 'NO'}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> Tanque Lleno urea?: {<b>{data.Carga.car_tanque_lleno_urea ? 'SI' : 'NO'}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> ID COMBUSTIBLE: {<b>{data.Combustible ? data.Combustible : '' }</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> TIENE INFRACCION?:  {<b>{data.Carga.car_infraccion? " SI":" NO"}</b>}</Typography>

        </CardContent>
      </Collapse>
    </Card>
  )
}

export default CardCombustibles
