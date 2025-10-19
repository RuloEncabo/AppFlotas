from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_db
from models.desarrollo.batea import Batea,BateaCreate
from models.desarrollo.hdr import HDR
from sqlalchemy import not_, distinct

batea_route = APIRouter(prefix="/batea")

conn:Session = Depends(get_db)

@batea_route.get('/')
async def obtener_bateas(db=conn):
    subquery = select(HDR.hdr_batea_id).where(HDR.hdr_active == True).distinct()
    subquery_result = db.exec(subquery).all()

    if subquery_result:
        bateas_ocupadas_ids = []
        for result in subquery_result:
            if result != None:bateas_ocupadas_ids.append(result)
        if len(bateas_ocupadas_ids) > 0:
            if 1 in bateas_ocupadas_ids: bateas_ocupadas_ids.remove(1)
            bateas_query = select(Batea).where(not_(Batea.bat_id.in_(bateas_ocupadas_ids)))
            bateas_libres = db.exec(bateas_query).all()
            return bateas_libres
    return db.exec(select(Batea)).all()

@batea_route.get('/{batea_id}')
async def obtener_batea(batea_id: int, db=conn):
    batea = db.exec(select(Batea).where(Batea.bat_id == batea_id)).first()
    
    if batea is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la batea para el ID {batea_id}")

    return batea

@batea_route.post('/',response_model=Batea)
async def crear_batea(nueva_batea:BateaCreate, db=conn):
    batea=Batea(**dict(nueva_batea))
    db.add(batea)
    db.commit()
    db.refresh(batea)
    return batea


@batea_route.delete('/{batea_id}')
async def eliminar_batea(batea_id: int, db=conn):
    sql = select(Batea).where(Batea.bat_id == batea_id)
    batea = db.exec(sql).first()
    if batea is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el batea con ID {batea_id}")

    db.delete(batea)
    db.commit()

    return {"mensaje": f"Batea con ID {batea_id} eliminada exitosamente"}