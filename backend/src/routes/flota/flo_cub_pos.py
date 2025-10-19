from fastapi import APIRouter, Depends
from sqlmodel import Session

from database import get_db
from models.desarrollo.flo_cub_pos import FloCubPos, FloCubPosCreate, crud

flo_cub_pos_route = APIRouter(prefix="/flo_cub_pos")

conn:Session = Depends(get_db)

@flo_cub_pos_route.get('/')
async def ver_flo_cub_poss():
    return crud.list()

@flo_cub_pos_route.post('/')
async def crear_flo_cub_pos(nuevo_flo_cub_pos: FloCubPosCreate):
    return crud.create(nuevo_flo_cub_pos)

@flo_cub_pos_route.delete('/')
async def borrar_flo_cub_pos(flo_cub_pos_a_eliminar: int):
    return crud.delete(flo_cub_pos_a_eliminar)