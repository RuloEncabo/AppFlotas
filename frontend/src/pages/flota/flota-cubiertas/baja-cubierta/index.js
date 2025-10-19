import BajaCubiertaView from "src/views/pages/flota-views/cubiertas/baja-cubierta"

const FlotaPage = () => {


  //Podemos poner validaciones si es nececario
  return <BajaCubiertaView/>
}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
