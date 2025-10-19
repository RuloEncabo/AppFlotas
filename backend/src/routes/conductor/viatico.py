from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import selectinload

from database import get_db
from models.desarrollo.viatico import Viatico,ViaticoCreate, crud
from models.desarrollo.tipo_viatico import TipoViatico, TipoViaticoCreate

viatico_route = APIRouter(prefix="/viatico")

conn:Session = Depends(get_db)


@viatico_route.get('/')
async def ver_viaticos():
    return crud.list()


@viatico_route.get('/{hdr_id}')
async def ver_viaticos_por_hdr(hdr_id:int, db=conn):
    statement = select(Viatico).where(Viatico.vi_hdr_id == hdr_id).options(selectinload(Viatico.tipo_viatico))
    viaticos = db.exec(statement).all()
    # Calcular totales de viaticos actuales y devolver listado de gastos por un lado y totales por otro
    viaticos_con_tipo = []
    for viatico in viaticos:
        tipo_viatico = viatico.tipo_viatico.tv_nombre if viatico.tipo_viatico else None
        viatico_dict = {
            "vi_hdr_id": viatico.vi_hdr_id,
            "vi_tipo": viatico.vi_tipo,
            "vi_fecha": viatico.vi_fecha,
            "vi_monto": viatico.vi_monto,
            "id": viatico.id,
            "tipo_viatico": tipo_viatico
        }
        viaticos_con_tipo.append(viatico_dict)

    return viaticos_con_tipo

def carga_viatico(id, monto, clase, db):
    tipo = db.exec(select(TipoViatico).where(TipoViatico.tv_des==clase)).first()
    viatico=ViaticoCreate(vi_hdr_id=id,vi_monto=monto,vi_fecha=datetime.now(),vi_tipo=tipo.id)
    crud.create(viatico)


@viatico_route.post('/{hdr_id}')
async def agregar_viatico_hdr(hdr_id:int,viatico_nacional: Optional[int] = None, adelanto_viaje:Optional[int]= None, viatico_plus:Optional[int]= None, db=conn):
    if viatico_nacional: carga_viatico(hdr_id,viatico_nacional,"via",db)
    if adelanto_viaje: carga_viatico(hdr_id,adelanto_viaje,"ad",db)
    if viatico_plus:  carga_viatico(hdr_id,viatico_plus,"plus",db) 
    data = {
        "Viat Nac" :viatico_nacional if viatico_nacional else 0,
        "Adel Viaje": adelanto_viaje if adelanto_viaje else 0,
        "Viat Plus": viatico_plus if viatico_plus else 0
    }
    
    return data


# @viatico_route.post('/')
# async def crear_viatico(viatico: ViaticoCreate):
#     return crud.create(viatico)

@viatico_route.delete('/{id}')
async def borrar_viatico(id: int):
    return crud.delete(id)

