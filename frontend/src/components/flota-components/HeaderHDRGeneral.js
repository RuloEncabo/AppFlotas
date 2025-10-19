import { Card } from '@mui/material'
import React, { Fragment } from 'react'
import CardInfo1 from './CardInfo1'
import Typography from '@mui/material'

function HeaderHDRGeneral({data}) {
  return (
      <div>
      <Card sx={{mb:4,display:'flex',justifyContent:"left",gap:4}}>
        <CardInfo1 title={"CANTIDAD"} val={data.TOTAL}/>
        {/* <CardInfo1 title={"CANTIDAD"} val={data.TOTAL}/>
        <CardInfo1 title={"CANTIDAD"} val={data.TOTAL}/> */}
      </Card>
      </div>
  )
}

export default HeaderHDRGeneral
