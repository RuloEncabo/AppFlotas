import React, { useState } from 'react'
import { Tab, Typography } from '@mui/material'
import TablaNov from 'src/components/flota-components/tabla-nov'
import { TabContext, TabPanel } from '@mui/lab'
import { styled } from '@mui/material/styles'
import MuiTabList from '@mui/lab/TabList'
import TablaOT from 'src/components/flota-components/tabla-ot'


const TabList = styled(MuiTabList)(({ theme }) => ({
  borderBottom: '0 !important',
  '&, & .MuiTabs-scroller': {
    boxSizing: 'content-box',
    padding: theme.spacing(1.25, 1.25, 2),
    margin: `${theme.spacing(-1.25, -1.25, -2)} !important`},
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    lineHeight: 1,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}))


function NovView() {
  const [value, setValue] = useState('1')
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <div>


    <TabContext value={value}>
      <TabList variant='fullWidth' onChange={handleChange} aria-label='full width tabs'>
        <Tab value='1' label='1 PARTE NOVEDADES'/>
        <Tab value='2' label='2 CUMPLIMIENTO NOVEDADES' />
      {/*<Tab value='3' label='PROXIMAMENTE' />*/}
      </TabList>

  <TabPanel value='1' key="tab1">
    <Typography variant="h2" sx={{mt:5,mb:5}}>LISTADO DE NOVEDADES</Typography>
    <TablaNov/>
  </TabPanel>
  <TabPanel value='2' key="tab2">
    <Typography variant="h2" sx={{mt:5,mb:5}}>LISTADO DE OT</Typography>
    <TablaOT/>
  </TabPanel>

  {/* <TabPanel value='3' key="tab3">
    <Typography>
      Proximamente...
    </Typography>
  </TabPanel> */}
    </TabContext>

    </div>
  )
}

export default NovView
