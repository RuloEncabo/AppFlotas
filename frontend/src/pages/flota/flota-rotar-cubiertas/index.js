import TablaRotarCubiertas from "src/components/dashboard-components/TablaRotarCubiertas"

const FlotaPage = () => {
  return <TablaRotarCubiertas/>

}

FlotaPage.acl = {
  action: 'usar',
  subject: 'flota'
}

export default FlotaPage
