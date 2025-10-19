import HDRValidationView from "src/views/pages/flota-views/HDRValidationView"

const HDRValidationPage = () => {
  //Podemos poner validaciones si es nececario
  return <HDRValidationView/>
}

HDRValidationPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default HDRValidationPage
