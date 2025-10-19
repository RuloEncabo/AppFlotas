import ParametrosView from "src/views/pages/flota-views/ParametrosView"

const FlotaPage = () => {
  return <ParametrosView/>

}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
