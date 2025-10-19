from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select
from fastapi_jwt import JwtAuthorizationCredentials
from data.functions.security import access_security

from database import get_db
from models.desarrollo.ot_nov import OT_Nov, OT_NovCreate

ot_nov_route = APIRouter(prefix="/ot_nov")

conn:Session = Depends(get_db)


@ot_nov_route.get('/')
async def obtener_ot_novs(db=conn):
    statement = select(OT_Nov)
    data = db.exec(statement).all()
    return data

@ot_nov_route.get('/{ot_nov_id}')
async def obtener_ot_nov(ot_nov_id: int, db=conn):
    ot_nov = db.exec(select(OT_Nov).where(OT_Nov.id == ot_nov_id)).first()
    
    if ot_nov is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la orden de trabajo para el ID {ot_nov_id}")

    return ot_nov

@ot_nov_route.post('/',response_model=OT_Nov)
async def crear_ot_nov(nuevo_ot:OT_NovCreate, db=conn):
    ot_nov= OT_Nov(**dict(nuevo_ot))
    db.add(ot_nov)
    db.commit()
    db.refresh(ot_nov)
    return ot_nov

@ot_nov_route.delete('/{ot_nov_id}')
async def eliminar_ot_nov(ot_nov_id: int, db=conn):
    sql = select(OT_Nov).where(OT_Nov.id == ot_nov_id)
    ot_nov = db.exec(sql).first()
    if ot_nov is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la orden de trabajo con ID {ot_nov_id}")

    db.delete(ot_nov)
    db.commit()

    return {"mensaje": f"orden de trabajo con ID {ot_nov} eliminada exitosamente"}