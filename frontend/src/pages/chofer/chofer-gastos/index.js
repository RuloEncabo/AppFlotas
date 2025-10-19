import React, { useState, useEffect } from 'react';
import ModalBienvenidoAElta from 'src/views/pages/chofer-views/ModalBienvenidoAElta';
import { getUltimaHDR } from 'src/services/chofer_endpoints/hdr';
import Gastos from 'src/views/pages/chofer-views/Gastos';
import CircularProgress from '@mui/material/CircularProgress'; // Importa el componente CircularProgress

const ChoferGastos = () => {
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

  // Renderiza Gastos o ModalBienvenidoAElta según si hojaDeRuta está disponible
  return <div>{hojaDeRuta ? <Gastos data={hojaDeRuta} /> : <ModalBienvenidoAElta />} </div>;
}

ChoferGastos.acl = {
  action: 'usar',
  subject: 'chofer',
};

export default ChoferGastos;
