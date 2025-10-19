import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'



export const getAllOT = async (init, limit,fecha_desde,fecha_hasta, flo_dominio,ot_estado) => {
  try {
    let queryParams = new URLSearchParams({
      init: init,
      limit: limit,
    })
    if (fecha_desde) {
      queryParams.append('fecha_desde', fecha_desde)
    }
    if (fecha_hasta) {
      queryParams.append('fecha_hasta', fecha_hasta)
    }
    if (flo_dominio) {
      queryParams.append('flo_dominio', flo_dominio)
    }
    if (ot_estado) {
      queryParams.append('ot_estado', ot_estado)
    }

    const queryString = queryParams.toString().replace(/\+/g, '%20');
    const url = `${ELTA_URL}/userflota/ot/?${queryString}`;
    const response = await axiosService.get(url)

    return response.data;
  } catch (error) {
    throw error
  }
}


export const postOT = async newOT => {
  try {
    const response = await axiosService.post(`${ELTA_URL}/userflota/ot/`, newOT)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const getOTById = async idOT => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/ot/${idOT}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const cambiarEstadoOT = async (idOT, newEstado,date, otModel) => {
  if (!idOT) throw new Error('idOT no puede ser nulo')
  if (!newEstado) throw new Error('newEstado no puede ser nulo')
  console.log("ESTADO: ",newEstado)
  const data= newEstado["ot_estado"].replace(/\+/g, '%20');

  let url = `${ELTA_URL}/userflota/ot/cambiar_estado/${idOT}?estado=${data}`;

  //Si el nuevo estado es 'CERRADO' al query le añadimos la fecha de cierre
  if (newEstado["ot_estado"] != "CERRADO"){
    url = `${ELTA_URL}/userflota/ot/cambiar_estado/${idOT}?estado=${data}&fecha_taller=${date}`;
  }

  if (otModel) { // si hay un modelo voy a usar el put clasico
    url = `${ELTA_URL}/userflota/ot/${idOT}`;
  }

  try {
    const response = await axiosService.put(url, otModel?? null)
    return response.data
  } catch (error) {
    throw(error)
  }
}


export const deleteOT = async idOT => {
  try {
    const response = await axiosService.delete(`${ELTA_URL}/userflota/ot/${idOT}`)

    return response.data
  } catch (error) {
    throw(error)
  }
}


export const deleteNovFromOT = async (idNov) => {
  try {
    const response = await axiosService.delete(`${ELTA_URL}/userflota/ot/novedad/${idNov}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}
