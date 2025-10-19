import React, { useState } from 'react'
import { Box, Tab, Tabs, Typography } from '@mui/material'
import FormTratamientoCubierta from 'src/components/cubiertas-components/FormTratamientoCubierta'
import TablaOTC from 'src/components/cubiertas-components/TablaOTC'
import TablaOTCGeneral from 'src/components/cubiertas-components/TablaOTCGeneral'

function TratamientoCubiertaView() {
  const [reload , setReload] = useState(false)
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function TabPanel(props) {
    const { children } = props;
    return (
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={value} onChange={handleChange} aria-label="Tabs de Tratamiento">
        <Tab label="Tareas de Cubierta" />
        <Tab label="Ordenes de Trabajo de Cubiertas" />
      </Tabs>

      {value === 0 && (
        <TabPanel>
          <Typography variant="h2" sx={{ mt: 5, mb: 5 }}>TAREAS DE CUBIERTA</Typography>
          <FormTratamientoCubierta setReload={setReload} />
          <TablaOTC reload={reload} setReload={setReload} />
        </TabPanel>
      )}

      {value === 1 && (
        <TabPanel>
          <Typography variant="h4" sx={{ mt: 5, mb: 5 }}>ORDENES DE TRABAJOS DE CUBIERTAS</Typography>
          <TablaOTCGeneral reload={reload} setReload={setReload} />
        </TabPanel>
      )}
    </Box>
  );
}



export default TratamientoCubiertaView
