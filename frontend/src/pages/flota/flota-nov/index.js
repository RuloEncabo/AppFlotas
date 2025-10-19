import NovView from "src/views/pages/flota-views/NovView"

const FlotaPage = () => {
  //Podemos poner validaciones si es nececario
  return <NovView/>
}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
