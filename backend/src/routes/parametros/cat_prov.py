from fastapi import APIRouter, Depends
from sqlmodel import Session

from database import get_db
from models.desarrollo.cat_prov import CategoriaProveedores, CategoriaProveedoresCreate, crud

cat_proveedores_route = APIRouter(prefix="/cat_proveedores")

conn:Session = Depends(get_db)

@cat_proveedores_route.get('/')
async def ver_cat_proveedoress():
    return crud.list()

@cat_proveedores_route.post('/')
async def crear_cat_proveedores(nuevo_proveedor: CategoriaProveedoresCreate):
    return crud.create(nuevo_proveedor)

@cat_proveedores_route.delete('/')
async def borrar_cat_proveedores(proveedor_a_eliminar: int):
    return crud.delete(proveedor_a_eliminar)