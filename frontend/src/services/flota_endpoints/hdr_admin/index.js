import { ELTA_URL } from 'src/config'
import { axiosService } from '../../axios'
export const getAllHDR = async (init, limit, fecha_desde, fecha_hasta, chofer_name, flo_dominio, hdr_activa, hdr_rendida, columname, order ) => {
  try {
    let queryParams = new URLSearchParams({
      init: init,
      limit: limit
    });

    if (chofer_name) {
      queryParams.set('chofer_name', chofer_name);
    }
    if (flo_dominio) {
      queryParams.set('flo_dominio', flo_dominio);
    }
    if (hdr_activa !== null) {
      queryParams.set('hdr_activa', hdr_activa.toString());
    }
    if (hdr_rendida !== null) {
      queryParams.set('hdr_rendida', hdr_rendida.toString());
    }
    if (fecha_desde) {
      queryParams.set('fecha_desde', fecha_desde);
    }
    if (fecha_hasta) {
      queryParams.set('fecha_hasta', fecha_hasta);
    }
    if (columname) {
      queryParams.set('columname', columname);
    }
    if (order !== null) {
      queryParams.set('order', order);
    }

    // Generar la URL final, reemplazando '+' con '%20'
    const queryString = queryParams.toString().replace(/\+/g, '%20');
    console.log(queryString)
    const url = `${ELTA_URL}/userflota/hdr_admin/?${queryString}`;

    const response = await axiosService.get(url);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getHDRbyId = async id => {
  try {
    const response = await axiosService.get(`${ELTA_URL}/userflota/hdr_admin/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const rendirHDR = async (id, observaciones)=> {
  let queryParams = new URLSearchParams({});

  if (observaciones) {
    queryParams.set('observaciones', observaciones);
  }
  try {
    const response = await axiosService.put(`${ELTA_URL}/userflota/hdr_admin/rendir/${id}`, queryParams.toString());
    return response.data;
  } catch (error) {
    throw error;
  }
};
