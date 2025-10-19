import { ELTA_URL } from 'src/config'
import { axiosService } from 'src/services/axios'

// ENDPOINTS
// /userflota/metricas/kmPorFlota
// /userflota/metricas/kmPorChofer
// /userflota/metricas/porcentajeDisponibilidadFlotas
// /userflota/metricas/porcentajeTiposDeViajesActivos
// /userflota/metricas/porcentajeHDRPorMotivo
// /userflota/metricas/totalOrdenesTrabajo
// /userflota/metricas/totalNovedades
// /userflota/metricas/combustibleConsumidoChofer
// /userflota/metricas/combustibleConsumidoFlota


export const getMetricaAnalitica = async (fecha_desde, fecha_hasta, destino_id) => {
  try {
    let queryParams = new URLSearchParams()
    if (fecha_desde) {
      queryParams.set('fecha_desde', fecha_desde)
    }
    if (fecha_hasta) {
      queryParams.set('fecha_hasta', fecha_hasta)
    }
    if (destino_id) {
      queryParams.set('destino_id', destino_id)
    }
    const queryString = queryParams.toString().replace(/\+/g, '%20')
    const url = `${ELTA_URL}/userflota/metricas/analitica/?${queryString}`
    const response = await axiosService.get(url)
    return response.data
  } catch (error) {
    throw error
  }
};


export const getMetricaKmPorFlota = async (nombre,fechaDesde,fechaHasta,destino_id) => {
  try {
    let queryParams = new URLSearchParams()
    if (nombre) {
      queryParams.set('nombre', nombre)
    }
    if (fechaDesde) {
      queryParams.set('fecha_desde', fechaDesde)
    }
    if (fechaHasta) {
      queryParams.set('fecha_hasta', fechaHasta)
    }
    if (destino_id) {
      queryParams.set('destino_id', destino_id)
    }
    const queryString = queryParams.toString().replace(/\+/g, '%20')
    const url = `${ELTA_URL}/userflota/metricas/kmPorFlota/?${queryString}`
    const response = await axiosService.get(url)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMetricaKmPorChofer = async (nombre,fechaDesde,fechaHasta,destino_id) => {
  try {
  let queryParams = new URLSearchParams()
  if (nombre) {
    queryParams.set('nombre', nombre)
  }
  if (fechaDesde) {
    queryParams.set('fecha_desde', fechaDesde)
  }
  if (fechaHasta) {
    queryParams.set('fecha_hasta', fechaHasta)
  }
  if (destino_id) {
    queryParams.set('destino_id', destino_id)
  }
  const queryString = queryParams.toString().replace(/\+/g, '%20')
  const url = `${ELTA_URL}/userflota/metricas/kmPorChofer/?${queryString}`
    const response = await axiosService.get(url)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMetricaPorcentajeDisponibilidadFlotas = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/metricas/porcentajeDisponibilidadFlotas/`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMetricaPorcentajeTiposDeViajesActivos = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/metricas/porcentajeTiposDeViajesActivos/`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMetricaPorcentajeHDRPorMotivo = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/metricas/porcentajeHDRPorMotivo/`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMetricaTotalOrdenesTrabajo = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/metricas/totalOrdenesTrabajo/`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMetricaTotalNovedades = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/metricas/totalNovedades/`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMetricaCombustibleConsumidoChofer = async (fecha_desde , fecha_hasta,destino_id,nombre) => {
  try {
    let queryParams = new URLSearchParams()
    if (fecha_desde) {
      queryParams.set('fecha_desde', fecha_desde)
    }
    if (fecha_hasta) {
      queryParams.set('fecha_hasta', fecha_hasta)
    }
    if (destino_id) {
      queryParams.set('destino_id', destino_id)
    }
    if (nombre) {
      queryParams.set('nombre', nombre)
    }
    const queryString = queryParams.toString().replace(/\+/g, '%20')
    const url = `${ELTA_URL}/userflota/metricas/combustibleConsumidoChofer/?${queryString}`
    const response = await axiosService.get(url)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMetricaCombustibleConsumidoFlota = async (fecha_desde , fecha_hasta,destino_id,nombre) => {
  try {
    let queryParams = new URLSearchParams()
    if (fecha_desde) {
      queryParams.set('fecha_desde', fecha_desde)
    }
    if (fecha_hasta) {
      queryParams.set('fecha_hasta', fecha_hasta)
    }
    if (destino_id) {
      queryParams.set('destino_id', destino_id)
    }
    if (nombre) {
      queryParams.set('nombre', nombre)
    }
    const queryString = queryParams.toString().replace(/\+/g, '%20')
    const url = `${ELTA_URL}/userflota/metricas/combustibleConsumidoFlota/?${queryString}`
    const response = await axiosService.get(url)
    return response.data
  } catch (error) {
    throw error
  }
}




export const getUbicacionDeCubiertas = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/metricas/ubicacionDeCubiertas/`)
    return response.data
  } catch (error) {
    throw error
  }
}


/* {
  "DEPOSITO": 6,
  "TALLER": 1,
  "RODANDO": 1,
  "BAJA": 0,
  "BAJA DEFINITIVA": 0
} */
export const getEstadoDeCubiertas = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/metricas/ubicacionDeCubiertas/`)
    return response.data
  } catch (error) {
    throw error
  }
}


export const getCubiertasPorDeposito = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/metricas/cubiertasPorDeposito/`)
    return response.data
  } catch (error) {
    throw error
  }
}


export const getRotacionesCubiertas = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/metricas/RotacionesCubiertas`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getEstadoReparacionCubiertas = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/metricas/estadoDeCubiertas/`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getCubiertasPorMM = async () => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/metricas/cubiertasPorMM/`)
    return response.data
  } catch (error) {
    throw error
  }
}


export const getMovimientosPorChofer = async (fecha_desde , fecha_hasta,chofer_id) => {
  try {
    let queryParams = new URLSearchParams()
    if (fecha_desde) {
      queryParams.set('fecha_desde', fecha_desde)
    }
    if (fecha_hasta) {
      queryParams.set('fecha_hasta', fecha_hasta)
    }
    if (chofer_id) {
      queryParams.set('chofer_id', chofer_id)
    }
    const queryString = queryParams.toString().replace(/\+/g, '%20')
    const url = `${ELTA_URL}/userflota/metricas/movimientosPorChofer/?${queryString}`
    const response = await axiosService.get(url)
    return response.data
  } catch (error) {
    throw error
  }
}

//GET /userflota/metricas/excelmovimientosPorChofer/
export const getExcelMovimientosPorChofer = async (fecha_desde , fecha_hasta,chofer_id) => {
  try {
    let queryParams = new URLSearchParams()
    if (fecha_desde) {
      queryParams.set('fecha_desde', fecha_desde)
    }
    if (fecha_hasta) {
      queryParams.set('fecha_hasta', fecha_hasta)
    }
    if (chofer_id) {
      queryParams.set('chofer_id', chofer_id)
    }
    const queryString = queryParams.toString().replace(/\+/g, '%20')
    const url = `${ELTA_URL}/userflota/metricas/excelmovimientosPorChofer/?${queryString}`
    axiosService.defaults.responseType = 'blob'
    const response = await axiosService.get(url)
    return response
  } catch (error) {
    throw error
  }
}
