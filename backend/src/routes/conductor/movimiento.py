from zoneinfo import ZoneInfo
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from database import get_db
from models.desarrollo.movimiento import Movimiento, MovimientoCreate
from models.desarrollo.hdr import HDR
import pytz

movimiento_route = APIRouter(prefix="/movimientos")

conn:Session = Depends(get_db)

@movimiento_route.get('/')
async def leer_movimientos(db=conn):
    statement = select(Movimiento)
    data = db.exec(statement).all()
    return data

@movimiento_route.delete('/{movimiento_id}')
async def eliminar_movimiento(movimiento_id: int, db=conn):
    sql = select(Movimiento).where(Movimiento.mov_id == movimiento_id)
    movimiento = db.exec(sql).first()
    if movimiento is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el movimiento con ID {movimiento_id}")

    db.delete(movimiento)
    db.commit()

    return {"mensaje": f"Movimiento con ID {movimiento_id} eliminada exitosamente"}

@movimiento_route.get('/{hdr_id}')
async def leer_movimientos_hdr(hdr_id: int, db=conn):
    sql = select(Movimiento).where(Movimiento.mov_hdr_id == hdr_id)
    movimientos = db.exec(sql).all()
    
    if len(movimientos) == 0:
        raise HTTPException(status_code=404, detail=f"No se encontraron movimientos para la Hoja de ruta: {hdr_id}")

    return movimientos

@movimiento_route.post('/', response_model=Movimiento)
async def crear_movimiento(nuevo_movimiento: MovimientoCreate, db=conn):
    statement = select(HDR).where(HDR.hdr_id == nuevo_movimiento.mov_hdr_id)
    hoja_de_ruta = db.exec(statement).first()
    
    if hoja_de_ruta is None:
        raise HTTPException(status_code=404, detail="No se encontró la hoja de ruta")
    
    km_actuales = obtener_km_actuales(hoja_de_ruta, db)
    
    GMT3 = ZoneInfo("America/Argentina/Buenos_Aires")

    # Convertir la fecha recibida de UTC a GMT-3 antes de guardar
    mov_inicio = nuevo_movimiento.mov_inicio.astimezone(GMT3)

    # Capturar la hora real del sistema en GMT-3
    fecha_actual = datetime.now(GMT3)

    if nuevo_movimiento.mov_km_odo_inicio < km_actuales:
        raise HTTPException(status_code=400, detail=f"El kilometraje debe ser mayor o igual a los actuales: {km_actuales}km")
    
    

    movimiento = Movimiento(
        **nuevo_movimiento.model_dump(exclude={"mov_inicio"}),
        mov_inicio=mov_inicio
    )

    hoja_de_ruta.hdr_modif = fecha_actual
    db.add(movimiento)
    db.commit()
    db.refresh(movimiento)
    return movimiento

def obtener_km_actuales(hdr, db):
    movimientos = db.exec(select(Movimiento).where(Movimiento.mov_hdr_id == hdr.hdr_id)).all()
    km_recorridos = hdr.flota.flo_km_odo
    if len(movimientos) > 0:
        for movimiento in movimientos:
            if movimiento.mov_km_odo_fin:
                km_recorridos += (movimiento.mov_km_odo_fin - movimiento.mov_km_odo_inicio)
    return km_recorridos


@movimiento_route.put('/{movimiento_id}', response_model=Movimiento)
async def actualizar_movimiento(movimiento_id: int, nueva_info_movimiento: MovimientoCreate, db=conn):
    movimiento_existente = db.exec(select(Movimiento).where(Movimiento.mov_id == movimiento_id)).first()

    if movimiento_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el movimiento con ID {movimiento_id}")
    
    statement = select(HDR).where(HDR.hdr_id == movimiento_existente.mov_hdr_id)
    hoja_de_ruta = db.exec(statement).first()

    km_actuales = obtener_km_actuales(hoja_de_ruta, db)

    GMT3 = ZoneInfo("America/Argentina/Buenos_Aires")

    UTC = ZoneInfo("UTC")

    mov_inicio_gmt3 = movimiento_existente.mov_inicio
    # Si no tiene zona horaria, asumir que estaba en UTC y convertir a GMT-3
    if mov_inicio_gmt3.tzinfo is None:
        mov_inicio_gmt3 = mov_inicio_gmt3.replace(tzinfo=GMT3).astimezone(GMT3)
    else:
        mov_inicio_gmt3 = mov_inicio_gmt3.astimezone(GMT3)

    print("mov_inicio corregido:", mov_inicio_gmt3)  # Para depuración

    mov_fin_gmt3 = nueva_info_movimiento.mov_fin

    if mov_fin_gmt3.tzinfo is None:
        mov_fin_gmt3 = mov_fin_gmt3.replace(tzinfo=UTC).astimezone(GMT3)
    else:
        mov_fin_gmt3 = mov_fin_gmt3.astimezone(GMT3)

    print("mov_fin corregido:", mov_fin_gmt3)  # Para depuración


    if mov_fin_gmt3 < mov_inicio_gmt3:
        print("mov_inicio (DB):", movimiento_existente.mov_inicio, movimiento_existente.mov_inicio.tzinfo)
        raise HTTPException(status_code=400, detail="La fecha de finalización debe ser mayor o igual a la de inicio.")

    movimiento_existente.mov_fin = mov_fin_gmt3
    movimiento_existente.mov_fin_real = datetime.now(GMT3)  # Captura en la hora local GMT-3

    # Validar el kilometraje
    if nueva_info_movimiento.mov_km_odo_fin:
        if nueva_info_movimiento.mov_km_odo_fin < km_actuales:
            raise HTTPException(status_code=400, detail=f"El kilometraje debe ser mayor a los actuales: {km_actuales} km")
    
    # Actualizar los demás campos si están presentes
    for key, value in nueva_info_movimiento.model_dump().items():
        if key not in ["mov_fin", "mov_fin_real"]:  # Evitamos sobrescribir manualmente estos valores
            setattr(movimiento_existente, key, value)

    hoja_de_ruta.hdr_modif = datetime.now(GMT3)  # Actualizar la última modificación en GMT-3
    db.commit()
    db.refresh(movimiento_existente)
    
    return movimiento_existente
