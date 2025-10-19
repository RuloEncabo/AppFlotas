from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select
from fastapi_jwt import JwtAuthorizationCredentials
from data.functions.security import access_security

from database import get_db
from models.desarrollo.tipo_combustible import TipoCombustible, TipoCombustibleCreate

tipo_combustible_route = APIRouter(prefix="/tipo_combustible")

conn:Session = Depends(get_db)

@tipo_combustible_route.get('/')
async def obtener_tipos_combustibles(db=conn):
    statement = select(TipoCombustible)
    data = db.exec(statement).all()
    return data

@tipo_combustible_route.get('/{tipo_combustible_id}')
async def obtener_tipo_combustible(tipo_combustible_id: int, db=conn):
    tipo_combustible = db.exec(select(TipoCombustible).where(TipoCombustible.tc_id == tipo_combustible_id)).first()
    
    if tipo_combustible is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el tipo combustible para el ID {tipo_combustible_id}")

    return tipo_combustible

@tipo_combustible_route.post('/',response_model=TipoCombustible)
async def crear_tipo_combustible(nuevo_tipo_combustible:TipoCombustibleCreate, db=conn):
    tc= TipoCombustible(**dict(nuevo_tipo_combustible))
    db.add(tc)
    db.commit()
    db.refresh(tc)
    return tc

@tipo_combustible_route.delete('/{tipo_combustible_id}')
async def eliminar_tipo_combustible(tipo_combustible_id: int, db=conn):
    sql = select(TipoCombustible).where(TipoCombustible.tc_id == tipo_combustible_id)
    tipo_combustible = db.exec(sql).first()
    if tipo_combustible is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el tipo combustible con ID {tipo_combustible_id}")

    db.delete(tipo_combustible)
    db.commit()

    return {"mensaje": f"tipo combustible con ID {tipo_combustible_id} eliminada exitosamente"}