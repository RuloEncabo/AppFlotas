import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'
export const getAllOTC = async (init, limit,tipo_tratamiento, modelo,estado,fecha_desde, fecha_hasta ) => {
  try {
    let queryParams = new URLSearchParams({
      init: init,
      limit: limit
    });
    if (fecha_desde) {
      queryParams.set('fecha_desde', fecha_desde);
    }
    if (fecha_hasta) {
      queryParams.set('fecha_hasta', fecha_hasta);
    }

    if (tipo_tratamiento) {
      queryParams.set('tipo_id', tipo_tratamiento);
    }

    if (modelo) {
      queryParams.set('modelo', modelo);
    }

    if (estado) {
      if (estado === 'Cerrado') {
        queryParams.set('estado', 'CERRADA');
      } else{
      queryParams.set('estado', estado.toString().toUpperCase());// a mayuscula
      }
    }

    const queryString = queryParams.toString().replace(/\+/g, '%20');
    const url = `${ELTA_URL}/userflota/otc/?${queryString}`;

    const response = await axiosService.get(url);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOTC = async id => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/otc/${id}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const postOTC = async (newOTC) => {
  try {
    const response = await axiosService.post(`${ELTA_URL}/userflota/otc/`, newOTC)
    return response.data
  } catch (error) {
    throw(error)
  }
}


export const putOTCEstado = async (id,estado) => {
  const estadoParsed = estado.toString().replace(/\+/g, '%20');
  try {
    const response = await axiosService.put(`${ELTA_URL}/userflota/otc/estado/${id}?estado=${estado}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const deleteOTC = async (id) => {
  try {
    const response = await axiosService.delete(`${ELTA_URL}/userflota/otc/${id}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const putOTC = async (id, updatedOTC) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/userflota/otc/${id}`, updatedOTC)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const getAllOTCGeneral = async (init , limit,numero_otc,proveedor_id,deposito_id,estado_id,fecha_desde, fecha_hasta) => {

  try {
    let queryParams = new URLSearchParams({
      init: init,
      limit: limit
    });
    if (fecha_desde) {
      queryParams.set('fecha_desde', fecha_desde);
    }
    if (fecha_hasta) {
      queryParams.set('fecha_hasta', fecha_hasta);
    }
    if (deposito_id) {
      queryParams.set('deposito_id', deposito_id);
    }
    if (numero_otc) {
      queryParams.set('numero_otc', numero_otc);
    }
    if (proveedor_id) {
      queryParams.set('proveedor_id', proveedor_id);
    }
    if (estado_id) {
      queryParams.set('estado_id', estado_id);
    }

    // Generar la URL final, reemplazando '+' con '%20'
    const queryString = queryParams.toString().replace(/\+/g, '%20');
    const url = `${ELTA_URL}/userflota/otc_general/?${queryString}`;
    const response = await axiosService.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }

}

export const postOTCGeneral = async (newOTCGeneral) => {
  try {
    const response = await axiosService.post(`${ELTA_URL}/userflota/otc_general/`, newOTCGeneral)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const getOTCGeneral = async id => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/otc_general/${id}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const deleteOTCGeneral = async (id) => {
  try {
    const response = await axiosService.delete(`${ELTA_URL}/userflota/otc_general/${id}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}


export const putOTCGeneral = async (id,estado_id) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/userflota/otc_general/${id}?estado_id=${estado_id}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}

