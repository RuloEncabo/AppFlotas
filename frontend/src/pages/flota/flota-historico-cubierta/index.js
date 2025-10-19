import { HistoricoCubiertaView } from "src/views/pages/flota-views/cubiertas/HistoricoCubiertaView"

const FlotaPage = () => {
  return <HistoricoCubiertaView/>
}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
