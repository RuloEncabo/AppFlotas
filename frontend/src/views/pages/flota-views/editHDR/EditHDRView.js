// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import KilometrosView from 'src/views/pages/flota-views/editHDR/KilometrosView'
import CombustibleView from './CombustibleView'
import NovedadesView from './NovedadesView'
import GastosView from './GastosView'
import { Button } from '@mui/material'
import IconifyIcon from 'src/@core/components/icon'
import HistoricoView from './HistoricoView'

const EditHDRView = () => {

  const [value, setValue] = useState('1')

  const router = useRouter();
  const { hdr_id , flota , chofer, consumo,color } = router.query;


  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Fragment>
{/*       <Button onClick={() => router.back() } variant='contained' startIcon={<IconifyIcon icon='tabler:arrow-back'/>}>VOLVER</Button>
 */}      <Box sx={{ p: 2 , mb : 5}}>
      <Typography variant="h3" gutterBottom component="div">
        Información sobre HDR <b>{hdr_id}</b>
      </Typography>
      <Box display={'flex'} sx={{ flexDirection: 'column',alignItems:'end' ,mr:5 }}>
      <Typography variant="h5" color="text.primary" gutterBottom>
        Nombre de la Flota: <b>{flota}</b>
      </Typography>
      <Typography variant="h5" color="text.primary" gutterBottom>
        Nombre del Chofer: <b>{chofer}</b>
      </Typography>
      </Box>
    </Box>


    <TabContext value={value}>
      <Box sx={{ display: 'flex' }}>
        <TabList orientation='vertical' onChange={handleChange} aria-label='vertical tabs example' sx={{height:"500px"}}>
          <Tab value='1' label='KILOMETROS' />
          <Tab value='2' label='COMBUSTIBLE' />
          <Tab value='3' label='NOVEDADES' />
          <Tab value='4' label='GASTOS' />
          <Tab value='5' label='HISTORICO' />

        </TabList>
        <TabPanel value='1'>
          <KilometrosView/>
        </TabPanel>
        <TabPanel value='2'>
          <CombustibleView  consumoGral={consumo} color={color}/>
        </TabPanel>
        <TabPanel value='3'>
          <NovedadesView/>
        </TabPanel>
        <TabPanel value='4'>
          <GastosView/>
        </TabPanel>
        <TabPanel value='5'>
          <HistoricoView/>
        </TabPanel>
      </Box>
    </TabContext>
    </Fragment>
  )
}

export default EditHDRView
