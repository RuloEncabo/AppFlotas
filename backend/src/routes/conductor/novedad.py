from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_db
from models.desarrollo.novedad import Novedad, NovedadCreate
from models.desarrollo.hdr import HDR
from models.desarrollo.movimiento import Movimiento
from datetime import datetime

novedad_route = APIRouter(prefix="/novedades")

conn:Session = Depends(get_db)

@novedad_route.get('/')
async def leer_novedades(db=conn):
    statement = select(Novedad)
    data = db.exec(statement).all()
    return data

@novedad_route.delete('/{novedad_id}')
async def eliminar_novedad(novedad_id: int, db=conn):
    sql = select(Novedad).where(Novedad.nov_id == novedad_id)
    novedad = db.exec(sql).first()
    if novedad is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la novedad con ID {novedad_id}")

    db.delete(novedad)
    db.commit()

    return {"mensaje": f"Novedad con ID {novedad_id} eliminada exitosamente"}

@novedad_route.get('/{hdr_id}')
async def leer_novedades_hdr(hdr_id: int, db=conn):
    sql = select(Novedad).where(Novedad.nov_hdr_id == hdr_id)
    novedades = db.exec(sql).all()
    
    if len(novedades) == 0:
        raise HTTPException(status_code=404, detail=f"No se encontraron novedades para la Hoja de ruta: {hdr_id}")

    return novedades

@novedad_route.post('/',response_model=Novedad)
async def crear_novedad(nueva_novedad:NovedadCreate, db=conn):
    statement = select(HDR).where(HDR.hdr_id == nueva_novedad.nov_hdr_id)
    hoja_de_ruta = db.exec(statement).first()
    
    if hoja_de_ruta is None:
        raise HTTPException(status_code=404, detail=f"No se encontro la hoja de ruta")
    
    km_actuales = obtener_km_actuales(hoja_de_ruta, db)
    
    novedad=Novedad(**dict(nueva_novedad))
    if novedad.nov_km_odo < km_actuales: 
        novedad.nov_infraccion = True

    fecha_actual = datetime.now()
    hoja_de_ruta.hdr_modif = fecha_actual

    db.add(novedad)
    db.commit()
    db.refresh(novedad)
    return novedad

def obtener_km_actuales(hdr, db):
    movimientos = db.exec(select(Movimiento).where(Movimiento.mov_hdr_id == hdr.hdr_id)).all()
    km_recorridos = hdr.flota.flo_km_odo
    if len(movimientos) > 0:
        for movimiento in movimientos:
            if movimiento.mov_km_odo_fin:
                km_recorridos += (movimiento.mov_km_odo_fin - movimiento.mov_km_odo_inicio)
    return km_recorridos

@novedad_route.put('/{novedad_id}', response_model=Novedad)
async def actualizar_novedad(novedad_id:int, nueva_info_novedad: NovedadCreate, db=conn):
    novedad_existente = db.exec(select(Novedad).where(Novedad.nov_id == novedad_id)).first()

    if novedad_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la novedad con ID {novedad_id}")

    for key, value in nueva_info_novedad.model_dump().items():
        setattr(novedad_existente, key, value)

    db.commit()
    db.refresh(novedad_existente)
    return novedad_existente