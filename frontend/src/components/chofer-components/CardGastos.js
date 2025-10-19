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
import Link from 'next/link'
import { deleteGastoHDR } from 'src/services/chofer_endpoints/gasto'
import generarUrlFoto from 'src/utils/generarUrlFoto'
import Image from 'next/image'

//context chofer
import { useContext } from 'react'
import { AuthContext } from 'src/context/AuthContext'
import { deleteDIRFotos } from 'src/services/foto'
import { ConfirmSimpleDialog } from '../ConfirmOptionDialog'

const CardGastos = ({ data, hdr_id ,setGastos,indice}) => {
  const [collapse, setCollapse] = useState(false)
  const [confirmGastoOpen, setConfirmGastoOpen] = useState(false)

  const handleClick = () => {
    setCollapse(!collapse)
  }

  // estados Formulario para editar si es necesario
  const [agregarGastoOpen, setAgregarGastoOpen] = useState(false)

  // Usuario para buscar las fotos
  const { user } = useContext(AuthContext)

  if (!data || Object.keys(data).length === 0) {
    return
  }

  const eliminarGasto = async () => {
    try {
      const response = await deleteGastoHDR(data.Gasto.gas_id)
      console.log("FILTRANDO EL GASTO: ",data.Gasto.gas_id)
      setGastos(currentGastos => currentGastos.filter(item => item.Gasto.gas_id !== data.Gasto.gas_id));

      await deleteDIRFotos('facturas',hdr_id,data.Gasto.gas_img)
    } catch (error) {
      console.error('Error al eliminar el directorio:', error)
    }
  }

  const fecha = data.Gasto?.gas_fecha
  ? format(new Date(data.Gasto.gas_fecha), 'yyyy-MM-dd')
  : 'Fecha no válida';
  const hora = data.Gasto?.gas_fecha
  ? format(new Date(data.Gasto?.gas_fecha), 'HH:mm:ss')
  : 'Hora no válida';

  const rutaFoto = generarUrlFoto("facturas",hdr_id,data.Gasto?.gas_img ?? "",1)

  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: '5px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e0e0'
      }}
    >
      <CardContent>
        <Typography variant='h6' sx={{ mb: 0 }}>
          ID: {data.Gasto?.gas_id ?? "ID no disponible"}
        </Typography>
        <Typography variant='h6' sx={{ mb: 0 }}>
          Ticket: {data.Gasto?.gas_ticket ?? "Ticket no disponible"}
        </Typography>
        <Typography variant='h6' sx={{ mb: 0 }}>
          Lugar: {data.Gasto?.gas_lugar ?? "Lugar no disponible"}
        </Typography>
        <Typography variant='h6' sx={{ mb: 0 }}>
          Fecha: {new Date(data.Gasto?.gas_fecha ?? null).toLocaleDateString('es-ES') }
        </Typography>
        <Typography variant='h6' sx={{ mb: 0 }}>
          Hora: {hora ?? "Hora no disponible"}
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

            <ConfirmSimpleDialog
              open={confirmGastoOpen}
              handleClose={() => setConfirmGastoOpen(false)}
              onConfirm={eliminarGasto}
              title="Eliminar Gasto"
              message="¿Desea eliminar el gasto?"
            />
            <Button
              onClick={() => setConfirmGastoOpen(true)}
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
          <Typography sx={{ color: 'text.secondary' }}> PROVEEDOR: {<b>{data.Gasto?.gas_proveedor ?? "Proveedor no disponible"}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> CATEGORIA: {<b>{data.Categoria ?? "Categoria no disponible"}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> MONTO:  {<b>{data.Gasto?.gas_monto ?? "Monto no disponible"}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}>
          <Link href={rutaFoto ?? "#"} rel="noopener noreferrer" target="_blank">
            <Image
              src={rutaFoto}
              alt="Vista previa"
              width={250}
              height={250}
              quality={75}
            />
          </Link>
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default CardGastos
