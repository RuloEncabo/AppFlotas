import { Card } from '@mui/material'
import React from 'react'
import CardInfo1 from './CardInfo1'

function HeaderNovGeneral({data}) {
  return (
    <div>
      <Card sx={{mb:4,display:'flex',justifyContent:"left",gap:4}}>
        <CardInfo1 title={"Cantidad de Asignadas"} val={data.CANT_ASIGNADAS}/>
        <CardInfo1 title={"Cantidad de Cerradas"}  val={data.CANT_CERRADAS}/>
        <CardInfo1 title={"Cantidad de Pendientes"} val={data.CANT_PENDIENTES}/>
      </Card>
    </div>
  )
}

export default HeaderNovGeneral
