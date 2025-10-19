import CubiertasGeneralView from "src/views/pages/flota-views/cubiertas/CubiertasGeneralView"

const FlotaPage = () => {


  //Podemos poner validaciones si es nececario
  return <CubiertasGeneralView/>
}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
