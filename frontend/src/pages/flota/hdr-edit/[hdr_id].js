import { useRouter } from 'next/router';
import EditHDRView from 'src/views/pages/flota-views/editHDR/EditHDRView';
const FlotaHDR = () => {

  return (
    <div>
      <EditHDRView  />
    </div>
  )
}
FlotaHDR.acl = {
  action: 'usar',
  subject: 'flota'
}



export default FlotaHDR;
