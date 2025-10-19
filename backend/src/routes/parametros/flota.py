from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_db
from models.desarrollo.flota import Flota, FlotaCreate
from models.desarrollo.hdr import HDR
from sqlalchemy import not_, distinct, exists

from models.desarrollo.batea import Batea

flota_route = APIRouter(prefix="/flota")

conn:Session = Depends(get_db)

@flota_route.get('/flotas_bateas')
async def obtener_all_flotas(db=conn):
    list_data = []
    flotas = db.exec(select(Flota)).all()
    bateas = db.exec(select(Batea)).all()
    list_data.append(flotas)
    list_data.append(bateas)
    return list_data

@flota_route.get('/flotas')
async def obtener_all_flotas(db=conn):
    flotas = db.exec(select(Flota)).all()
    return flotas

@flota_route.get('/')
async def obtener_flotas(db=conn):
    subquery = select(HDR.hdr_flota_id).where(HDR.hdr_active == True).distinct()
    subquery_result = db.exec(subquery).all()

    if subquery_result:
        flotas_ocupadas_ids = []
        for result in subquery_result:
            if result != None: flotas_ocupadas_ids.append(result)
        
        if len(flotas_ocupadas_ids) > 0:
            if 1 in flotas_ocupadas_ids: flotas_ocupadas_ids.remove(1)
            flotas_query = select(Flota).where(not_(Flota.flo_id.in_(flotas_ocupadas_ids)))
            flotas_libres = db.exec(flotas_query).all()
            return flotas_libres
    return db.exec(select(Flota)).all()

@flota_route.get('/{flo_id}')
async def obtener_flota(flo_id: int, db=conn):
    flota = db.exec(select(Flota).where(Flota.flo_id == flo_id)).first()
    
    if flota is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la flota para el ID {flo_id}")

    return flota

@flota_route.post('/',response_model=Flota)
async def crear_flota(nueva_flota:FlotaCreate, db=conn):
    flota= Flota(**dict(nueva_flota))
    db.add(flota)
    db.commit()
    db.refresh(flota)
    return flota

@flota_route.delete('/{flo_id}')
async def eliminar_flota(flo_id: int, db=conn):
    sql = select(Flota).where(Flota.flo_id == flo_id)
    flota = db.exec(sql).first()
    if flota is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la flota con ID {flo_id}")

    db.delete(flota)
    db.commit()

    return {"mensaje": f"Flota con ID {flo_id} eliminada exitosamente"}