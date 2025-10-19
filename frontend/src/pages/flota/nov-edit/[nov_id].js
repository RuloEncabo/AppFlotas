import NovInfoView from 'src/views/pages/flota-views/editNOV/NovInfoView';

const FlotaHDR = () => {
  return (
    <div>
      <NovInfoView/>
    </div>
  )
}
FlotaHDR.acl = {
  action: 'usar',
  subject: 'flota'
}



export default FlotaHDR;
