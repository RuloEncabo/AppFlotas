import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'

export const getCargasHDR = async id => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/conductor/carga/hdr/${id}`)

    return response.data
  } catch (error) {
    throw error
  }
}

export const postCargaHDR = async newCargaHDR => {
  try {
    const response = await axiosService.post(`${ELTA_URL}/conductor/carga/`, newCargaHDR)

    return response.data
  } catch (error) {
    throw error
  }
}

export const putCargaHDR = async (idCarga, updatedCargaHDR) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/conductor/carga/${idCarga}`, updatedCargaHDR)

    return response.data
  } catch (error) {
    if (response.error == 400) {
      console.log('soy el error 400')

      return { error: 'Soy un error' }
    }
    throw error
  }
}

export const deleteCargaHDR = async idCarga => {
  try {
    const response = await axiosService.delete(`${ELTA_URL}/conductor/carga/${idCarga}`)

    return response.data
  } catch (error) {
    console.log(`Error al eliminar la carga ${idCarga}`, error)
  }
}
