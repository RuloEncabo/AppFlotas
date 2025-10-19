from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_db
from models.desarrollo.trabajo import Trabajo, TrabajoCreate, crud

trabajo_route = APIRouter(prefix="/trabajo")

conn:Session = Depends(get_db)

@trabajo_route.get('/recapados/')
async def ver_trabajos_recapado(db=conn):
    statement = select(Trabajo).where(Trabajo.tra_des=="RECAPADO")
    data = db.exec(statement).all()
    return data

@trabajo_route.get('/reparacion/')
async def ver_trabajos_reparacion(db=conn):
    statement = select(Trabajo).where(Trabajo.tra_des=="REPARACION")
    data = db.exec(statement).all()
    return data

@trabajo_route.get('/')
async def ver_trabajos():
    return crud.list()

@trabajo_route.post('/')
async def crear_trabajo(nuevo_trabajo: TrabajoCreate):
    return crud.create(nuevo_trabajo)

@trabajo_route.delete('/')
async def borrar_trabajo(trabajo_a_eliminar: int):
    return crud.delete(trabajo_a_eliminar)