import { ELTA_URL } from "src/config";

function generarUrlFoto(tipo, idHDR, idObjeto, nombreFoto) {
  // Construye la URL basándose en los parámetros proporcionados
  if (idObjeto=="IMG" || idObjeto ==""){
    return `${ELTA_URL}/files/${tipo}/not_found.png`;
  }else{
    return `${ELTA_URL}/files/${tipo}/${idHDR}/${idObjeto}/${nombreFoto}.png`;
  }
}
export default generarUrlFoto
