import { React} from 'react'
import DetallesHojaRuta from 'src/components/chofer-components/HDRInfo'
import {Container} from '@mui/material'

const General = ({ data }) => {

  if (data != null) {
    return (
      <Container>
        <DetallesHojaRuta actualData={data} />
      </Container>
    )
  }
}

export default General
