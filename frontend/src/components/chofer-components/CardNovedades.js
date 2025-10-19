import { useEffect, useState } from 'react'
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
import FormCargaNovedad from './FormAgregarNovedad'
import format from 'date-fns/format'
import { deleteNovedadHDR } from 'src/services/chofer_endpoints/novedad'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { ELTA_URL } from 'src/config'
import { deleteDIRFotos, getFotosPorTIPO_HDR_ID } from 'src/services/foto'

const CardNovedades = ({ data, hdr_id }) => {
  const [collapse, setCollapse] = useState(false)
  const [listaFotos,setListaFotos] = useState([])
  const [agregarNovedadOpen, setAgregarNovedadOpen] = useState(false)
  const [error,setError] = useState(false)
  if (!data || Object.keys(data).length === 0) {
    return
  }
  const  urlImagenNotFound = ELTA_URL + 'files/facturas/not_found.png'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getFotosPorTIPO_HDR_ID('novedades',hdr_id,data.nov_img); // Asegúrate de que esta llamada se haga con los argumentos necesarios si son requeridos
        if(res.data.CONTENIDO[0] === "not_found.png"){
          setListaFotos([])
        }else{
          setListaFotos(res.data.CONTENIDO)
        }
      } catch (error) {
        console.log("EL ERROR ES: ",error);
      }
    }
    fetchData()
  }, [])

  const router = useRouter()

  const handleClick = () => {
    setCollapse(!collapse)
  }


  const handleAgregarNovedadOpen = () => {
    setAgregarNovedadOpen(true)
  }

  const handleCloseNovedad = () => {
    setAgregarNovedadOpen(false)
  }

  const eliminarNovedad = async () => {
    console.log(data)
    try {
      const response = await deleteNovedadHDR(data.nov_id)
      const responseFotos = await deleteDIRFotos('novedades',hdr_id,data.nov_img)
    } catch (error) {
      console.error('Error al eliminar la novedad:', error)
    }
    router.reload('/chofer/chofer-novedades')
  }

  const fecha = format(new Date(data.nov_fecha), 'dd-MM-yyyy')
  const hora = format(new Date(data.nov_fecha), 'HH:mm:ss')

  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: '5px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Box shadow
        border: '1px solid #e0e0e0' // Borde
      }}
    >
      <FormCargaNovedad
        isOpen={agregarNovedadOpen}
        onClose={handleCloseNovedad}
        dataUpdate={data}
        isAgregando={false}
        hdr_id={hdr_id}
        nov_id={data.nov_id}
      />
      <CardContent>
        <Typography variant='h6' sx={{ mb: 0 }}>
          ID: {data.nov_id}
        </Typography>
        <Typography variant='h6' sx={{ mb: 0 }}>
          Lugar: {data.nov_lugar}
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
          <Box sx={{ width: '330', display: 'flex', justifyContent: 'space-between', gap: '5px' }}>
            <Button onClick={handleClick} size='small' variant='contained'>
              Ver Detalles
            </Button>
            <Button onClick={handleAgregarNovedadOpen} size='small' variant='contained'>
              Editar
            </Button>
            <Button
              onClick={eliminarNovedad}
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
          <Typography sx={{ color: 'text.secondary' }}> FECHA: {<b>{fecha}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> HORA: {<b>{hora}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> KM ODOMETRO: {<b>{data.nov_km_odo}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> CUAL ES EL PROBLEMA?:  {<b>{data.nov_desc}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> FUE SOLUCIONADO?:  {<b>{data.nov_solucionado? " SI":" NO"}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> FUE EN TRACTOR?:  {<b>{data.nov_tractor? " SI":" NO"}</b>}</Typography>
          <Typography sx={{ color: 'text.secondary' }}> TIENE INFRACCION?:  {<b>{data.nov_infraccion? " SI":" NO"}</b>}</Typography>


          {listaFotos.length > 0 ? listaFotos.map((item)=>{
            return(
           <Link
            href={`${ELTA_URL}/files/novedades/${hdr_id}/${data.nov_img}/${item}`}
            rel="noopener noreferrer"
            target="_blank"
            key={item}
          >
          <Image
            src={`${ELTA_URL}/files/novedades/${hdr_id}/${data.nov_img}/${item}`}
            alt="Vista previa"
            width={250}
            height={250}
            quality={75}
            />
          </Link>)

          }):<Typography> SIN IMAGENES</Typography>}



          <Typography sx={{ color: 'text.secondary' }}> OBSERVACIONES: {<b>{data.nov_observaciones}</b>}</Typography>


        </CardContent>
      </Collapse>
    </Card>
  )
}

export default CardNovedades
