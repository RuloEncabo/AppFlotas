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
import { format, parseISO } from 'date-fns'
import FormCargaMovimiento from './FormAgregarMovimiento'
import { ConfirmSimpleDialog } from '../ConfirmOptionDialog'
import { deleteMovimientoHDR } from 'src/services/chofer_endpoints/movimiento'

const CadrMovimientos = ({ data, hdr_id,movimientos,setMovimientos,ultimo_km,movimiento_anterior,setMostrarBoton,islastMov}) => {
  const [collapse, setCollapse] = useState(false)
  const [open, setOpen] = useState(false)

  console.log(islastMov)
  // estados Formulario Movimiento
  const [agregarViajeOpen, setAgregarViajeOpen] = useState(false)

  const handleAgregarViajeOpen = () => {
    setAgregarViajeOpen(true)
  }

  const handleCloseViaje = () => {
    setAgregarViajeOpen(false)
  }

  const handleClick = () => {
    setCollapse(!collapse)
  }

  const handleEliminar = async() => {
    await deleteMovimientoHDR(data.mov_id)
    setMovimientos(movimientos.filter(movimiento => movimiento.mov_id !== data.mov_id))
    setOpen(false)
  }

  if (!data || Object.keys(data).length === 0) {
    return
  }

  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: '5px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Box shadow
        border: '1px solid #e0e0e0' // Borde
      }}
    >
      <ConfirmSimpleDialog
          open={open}
          message={"¿Desea eliminar el viaje?, se eliminara de forma permanente"}
          title={"Eliminar movimiento"}
          handleClose={() => setOpen(false)}
          onConfirm={() => handleEliminar()} >
      </ConfirmSimpleDialog>

      <FormCargaMovimiento
        isOpen={agregarViajeOpen}
        onClose={handleCloseViaje}
        dataUpdate={data}
        isAgregando={false}
        hdr_id={hdr_id}
        setMovimientos={setMovimientos}
        movimiento_anterior={movimiento_anterior}
        setMostrarBoton={setMostrarBoton}
        movimientos={movimientos}
      />
      <CardContent>
      <Typography variant='h6' sx={{ mb: 1 }}>
            ID: {data.mov_id}
      </Typography>

      {data.mov_lugar_fin !== null && (
          <Typography variant='h6' sx={{ mb:1 }}>
            FIN: {data.mov_lugar_fin}
          </Typography>
        )}
        <Typography variant='h6' sx={{ mb: 1 }}>
          ORIGEN: {data.mov_lugar_inicio}
        </Typography>

         <Typography variant='h6' sx={{ mb: 1 }}>
            FECHA INICIO: {format(parseISO(data.mov_inicio), 'dd/MM/yyyy HH:mm')}
          </Typography>

          {data.mov_fin !== null && (
            <Typography variant='h6' sx={{ mb: 1 }}>
              FECHA FIN: {format(parseISO(data.mov_fin), 'dd/MM/yyyy HH:mm')}
            </Typography>
          )}

          {(data.mov_km_odo_fin !== null &&  data.mov_km_odo_inicio !== null) &&  (
          <Typography variant='h6' sx={{ mb:1 }}>
            DISTANCIA RECORRIDA: {data.mov_km_odo_fin - data.mov_km_odo_inicio} KM
          </Typography>
        )}
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
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Button onClick={handleClick}>Ver Detalle</Button>
            {islastMov && data.mov_fin != null ?<Button onClick={() => setOpen(true)}>Eliminar</Button> : null}

            {data.mov_km_odo_fin == null ? (
              <Button
                variant='contained'
                color='primary'
                startIcon={<Icon icon='tabler:edit' />}
                sx={{ ml: 10 }}
                onClick={handleAgregarViajeOpen}
              >
                Cerrar Movimiento
              </Button>
            ): null}
          </Box>
          <IconButton size='small' onClick={handleClick}>
            <Icon fontSize='1.875rem' icon={collapse ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
          </IconButton>
        </Box>
      </CardActions>
      <Collapse in={collapse}>
        <Divider sx={{ m: '0 !important' }} />
        <CardContent>
          <Typography variant='h6' sx={{ mb: 1 }}>
            KM ODOMETRO INICIAL: {data.mov_km_odo_inicio}
          </Typography>

          {data.mov_km_odo_fin !== null && (
            <Typography variant='h6' sx={{ mb: 1 }}>
              KM ODOMETRO FINAL: {data.mov_km_odo_fin}
            </Typography>
          )}


          <Typography variant='h6' sx={{ mb: 1 }}>
            DIAS DE PERMANENCIA?: {data.mov_permanencia}
          </Typography>
          <Typography variant='h6' sx={{ mb: 1 }}>
            Lleva Carga?: {data.mov_lleva_carga ? 'SI' : 'NO'}
          </Typography>
          <Typography variant='h6' sx={{ mb: 1 }}>
            CRUCE DE FRONTERA?: {data.mov_cruce_frontera ? 'SI' : 'NO'}
          </Typography>
          {data.mov_lat_inicio !== null && (
            <Typography sx={{ mb: 1 }}>
              GEO COORDENADAS INICIALES: <Typography sx={{ fontWeight: 'bold', color: 'primary.main', }}>{data.mov_lat_inicio},{data.mov_lng_inicio}</Typography>
            </Typography>
          )}
          {data.mov_lat_fin !== null && (
            <Typography sx={{ mb: 1 }}>
              GEO COORDENADAS Finales:<Typography sx={{ fontWeight: 'bold', color: 'primary.main', }}> {data.mov_lat_fin},{data.mov_lng_fin}</Typography>
            </Typography>
          )}
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default CadrMovimientos
