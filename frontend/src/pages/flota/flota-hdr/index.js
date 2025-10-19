import HDRView from "src/views/pages/flota-views/HDRView"

const FlotaPage = () => {


  //Podemos poner validaciones si es nececario
  return <HDRView/>
}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
