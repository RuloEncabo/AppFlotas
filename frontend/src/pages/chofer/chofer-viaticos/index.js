import React, { useState, useEffect } from 'react'
import ModalBienvenidoAElta from 'src/views/pages/chofer-views/ModalBienvenidoAElta'
import { getUltimaHDR } from 'src/services/chofer_endpoints/hdr'
import CircularProgress from '@mui/material/CircularProgress'
import AgregarViatico from 'src/views/pages/chofer-views/Viaticos'

const ChoferViaticos = () => {
  const [hojaDeRuta, setHojaRuta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const traerUltimaHDR = async () => {
      try {
        setIsLoading(true)
        const mi_hdr = await getUltimaHDR()
        console.log('Respuesta del servicio:', mi_hdr)
        setHojaRuta(mi_hdr)
      } catch (error) {
        console.error('Error al obtener la última HDR:', error)
      } finally {
        setIsLoading(false)
      }
    }

    traerUltimaHDR()
  }, [])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  return <div>{hojaDeRuta ? <AgregarViatico data={hojaDeRuta} /> : <ModalBienvenidoAElta />} </div>;
}

ChoferViaticos.acl = {
  action: 'usar',
  subject: 'chofer',
};

export default ChoferViaticos;
