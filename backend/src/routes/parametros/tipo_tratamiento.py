from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_db
from models.desarrollo.tipo_tratamiento import TipoTratamiento, TipoTratamientoCreate, crud

tipo_tratamiento_route = APIRouter(prefix="/tipo_tratamiento")

conn:Session = Depends(get_db)

@tipo_tratamiento_route.get('/')
async def ver_tipo_tratamientos():
    return crud.list()

@tipo_tratamiento_route.post('/')
async def crear_tipo_tratamiento(nuevo_tipo_tratamiento: TipoTratamientoCreate):
    return crud.create(nuevo_tipo_tratamiento)

@tipo_tratamiento_route.delete('/')
async def borrar_tipo_tratamiento(tipo_tratamiento_a_eliminar: int):
    return crud.delete(tipo_tratamiento_a_eliminar)