from fastapi import APIRouter, Depends
from sqlmodel import Session

from database import get_db
from models.desarrollo.marcas_modelos import MarcaModelo, MarcaModeloCreate, crud

marcas_modelos_route = APIRouter(prefix="/marcas_modelos")

conn:Session = Depends(get_db)

@marcas_modelos_route.get('/')
async def ver_marcas_modeloss():
    return crud.list()

@marcas_modelos_route.post('/')
async def crear_marcas_modelos(nuevo_marcas_modelos: MarcaModeloCreate):
    return crud.create(nuevo_marcas_modelos)

@marcas_modelos_route.delete('/')
async def borrar_marcas_modelos(marcas_modelos_a_eliminar: int):
    return crud.delete(marcas_modelos_a_eliminar)