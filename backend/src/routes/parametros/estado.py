from fastapi import APIRouter, Depends
from sqlmodel import Session

from database import get_db
from models.desarrollo.estado import Estado, EstadoCreate, crud

estado_route = APIRouter(prefix="/estado")

conn:Session = Depends(get_db)

@estado_route.get('/')
async def ver_estados():
    return crud.list()

@estado_route.post('/')
async def crear_estado(nuevo_estado: EstadoCreate):
    return crud.create(nuevo_estado)

@estado_route.delete('/')
async def borrar_estado(estado_a_eliminar: int):
    return crud.delete(estado_a_eliminar)