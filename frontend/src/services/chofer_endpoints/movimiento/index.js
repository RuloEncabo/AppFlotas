import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'

export const getMovimientosHDR = async id => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/conductor/movimientos/${id}`)

    return response.data
  } catch (error) {
    if(error.response && error.response.status === 404){
      return []
    }else{
      throw(error)
    }
  }
}

export const postMovimientoHDR = async newMovimientoHDR => {
  try {
    const response = await axiosService.post(`${ELTA_URL}/conductor/movimientos/`, newMovimientoHDR)

    return response.data
  } catch (error) {
    throw(error)
  }
}

export const putMovimientoHDR = async (idMovimiento, updatedMovimientoHDR) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/conductor/movimientos/${idMovimiento}`, updatedMovimientoHDR)

    return response.data
  } catch (error) {
    throw(error)
  }
}

export const deleteMovimientoHDR = async idMovimiento => {
  try {
    const response = await axiosService.delete(`${ELTA_URL}/conductor/movimientos/${idMovimiento}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}



export const getUltimoKmHDR = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/conductor/hdr/ultimo_km/`)
    return response.data
  } catch (error) {
    throw(error)
  }
}





/*
export const deleteCargaHDR = async idCarga => {
  try {
    const response = await axiosService.delete(`${ELTA_URL}/conductor/carga/${idCarga}`)

    return response.data
  } catch (error) {
    console.log(`Error al eliminar la carga ${idCarga}`, error)
  }
}
 */
