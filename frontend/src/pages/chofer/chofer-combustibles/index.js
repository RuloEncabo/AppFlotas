import React, { useState, useEffect } from 'react';
import ModalBienvenidoAElta from 'src/views/pages/chofer-views/ModalBienvenidoAElta';
import { getUltimaHDR } from 'src/services/chofer_endpoints/hdr';
import Combustibles from 'src/views/pages/chofer-views/Combustibles';
import CircularProgress from '@mui/material/CircularProgress'; // Importa el componente CircularProgress de Material-UI

const ChoferCombustibles = () => {
  const [hojaDeRuta, setHojaRuta] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Estado para el indicador de carga

  useEffect(() => {
    const traerUltimaHDR = async () => {
      try {
        setIsLoading(true); // Activa el indicador de carga
        const mi_hdr = await getUltimaHDR();
        console.log('Respuesta del servicio:', mi_hdr);
        setHojaRuta(mi_hdr);
      } catch (error) {
        console.error('Error al obtener la última HDR:', error);
      } finally {
        setIsLoading(false); // Desactiva el indicador de carga
      }
    };

    traerUltimaHDR();
  }, []);

  if (isLoading) {
    // Muestra el indicador de carga mientras isLoading es true
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  // Renderiza Combustibles o ModalBienvenidoAElta según si hojaDeRuta está disponible
  return <div>{hojaDeRuta ? <Combustibles data={hojaDeRuta} /> : <ModalBienvenidoAElta />} </div>;
}

ChoferCombustibles.acl = {
  action: 'usar',
  subject: 'chofer',
};

export default ChoferCombustibles;
