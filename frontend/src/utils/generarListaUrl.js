import { ELTA_URL } from "src/config";

function generarListaUrls(respuestaEndpoint) {
  const { RUTA, CONTENIDO } = respuestaEndpoint;
  const urls = CONTENIDO.map(nombreFoto => {
    return `${ELTA_URL}${RUTA}${nombreFoto}`;
  });
  return urls;
}
export default generarListaUrls
