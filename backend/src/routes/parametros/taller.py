from fastapi import APIRouter, Depends
from sqlmodel import Session

from database import get_db
from models.desarrollo.taller import Taller, TallerCreate, crud

taller_route = APIRouter(prefix="/taller")

conn:Session = Depends(get_db)

@taller_route.get('/')
async def ver_talleres():
    return crud.list()

@taller_route.post('/')
async def crear_taller(nuevo_taller: TallerCreate):
    return crud.create(nuevo_taller)

@taller_route.delete('/')
async def borrar_taller(taller_a_eliminar: int):
    return crud.delete(taller_a_eliminar)