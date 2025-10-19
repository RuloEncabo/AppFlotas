import React, { useState, useEffect } from 'react';
import ModalBienvenidoAElta from 'src/views/pages/chofer-views/ModalBienvenidoAElta';
import { getUltimaHDR } from 'src/services/chofer_endpoints/hdr';
import CircularProgress from '@mui/material/CircularProgress'; // Importa el componente de Material-UI
import General from 'src/views/pages/chofer-views/General';

const ChoferGeneral = () => {
  const [hojaDeRuta, setHojaRuta] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar la visualización del indicador de carga

  useEffect(() => {
    const traerUltimaHDR = async () => {
      try {
        setIsLoading(true); // Activa el indicador de carga antes de hacer la petición
        const mi_hdr = await getUltimaHDR();
        console.log('Respuesta del servicio:', mi_hdr);
        setHojaRuta(mi_hdr);
      } catch (error) {
        console.error('Error al obtener la última HDR:', error);
      } finally {
        setIsLoading(false); // Desactiva el indicador de carga independientemente del resultado de la petición
      }
    };
    traerUltimaHDR();
  }, []);

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <CircularProgress />
           </div>;
  }

  return (
    <div>
      {hojaDeRuta ? <General data={hojaDeRuta} /> : <ModalBienvenidoAElta />}
    </div>
  );
};

ChoferGeneral.acl = {
  action: 'usar',
  subject: 'chofer',
};

export default ChoferGeneral;
