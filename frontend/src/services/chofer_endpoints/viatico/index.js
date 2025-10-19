import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'

export const getViaticosHDR = async id => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/conductor/viatico/${id}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const putViaticoHDR = async (idHDR,data) => {
  try {
    //const response = await axiosService.put(`${ELTA_URL}/conductor/hdr/viatico/${idHDR}`, newViaticoHDR)
    const response = await axiosService.post(`${ELTA_URL}/conductor/viatico/${idHDR}?viatico_nacional=${data.viatico_nacional}&adelanto_viaje=${data.adelanto_viaje}&viatico_plus=${data.viatico_plus}`)
return response.data
  } catch (error) {
    console.log('No se pudo actualizar el viatico', error)
  }
}

export const deleteViaticoHDR = async id => {
  try {
    const response = await axiosService.delete(`${ELTA_URL}/conductor/viatico/${id}`)

    return response.data
  } catch (error) {
    throw(error)
  }
}
