import React from 'react'
import { Fragment, useEffect, useState } from 'react'
import { Box, Button, CardContent, Divider, Grid, Switch, Typography } from '@mui/material'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter } from 'next/router'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'

// ** Utils Import
import { CircularProgress, IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import { getKmHDR } from 'src/services/flota_endpoints/km_hdr'
import { getCombHDR } from 'src/services/flota_endpoints/comb_hdr'
import { deleteNov, getDataNov } from 'src/services/flota_endpoints/novedad_admin'
import { flexbox } from '@mui/system'
import { getFotosPorTIPO_HDR_ID_ADMIN } from 'src/services/foto'
import Link from 'next/link'
import { ELTA_URL } from 'src/config'
import Image from 'next/image'
import IconifyIcon from 'src/@core/components/icon'
import FormEditarNov from 'src/components/flota-components/FormEditarNov'
import DialogConfirmation from 'src/components/ConfirmDialog'
import { getHDRbyId } from 'src/services/flota_endpoints/hdr_admin'


const NovInfoView = () => {
  const [data,setData] = useState()
  const [loading, setLoading] = useState(false)
  const [listaFotos,setListaFotos] = useState([])
  const [abrirFormNov, setAbrirFormNov] = useState(false)
  const [dataHDR, setDataHDR] = useState(null)

  const openNov =()=>{
    setAbrirFormNov(true)
  }

  const closeNov = ()=>{
    setAbrirFormNov(false)
  }

  const router = useRouter();
  const { nov_id } = router.query;

const espera2Segundos = () => new Promise(resolve => setTimeout(resolve, 1000))

useEffect(() => {
  const fetchData = async () => {
    if(nov_id){
      setLoading(true)
      try {
        const res = await getDataNov(nov_id)
        setData(res);
      } catch (error) {
        console.log(error);
      } finally {
        await espera2Segundos();
        setLoading(false);
      }
    }
  }
  fetchData()
}, [nov_id])

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    if(data && data.HDR){
      try {
        const res = await getFotosPorTIPO_HDR_ID_ADMIN('novedades',data.HDR,data.NOVEDAD.nov_img); // Asegúrate de que esta llamada se haga con los argumentos necesarios si son requeridos
        console.log(res.CONTENIDO)
        setListaFotos(res.CONTENIDO)
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setListaFotos([])
          console.log("error 404: ",error);
        }else{
          console.log("error desconocido:",error);
        }
      }
      try {
        const res = await getHDRbyId(data.HDR)
        setDataHDR(res)
        console.log(res)
      } catch (error) {
        console.log(error);
      }
    }
    setLoading(false)
  }
  fetchData()
}, [data])


if (loading) {
  return (
    <div style={{ display: 'flex', margin:'auto',justifyContent:'center', alignItems: 'center', width: '100%', height: '100vh' }}>
      <CircularProgress color='success' />
    </div>
  );
}

const crearFechaSpain = (value)=>{
  const fecha = new Date(value);
  const opciones = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  };
  return new Intl.DateTimeFormat('es-ES', opciones).format(fecha);
}

const eliminarNov = ()=>{
  deleteNov(nov_id).then(()=>router.back())
}


  return (
    <Box>
      <Box sx={{display:"flex",height:"100px", alignItems:"center"}}>
        <FormEditarNov isOpen={abrirFormNov} onClose={closeNov} data={data?.NOVEDAD} dataHDR={dataHDR}/>
{/*         <Button onClick={() => router.back() } sx={{mr:"20px"}} variant='contained' startIcon={<IconifyIcon icon='tabler:arrow-back'/> }>VOLVER</Button>
 */}        <Button onClick={openNov} variant='contained'  sx={{mr:"20px"}} startIcon={<IconifyIcon icon='tabler:edit'/>}/* disabled={selectedRows.length === 0} */> EDITAR NOVEDAD</Button>
        <Box sx={{display:"flex",width:"170px", height:"100%",justifyContent:"center", alignItems:"center"}}>
        <DialogConfirmation title={"¿Deseas eliminar esta novedad?"} message={"Se eliminará la novedad"} onConfirm={eliminarNov}/>
        </Box>
      </Box>
    <Box sx={{display:"flex"}}>
    <Card sx={{ width: '60%', padding: '20px', overflow: 'auto', margin:'30px'}}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant='h3' sx={{ margin: '25px 0' }}>Información de la novedad {nov_id}</Typography>
        </Grid>
        <Grid item xs={6}>
          <CustomTextField value={data?crearFechaSpain(data.NOVEDAD.nov_fecha):""} label="FECHA Y HORA" disabled fullWidth />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField value={data?data.NOVEDAD.nov_lugar:""} label="UBICACION" disabled fullWidth />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField value={data?data.FLOTA:""} label="FLOTA" disabled fullWidth />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField value={data?data.PATENTE:""} label="PATENTE" disabled fullWidth />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField value={data?data.CATEGORIA:""} label="CATEGORIA" disabled fullWidth />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField value={data?data.NOVEDAD.nov_km_odo:""} label="KM NOVEDAD" disabled fullWidth />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField value={data?data.NOVEDAD.nov_observaciones:""} label="OBSERVACIONES" disabled fullWidth multiline rows={4} />
        </Grid>
      </Grid>
    </Card>

    <Card sx={{ width: '30%', padding: '20px', overflow: 'auto', margin:'30px'}}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant='h3' sx={{ margin: '25px 0' }}>Estado de la novedad</Typography>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField value={data?data.NOVEDAD.nov_estado:""} label="ESTADO" disabled fullWidth />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='h5' sx={{ margin: '0px 0' }}>¿Lleva carga?</Typography>
              <Switch
                  checked={true}
                  //onChange={() => handleChangeBool('mov_auto', !cargaMovimiento.mov_auto)}
                  inputProps={{ 'aria-label': 'controlled' }}
                  disabled={true}
                />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='h6' sx={{ margin: '0 0' }}>¿Pudo Solucionarlo?</Typography>
              <Switch
                  checked={data?data.NOVEDAD.nov_solucionado:false}
                  //onChange={() => handleChangeBool('mov_auto', !cargaMovimiento.mov_auto)}
                  inputProps={{ 'aria-label': 'controlled' }}
                  disabled={true}
                />
                <Divider sx={{ my: 10 }} />
        </Grid>

      </Grid>
    </Card>
    </Box>

    <Card sx={{ width: '60%', padding: '20px', overflow: 'auto', margin:'30px'}}>
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <Typography variant='h3' sx={{ margin: '25px 0' }}>IMAGENES DE LA NOVEDAD</Typography>
        </Grid>
        <Grid item xs={3} sx={{alignContent:"center"}}>
          <Button variant='contained' sx={{height:"70%",width:"100%",alignSelf:"center"}}> DESCARGAR</Button>
        </Grid>
        <Grid item xs={12} sx={{alignContent:"center"}}>

        {listaFotos? listaFotos.map((item,index)=>{
            return(
           <Link
            href={`${ELTA_URL}/files/novedades/${data.HDR}/${data.NOVEDAD.nov_img}/${item}`}
            rel="noopener noreferrer"
            target="_blank"
            key={index}
          >
           <Image
            key={index}
            src={`${ELTA_URL}/files/novedades/${data.HDR}/${data.NOVEDAD.nov_img}/${item}`}
            alt="Vista previa"
            width={300}
            height={300}
            quality={85}
            />
          </Link>)

          }):<Typography> sin imagenes</Typography>}




        </Grid>


      </Grid>
    </Card>


    </Box>
  )
}
export default NovInfoView
