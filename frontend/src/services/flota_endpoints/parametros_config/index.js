import { axiosService } from "src/services/axios";
import { ELTA_URL } from "src/config";
import { format } from "date-fns";

export const getProveedores = async () => {
  try {
    const response = await axiosService.get(ELTA_URL + "/params/proveedores/");
    return response.data;
  } catch (error) {
    throw error;
  }
}


export const postProveedores = async (newProv) => {
  try {
    const response = await axiosService.post(ELTA_URL + "/params/proveedores/", newProv);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const deleteProveedores = async (id) => {
  try {
    const response = await axiosService.delete( ELTA_URL + `/params/proveedores/?proveedor_a_eliminar=${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getControlAceite = async () => {
  try {
    const response = await axiosService.get(ELTA_URL + "/userflota/ot/control_aceite");
    return response.data;
  } catch (error) {
    throw error;
  }
}

const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
};

export const cambioAceiteFlota = async ( id, fecha, km, tipo_aceite , taller_id) => {
  const fechaModificada = formatDate(fecha);
  try {
    //  'http://localhost:8002/userflota/ot/cambio_aceite?id=1&fecha=2023-06-02%2015%3A30%3A00&km=156896'
    const response = await axiosService.put(ELTA_URL + `/userflota/ot/cambio_aceite/?id=${id}&fecha=${fechaModificada}&km=${km}&tipo_aceite=${tipo_aceite}&taller_id=${taller_id}`);
    return response.data;
  }catch (error) {
    throw error;
  }
}

export const ultCambioAceite = async (id) => {
  try {
    const response = await axiosService.get(ELTA_URL + `/userflota/ot/ult_cambio_aceite/${id}`);
    return response.data;
  }catch (error) {
    throw error;
  }
}


//http://localhost:8002/userflota/hist_aceite/
export const getHistoricoAceite = async () => {
  try {
    const response = await axiosService.get(ELTA_URL + "/userflota/hist_aceite/");
    return response.data;
  } catch (error) {
    throw error;
  }
}
