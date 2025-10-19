import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'


export const getAllNov = async (init, limit,fecha_desde,fecha_hasta, flo_dominio, flo_nombre,nov_estado,cat_nombre, columname, order ) => {
  try {
    let queryParams = new URLSearchParams({
      init: init,
      limit: limit,
    })
    if (flo_dominio !== undefined && flo_dominio !== null && flo_dominio !== "") {
      queryParams.set('flo_dominio', flo_dominio)
    }
    if (flo_nombre !== undefined && flo_nombre !== null && flo_nombre !== "") {
      queryParams.set('flo_nombre', flo_nombre)
    }
    if (nov_estado !== undefined && nov_estado !== null && nov_estado !== "") {
      queryParams.set('nov_estado', nov_estado)
    }
    if (cat_nombre !== undefined && cat_nombre !== null && cat_nombre !== "") {
      queryParams.set('cat_nombre', cat_nombre)
    }
    if (fecha_desde !== undefined && fecha_desde !== null && fecha_desde !== "") {
      queryParams.set('fecha_desde', fecha_desde)
    }
    if (fecha_hasta !== undefined && fecha_hasta !== null && fecha_hasta !== "") {
      queryParams.set('fecha_hasta', fecha_hasta)
    }
    if (columname) {
      queryParams.set('columname', columname);
    }
    if (order !== null) {
      queryParams.set('order', order);
    }

    const queryString = queryParams.toString().replace(/\+/g, '%20');
    const url = `${ELTA_URL}/userflota/novedad_admin/?${queryString}`;

    const response = await axiosService.get(url)

    return response.data;
  } catch (error) {
    throw error
  }
}




export const getDataNov = async (id) => {
  try {
    const url = `${ELTA_URL}/userflota/novedad_admin/${id}`;
    const response = await axiosService.get(url)
    return response.data;
  } catch (error) {
    throw error
  }
}


export const updateNov = async (id, updatedNov) => {
  try {
    const url = `${ELTA_URL}/userflota/novedad_admin/${id}`;
    const response = await axiosService.put(url, updatedNov)

    return response.data
  } catch (error) {
    throw error
  }
}


export const deleteNov = async (id) => {
  try {
    const url = `${ELTA_URL}/userflota/novedad_admin/${id}`;
    const response = await axiosService.delete(url)
    return response.data;
  } catch (error) {
    throw error
  }
}

/*
export const createHDR = async newHDR => {
  try {
    const response = await axiosService.post(`${ELTA_URL}/desarrollo/hdr/`, newHDR)

    return response.data
  } catch (error) {
    console.log('No se pudo crear la HDR', error)
  }
} */
/*
export const closeHDR = async () => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/desarrollo/hdr/desactivar/`)

    return response.data
  } catch (error) {
    throw(error)
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
