import GeneralView from "src/views/pages/flota-views/GeneralView"

const FlotaPage = () => {


  //Podemos poner validaciones si es nececario
  return <GeneralView/>
}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
