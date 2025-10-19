import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'

export const getUltimaHDR = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/conductor/hdr/chofer`)

    return response.data
  } catch (error) {
    console.log('No se encontro una HDR al chofer', error)
  }
}
export const createHDR = async (newHDR, viat_nac, viat_plus, adel_viaje) => {
  // Objeto para acumular los parámetros que no son null
  let queryParams = new URLSearchParams();
  if (viat_nac !== null) queryParams.set('viat_nac', viat_nac);
  if (viat_plus !== null) queryParams.set('viat_plus', viat_plus);
  if (adel_viaje !== null) queryParams.set('adel_viaje', adel_viaje);

  // Construimos la URL con los parámetros
  const queryString = queryParams.toString();
  console.log(queryString)
  const url = `${ELTA_URL}/conductor/hdr/?${queryString}`;

  try {
    const response = await axiosService.post(url, newHDR);

    return response.data;
  } catch (error) {
    throw error;
  }
};


export const closeHDR = async (comentario) => {

  try {
    const response = await axiosService.put(`${ELTA_URL}/conductor/hdr/desactivar/?comentario=${comentario}`)

    return response.data
  } catch (error) {
    throw(error)
  }
}


export const updateHDR = async (id, updatedHDR) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/conductor/hdr/${id}`, updatedHDR)
    return response.data
  } catch (error) {
    throw error
  }
}
