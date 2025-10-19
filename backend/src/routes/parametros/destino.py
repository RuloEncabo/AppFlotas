from fastapi import APIRouter, Depends
from sqlmodel import Session

from database import get_db
from models.desarrollo.destino import Destino, crud, DestinoCreate

destino_route = APIRouter(prefix="/destino")

conn:Session = Depends(get_db)

@destino_route.get('/')
async def ver_destinos():
    return crud.list()


@destino_route.post('/')
async def crear_destino(nuevo_destino: DestinoCreate):
    return crud.create(nuevo_destino)

@destino_route.delete('/')
async def borrar_destino(destino_a_eliminar: int):
    return crud.delete(destino_a_eliminar)