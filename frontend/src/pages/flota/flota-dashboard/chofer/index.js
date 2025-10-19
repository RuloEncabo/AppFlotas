import AltaCubiertaView from "src/views/pages/flota-views/cubiertas/alta-cubierta"
const FlotaPage = () => {


  //Podemos poner validaciones si es nececario
  return <AltaCubiertaView/>
}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
