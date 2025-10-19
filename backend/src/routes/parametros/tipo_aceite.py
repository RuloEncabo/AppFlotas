from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_db
from models.desarrollo.tipo_aceite import TipoAceite, TipoAceiteCreate, crud

tipo_aceite_route = APIRouter(prefix="/tipo_aceite")

conn:Session = Depends(get_db)

@tipo_aceite_route.get('/')
async def ver_tipo_aceites():
    return crud.list()

@tipo_aceite_route.post('/')
async def crear_tipo_aceite(nuevo_tipo_aceite: TipoAceiteCreate):
    return crud.create(nuevo_tipo_aceite)

@tipo_aceite_route.delete('/')
async def borrar_tipo_aceite(tipo_aceite_a_eliminar: int):
    return crud.delete(tipo_aceite_a_eliminar)