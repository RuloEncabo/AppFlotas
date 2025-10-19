import TratamientoCubiertaView from "src/views/pages/flota-views/cubiertas/tratamiento-cubierta"

const FlotaPage = () => {


  //Podemos poner validaciones si es nececario
  return <TratamientoCubiertaView/>
}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
