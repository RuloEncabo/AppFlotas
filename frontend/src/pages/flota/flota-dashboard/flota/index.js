import AltaCubiertaFlotaView from "src/views/pages/flota-views/cubiertas/alta-cubierta-flota"
const FlotaPage = () => {


  //Podemos poner validaciones si es nececario
  return <AltaCubiertaFlotaView/>
}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
