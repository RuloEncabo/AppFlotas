from fastapi import APIRouter, Depends
from sqlmodel import Session

from database import get_db
from models.desarrollo.tipo_viatico import TipoViatico, TipoViaticoCreate, crud

tipo_viatico_route = APIRouter(prefix="/tipo_viatico")

conn:Session = Depends(get_db)

@tipo_viatico_route.get('/')
async def ver_tipo_viaticos():
    return crud.list()

@tipo_viatico_route.post('/')
async def crear_tipo_viaticos(nuevo_destino: TipoViaticoCreate):
    return crud.create(nuevo_destino)

@tipo_viatico_route.delete('/')
async def borrar_tipo_destino(tipo_viatico_a_eliminar: int):
    return crud.delete(tipo_viatico_a_eliminar)