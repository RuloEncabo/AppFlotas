import MantenimientoPreventivoView from "src/views/pages/flota-views/MantenimientoPreventivoView"

const FlotaPage = () => {
  return <MantenimientoPreventivoView/>

}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
