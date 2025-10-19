from fastapi import APIRouter, Depends
from sqlmodel import Session

from database import get_db
from models.desarrollo.posicion import Posicion, PosicionCreate, crud

posicion_route = APIRouter(prefix="/posicion")

conn:Session = Depends(get_db)

@posicion_route.get('/')
async def ver_posicions():
    return crud.list()

@posicion_route.post('/')
async def crear_posicion(nuevo_posicion: PosicionCreate):
    return crud.create(nuevo_posicion)

@posicion_route.delete('/')
async def borrar_posicion(posicion_a_eliminar: int):
    return crud.delete(posicion_a_eliminar)