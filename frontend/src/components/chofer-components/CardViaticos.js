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
import format from 'date-fns/format'


//context chofer
import { deleteViaticoHDR } from '../../services/chofer_endpoints/viatico'

const CardViaticos = ({ data, hdr_id ,setViaticos}) => {

  const [collapse, setCollapse] = useState(false)

  const handleClick = () => {
    setCollapse(!collapse)
  }

  // estados Formulario para editar si es necesario
  // const [agregarGastoOpen, setAgregarGastoOpen] = useState(false)

  // Usuario para buscar las fotos
  // const { user } = useContext(AuthContext)

  if (!data || Object.keys(data).length === 0) {
    return
  }

/*
  const handleAgregarNovedadOpen = () => {
    setAgregarGastoOpen(true)
  }

  const handleCloseNovedad = () => {
    setAgregarGastoOpen(false)
  }*/

  const eliminarViatico = async () => {
    try {
      const response = await deleteViaticoHDR(data.id)
      setViaticos(currentViaticos => currentViaticos.filter(viatico => viatico.id !== data.id));
    } catch (error) {
      console.error('Error al eliminar el directorio:', error)
    } finally{
      // const response2 = await deleteDIRFotos('facturas',hdr_id,data.gas_img)
      // console.log("Error al eliminar el gasto",response2)
    }
  }

  const fecha = format(new Date(data.vi_fecha), 'dd-MM-yyyy')
  const hora = format(new Date(data.vi_fecha), 'HH:mm:ss')

  //if(data.gas_img != ""){
  // const rutaFoto = generarUrlFoto("facturas",hdr_id,data.gas_img,1)
  //}
  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: '5px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e0e0'
      }}
    >
     {/*  <FormCargaNovedad
        isOpen={agregarGastoOpen}
        onClose={handleCloseNovedad}
        dataUpdate={data}
        isAgregando={false}
        hdr_id={hdr_id}
        nov_id={data.nov_id}
      /> */}
      <CardContent>
        <Typography variant='h6' sx={{ mb: 0 }}>
          ID: {data.id}
        </Typography>
        <Typography variant='h6' sx={{ mb: 0 }}>
          Tipo: {data.tipo_viatico}
        </Typography>
        <Typography variant='h6' sx={{ mb: 0 }}>
          Monto: {data.vi_monto}
        </Typography>
        <Typography variant='h6' sx={{ mb: 0 }}>
          Fecha: {fecha}
        </Typography>
        <Typography variant='h6' sx={{ mb: 0 }}>
          Hora: {hora}
        </Typography>
      </CardContent>
      <CardActions className='card-action-dense'>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: '5px' }}>
            <Button onClick={handleClick} size='small' variant='contained'>
              Ver Detalles
            </Button>

            <Button
              onClick={eliminarViatico}
              variant='contained'
              endIcon={<Icon icon='tabler:trash' />}
              color='error'
              size='small'
            >
              Eliminar
            </Button>
          </Box>
          <IconButton size='small' onClick={handleClick}>
            <Icon fontSize='1.875rem' icon={collapse ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
          </IconButton>
        </Box>
      </CardActions>
      <Collapse in={collapse}>
        <Divider sx={{ m: '0 !important' }} />
        <CardContent sx={{display:"flex",flexDirection:"column" , gap:'15px'}}>
          <Typography sx={{ color: 'text.secondary' }}> TIPO ADELANTO: {<b>{data.tipo_viatico}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> MONTO:  {<b>{data.vi_monto}</b>}</Typography>

        </CardContent>
      </Collapse>
    </Card>
  )
}

export default CardViaticos
