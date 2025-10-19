from fastapi import APIRouter, Depends
from sqlmodel import Session

from database import get_db
from models.desarrollo.tipo_destino import TipoDestino, TipoDestinoCreate, crud

tipo_destino_route = APIRouter(prefix="/tipo_destino")

conn:Session = Depends(get_db)

@tipo_destino_route.get('/')
async def ver_tipo_destinos():
    return crud.list()

@tipo_destino_route.post('/')
async def crear_tipo_destino(nuevo_destino: TipoDestinoCreate):
    return crud.create(nuevo_destino)

@tipo_destino_route.delete('/')
async def borrar_tipo_destino(destino_a_eliminar: int):
    return crud.delete(destino_a_eliminar)