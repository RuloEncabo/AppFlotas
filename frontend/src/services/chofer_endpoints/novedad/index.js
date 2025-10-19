import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'

export const getNovedadesHDR = async idHDR => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/conductor/novedades/${idHDR}`)

    return response.data
  } catch (error) {
    throw(error)
  }
}

export const postNovedadHDR = async newNovedadHDR => {
  try {
    const response = await axiosService.post(`${ELTA_URL}/conductor/novedades/`, newNovedadHDR)

    return response.data
  } catch (error) {
    console.log('No se pudo crear la NOVEDAD', error)
  }
}

export const putNovedadHDR = async (idNovedad, updatedNovedadHDR) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/conductor/novedades/${idNovedad}`, updatedNovedadHDR)

    return response.data
  } catch (error) {
    console.log('No se pudo modificar la NOVEDAD', error)
  }
}

export const deleteNovedadHDR = async idNovedad => {
  try {
    const response = await axiosService.delete(`${ELTA_URL}/conductor/novedades/${idNovedad}`)

    return response.data
  } catch (error) {
    console.log(`Error al eliminar la novedad ${idNovedad}`, error)
  }
}
