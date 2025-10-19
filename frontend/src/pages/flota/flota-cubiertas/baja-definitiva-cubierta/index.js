import BajaDefinitivaCubiertaView from "src/views/pages/flota-views/cubiertas/baja-definitiva-cubierta"

const FlotaPage = () => {

  //Podemos poner validaciones si es nececario
  return <BajaDefinitivaCubiertaView/>
}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
