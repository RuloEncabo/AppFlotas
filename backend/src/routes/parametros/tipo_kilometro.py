from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select
from fastapi_jwt import JwtAuthorizationCredentials
from data.functions.security import access_security

from database import get_db
from models.desarrollo.tipo_kilometro import TipoKilometro, TipoKilometroCreate

tipo_kilometro_route = APIRouter(prefix="/tipo_kilometro")

conn:Session = Depends(get_db)

@tipo_kilometro_route.get('/')
async def obtener_tipos_kilometros(db=conn):
    statement = select(TipoKilometro)
    data = db.exec(statement).all()
    return data

@tipo_kilometro_route.get('/{tipo_kilometro_id}')
async def obtener_tipo_kilometro(tipo_kilometro_id: int, db=conn):
    tipo_kilometro = db.exec(select(TipoKilometro).where(TipoKilometro.tk_id == tipo_kilometro_id)).first()
    
    if tipo_kilometro is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el tipo kilometro para el ID {tipo_kilometro_id}")

    return tipo_kilometro

@tipo_kilometro_route.post('/',response_model=TipoKilometro)
async def crear_tipo_kilometro(nuevo_tipo_kilometro:TipoKilometroCreate, db=conn):
    tk= TipoKilometro(**dict(nuevo_tipo_kilometro))
    db.add(tk)
    db.commit()
    db.refresh(tk)
    return tk

@tipo_kilometro_route.delete('/{tipo_kilometro_id}')
async def eliminar_tipo_kilometro(tipo_kilometro_id: int, db=conn):
    sql = select(TipoKilometro).where(TipoKilometro.tk_id == tipo_kilometro_id)
    tipo_kilometro = db.exec(sql).first()
    if tipo_kilometro is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el tipo kilometro con ID {tipo_kilometro_id}")

    db.delete(tipo_kilometro)
    db.commit()

    return {"mensaje": f"tipo kilometro con ID {tipo_kilometro_id} eliminada exitosamente"}