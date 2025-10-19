import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'

export const getCatNovedadesHDR = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/params/categoria_novedad/`)

    return response.data
  } catch (error) {
    throw(error)
  }
}

/* export const postNovedadHDR = async newNovedadHDR => {
  try {
    const response = await axiosService.post(`${ELTA_URL}/params/novedades/`, newNovedadHDR)

    return response.data
  } catch (error) {
    console.log('No se pudo crear la NOVEDAD', error)
  }
} */

/* export const putNovedadHDR = async (idNovedad, updatedNovedadHDR) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/params/novedades/${idNovedad}`, updatedNovedadHDR)

    return response.data
  } catch (error) {
    console.log('No se pudo modificar la NOVEDAD', error)
  }
} */

/* export const deleteNovedadHDR = async idNovedad => {
  try {
    const response = await axiosService.delete(`${ELTA_URL}/params/novedad/${idNovedad}`)

    return response.data
  } catch (error) {
    console.log(`Error al eliminar la novedad ${idNovedad}`, error)
  }
} */
