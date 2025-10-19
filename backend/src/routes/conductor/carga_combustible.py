from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select
from database import get_db
from datetime import datetime
from fastapi_jwt import JwtAuthorizationCredentials
from models.desarrollo.carga_combustible import Carga, CargaCreate
from models.desarrollo.hdr import HDR
from models.desarrollo.movimiento import Movimiento
from data.functions.security import access_security, obtener_chofer


carga_route = APIRouter(prefix="/carga")

conn:Session = Depends(get_db)

@carga_route.get('/')
async def obtener_cargas(db=conn):
    statement = select(Carga)
    data = db.exec(statement).all()
    return data

@carga_route.get('/{carga_id}')
async def obtener_carga(carga_id: int, db=conn):
    carga = db.exec(select(Carga).where(Carga.car_id == carga_id)).first()
    
    if carga is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la carga para el ID {carga_id}")

    return carga

@carga_route.get('/hdr/{hdr_id}')
async def obtener_cargas_hdr(hdr_id: int, db=conn):
    cargas = db.exec(select(Carga).where(Carga.car_hdr_id == hdr_id)).all()
    
    if len(cargas) == 0:
        raise HTTPException(status_code=404, detail=f"No se encontró la carga para la hdr {hdr_id}")

    list_cargas = []
    for carga in cargas:
        data = {"Carga":carga,
                "Combustible": carga.car_comb.tc_nombre}
        list_cargas.append(data)
    return list_cargas

@carga_route.post('/',response_model=Carga)
async def crear_carga(nueva_carga:CargaCreate, db=conn):
    statement = select(HDR).where(HDR.hdr_id == nueva_carga.car_hdr_id)
    hoja_de_ruta = db.exec(statement).first()
    
    if hoja_de_ruta is None:
        raise HTTPException(status_code=404, detail=f"No se encontro la hoja de ruta")
    
    km_actuales = obtener_km_actuales(hoja_de_ruta, db)
    
    nueva_carga.car_observaciones = nueva_carga.car_observaciones.strip()
    carga=Carga(**dict(nueva_carga))
    if carga.car_km_odo < km_actuales:
        carga.car_infraccion = True

    if carga.car_lat == None or carga.car_lng == 0 or carga.car_lng == None or carga.car_lat == 0:
        carga.car_lat = -24.964616562468724
        carga.car_lng = -49.01101606763457
        carga.car_observaciones = "Existe una incongruencia en la ubicacion escogida"
    fecha_actual = datetime.now()
    hoja_de_ruta.hdr_modif = fecha_actual
    
    db.add(carga)
    db.commit()
    db.refresh(carga)
    return carga

def obtener_km_actuales(hdr, db):
    movimientos = db.exec(select(Movimiento).where(Movimiento.mov_hdr_id == hdr.hdr_id)).all()
    cargas = db.exec(select(Carga).where(Carga.car_hdr_id == hdr.hdr_id)).all()
    km_recorridos = hdr.flota.flo_km_odo
    if len(cargas) > 0:
        for carga in cargas:
            if carga.car_km_odo > km_recorridos: km_recorridos = carga.car_km_odo
    
    if len(movimientos) > 0:
        for movimiento in movimientos:
            if movimiento.mov_km_odo_inicio > km_recorridos: km_recorridos = movimiento.mov_km_odo_inicio
            if movimiento.mov_km_odo_fin: 
                if movimiento.mov_km_odo_fin > km_recorridos: km_recorridos = movimiento.mov_km_odo_fin
    return km_recorridos

@carga_route.delete('/{carga_id}')
async def eliminar_carga(carga_id: int, db=conn):
    sql = select(Carga).where(Carga.car_id == carga_id)
    carga = db.exec(sql).first()
    if carga is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la carga con ID {carga_id}")

    db.delete(carga)
    db.commit()

    return {"mensaje": f"Carga con ID {carga_id} eliminada exitosamente"}

@carga_route.put('/{carga_id}', response_model=Carga)
async def actualizar_carga(carga_id:int, nueva_info_carga: CargaCreate, db=conn):
    carga_existente = db.exec(select(Carga).where(Carga.car_id == carga_id)).first()

    if carga_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la carga con ID {carga_id}")

    for key, value in nueva_info_carga.model_dump().items():
        setattr(carga_existente, key, value)

    db.commit()
    db.refresh(carga_existente)
    return carga_existente