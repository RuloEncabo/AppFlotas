from fastapi import APIRouter, Depends
from sqlmodel import Session

from database import get_db
from models.desarrollo.deposito import Deposito, DepositoCreate, crud

deposito_route = APIRouter(prefix="/deposito")

conn:Session = Depends(get_db)

@deposito_route.get('/')
async def ver_depositos():
    return crud.list()

@deposito_route.post('/')
async def crear_deposito(nuevo_deposito: DepositoCreate):
    return crud.create(nuevo_deposito)

@deposito_route.delete('/')
async def borrar_deposito(deposito_a_eliminar: int):
    return crud.delete(deposito_a_eliminar)