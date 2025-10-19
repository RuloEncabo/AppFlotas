import DashGeneralView from "src/views/pages/flota-views/dashboard/general/DashGeneralView"

const FlotaPage = () => {
  return <DashGeneralView/>
}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
