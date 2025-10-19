from fastapi import APIRouter, Depends
from sqlmodel import Session

from database import get_db
from models.desarrollo.proveedores import Proveedores, ProveedoresCreate, crud

proveedores_route = APIRouter(prefix="/proveedores")

conn:Session = Depends(get_db)

@proveedores_route.get('/')
async def ver_proveedoress():
    return crud.list()

@proveedores_route.post('/')
async def crear_proveedores(nuevo_proveedor: ProveedoresCreate):
    return crud.create(nuevo_proveedor)

@proveedores_route.delete('/')
async def borrar_proveedores(proveedor_a_eliminar: int):
    return crud.delete(proveedor_a_eliminar)