import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'
export const getAllCubiertas = async (init, limit,numero_interno ,fecha_desde, fecha_hasta, cub_modelo,cub_marca ,estado, filtro_deposito, deposito, columname, order ) => {
  try {
    let queryParams = new URLSearchParams({
      init: init,
      limit: limit
    });

    if (numero_interno) {
      queryParams.set('numero_interno', numero_interno);
    }
    if (fecha_desde) {
      queryParams.set('fecha_desde', fecha_desde);
    }
    if (fecha_hasta) {
      queryParams.set('fecha_hasta', fecha_hasta);
    }
    if (cub_modelo) {
      queryParams.set('cub_modelo', cub_modelo);
    }
    if (cub_marca) {
      queryParams.set('cub_marca', cub_marca);
    }
    if (estado) { // "ACTIVA" "BAJA" "BAJA DEFINITIVA"
      queryParams.set('estado', estado);
    }
    if (filtro_deposito) {
      queryParams.set('filtro_deposito', filtro_deposito);
    }
    if (deposito) {
      queryParams.set('deposito', deposito);
    }
    if (columname) {
      queryParams.set('columname', columname);
    }
    if (order != null) {
      queryParams.set('order', order);
    }

    // Generar la URL final, reemplazando '+' con '%20'
    const queryString = queryParams.toString().replace(/\+/g, '%20');
    console.log(queryString)
    const url = `${ELTA_URL}/userflota/cubierta/?${queryString}`;

    const response = await axiosService.get(url);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCubierta = async id => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/cubierta/${id}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const getHistoricoCubiertaPorId = async (id,accion ,columname, order) => {
  try {
    let queryParams = new URLSearchParams({
    });
    if (columname) {
      queryParams.set('columname', columname);
    }
    if (accion){ /*["ALTA", "BAJA", "DEFINITIVA", "ROTACION", "UBICACION", "RECAPADO", "REPARACION", "MANTENIMIENTO", "DESGASTE"] */
      queryParams.set('accion', accion);
    }
    if (order != null) {
      queryParams.set('order', order);
    }


    const response = await axiosService.get(`${ELTA_URL}/userflota/historico/${id}?${queryParams.toString()}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}


export const postCubierta = async newCub => {
  try {
    const response = await axiosService.post(`${ELTA_URL}/userflota/cubierta/`, newCub)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const putCubierta = async (id, updatedCub) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/userflota/cubierta/${id}`, updatedCub)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const modificarEstadoCubierta = async (id, updatedCub) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/userflota/cubierta/modif_estado/${id}?estado=BAJA&motivo=MOTIVO1&observaciones=OBS `, updatedCub)
    return response.data
  } catch (error) {
    throw(error)
  }
}


export const putCubiertaBajaComun = async (nroInterno, updatedCub) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/userflota/cubierta/modif_alta_baja/${nroInterno}`, updatedCub)
    return response.data
  } catch (error) {
    throw(error)
  }
}


export const putCubiertaBajaDefinitiva = async (id, updatedCub) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/userflota/cubierta/modif_baja_def/${id}`, updatedCub)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const deleteCubierta = async (id) => {
  try {
    const response = await axiosService.delete(`${ELTA_URL}/userflota/cubierta/${id}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}


export const getFlotaCubiertasPorPatente = async (patente) => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/flota_cubiertas/patente/${patente}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const getFlotaCubiertasPorId = async (id) => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/flota_cubiertas/${id}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}


export const getCubiertaPorNroInterno = async (id) => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/cubierta/nro_interno/${id}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const cambiarFlotaCubiertasPorPatente = async (newCub) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/userflota/flota_cubiertas/cambiarCubierta/` , newCub)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const modificarFlotaCubiertasPorPatente = async (patente, posicion, mm,presion,observacion) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/userflota/flota_cubiertas/modificar/${patente}?posicion=${posicion}&mm=${mm}&presion=${presion}&observacion=${observacion}`)
    return response.data
  } catch (error) {
    throw(error)
  }
}


export const rotarFlotaCubiertasPorPatente = async ( body) => {
  try {
    const response = await axiosService.put(`${ELTA_URL}/userflota/flota_cubiertas/rotarCubierta/` , body)
    return response.data
  } catch (error) {
    throw(error)
  }
}

export const getFlotasBateas = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/params/flota/flotas_bateas`)
    return response.data
  } catch (error) {
    throw(error)
  }
}

