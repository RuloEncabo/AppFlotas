import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'

export const getGastosHDR = async id => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/conductor/gastos/${id}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const postGastoHDR = async newGastoHDR => {
  try {
    const response = await axiosService.post(`${ELTA_URL}/conductor/gastos/`, newGastoHDR)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const putGastoHDR = async (idGasto, updatedGastoHDR) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/conductor/gastos/${idGasto}`, updatedGastoHDR)
    return response.data
  } catch (error) {
    throw(error)
  }
}


export const deleteGastoHDR = async idGasto => {
  try {
    const response = await axiosService.delete(`${ELTA_URL}/conductor/gastos/${idGasto}`)

    return response.data
  } catch (error) {
    throw(error)
  }
}
