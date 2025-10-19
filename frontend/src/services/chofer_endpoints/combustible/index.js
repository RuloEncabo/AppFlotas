import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'

export const getTiposCombustibles = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/params/tipo_combustible/`)

    return response.data
  } catch (error) {
    console.log('Problemas para traer los tipos de combustibles', error)
  }
}

/*
export const createHDR = async newHDR => {
  try {
    const response = await axiosService.post(`${ELTA_URL}/conductor/hdr/`, newHDR)

    return response.data
  } catch (error) {
    console.log('No se pudo crear la HDR', error)
  }
} */
/*
export const closeHDR = async () => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/conductor/hdr/desactivar/`)

    return response.data
  } catch (error) {
    console.log('No se pudo cerrar la HDR', error)
  }
} */

/*
export const updateHDR = async (id, updatedHDR) => {
  try {
    const response = await axiosService.put(updateHDREndpoint(id), updatedHDR)

    return response.data
  } catch (error) {
    throw error
  }
}

 */
