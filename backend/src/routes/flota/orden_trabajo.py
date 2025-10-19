
from fastapi import APIRouter, Body, Depends, HTTPException, Security
from sqlmodel import Session, select
from fastapi_jwt import JwtAuthorizationCredentials
from data.functions.security import access_security, obtener_user_flota
from database import get_db
from models.desarrollo.orden_trabajo import OT, OTCreate
from models.desarrollo.ot_nov import OT_Nov, OT_NovCreate
from models.desarrollo.novedad import Novedad
from models.desarrollo.historico_aceite import HistoricoAceite
from models.desarrollo.flota import Flota
from sqlalchemy import func, and_
from datetime import datetime, timezone
from data.functions.mantenimiento import crear_listado_flota_aceite, cambio_aceite

from models.desarrollo.hdr import HDR

ot_route = APIRouter(prefix="/ot")

conn:Session = Depends(get_db)

@ot_route.get('/control_aceite')
async def listado_control_aceite_flota(db=conn):
    result = crear_listado_flota_aceite(db)
    return result

@ot_route.put('/cambio_aceite')
async def cambio_aceite_flota(id:int,fecha:datetime,km:int,tipo_aceite:int,taller_id:int,credentials: JwtAuthorizationCredentials= Security(access_security),db=conn):
    user_flota = obtener_user_flota(credentials,db)
    result = cambio_aceite(id,fecha, km, tipo_aceite,taller_id,user_flota,db)
    return result

@ot_route.get('/ult_cambio_aceite/{id}')
async def ver_ult_aceite_flota(id:int,db=conn):
    flota = db.exec(select(Flota).where(Flota.flo_id == id)).first()
    query = select(HistoricoAceite).where(HistoricoAceite.hist_flota_patente == flota.flo_dom_tractor).order_by(HistoricoAceite.hist_aceite_fecha_cambio.desc())
    ult_cambio = db.exec(query).first()
    if ult_cambio:
        data = {
                "hist_flota_patente": ult_cambio.hist_flota_patente,
                "hist_aceite_fecha_cambio": ult_cambio.hist_aceite_fecha_cambio,
                "hist_tipo_aceite": ult_cambio.tipo_aceite.ta_nombre if ult_cambio.tipo_aceite else None,
                "hist_taller": ult_cambio.taller.taller_nombre if ult_cambio.taller else None,
                "hist_aceite_km": ult_cambio.hist_aceite_km,
                "hist_user_flota": ult_cambio.hist_user_flota
            }
    else:
        data = {
                "hist_flota_patente": None,
                "hist_aceite_fecha_cambio": None,
                "hist_tipo_aceite": None,
                "hist_taller": None,
                "hist_aceite_km": None,
                "hist_user_flota": None
            }
        
    return data

@ot_route.get('/')
async def leer_ots_admin(init: int = 0, limit: int = 10, fecha_desde: str = None, fecha_hasta: str = None, flo_dominio: str = None, ot_estado: str = None, db=conn):
    if init < 0 or limit <= 0:
        raise HTTPException(status_code=400, detail="init debe ser mayor o igual a 0 y limit debe ser mayor a 0")

    list_data = []
    total_result= 0
    cant_ot_programadas = 0
    cant_ot_taller = 0
    cant_ot_demoradas = 0
    cant_ot_cerradas = 0

    query = select(OT).select_from(OT)

    if fecha_desde:
        query = query.filter(and_(OT.ot_fecha >= fecha_desde))

    if fecha_hasta:
        fecha_hasta_fin_del_dia = fecha_hasta + " 23:59:59"
        query = query.filter(and_(OT.ot_fecha <= fecha_hasta_fin_del_dia))

    if flo_dominio:
        query = query.filter(OT.ot_patente.ilike(f"%{flo_dominio}%"))
    
    if ot_estado: 
        if ot_estado not in ["PROGRAMADO", "DEMORADO", "CERRADO","EN TALLER"]:
            raise ValueError("El estado proporcionado no es válido.")
        query = query.where(OT.ot_estado == ot_estado)


    total_result = db.exec(select(func.count()).select_from(query.alias())).one()

    query = query.offset(init).limit(limit)

    ots = db.exec(query).all()
    fecha = datetime.today()
    for ot in ots:
        if ot.ot_estado == "PROGRAMADO" and ot.ot_fecha >= fecha:
            ot.ot_estado == "EN TALLER"
            ot_novs = db.exec(select(OT_Nov).where(OT_Nov.ot_id == ot.ot_id)).all()
            for ot_nov in  ot_novs:
                novedad_ = db.exec(select(Novedad).where(Novedad.nov_id == ot_nov.nov_id)).first()
                novedad_.nov_estado = "ASIGNADA"
                db.commit()
            db.commit()
            db.refresh(ot)
        if ot.ot_fecha_taller >= fecha:
            ot.ot_estado == "DEMORADO"
            db.commit()
            db.refresh(ot)
        novedades = []
        ot_novs = db.exec(select(OT_Nov).where(OT_Nov.ot_id == ot.ot_id)).all()
        if len(ot_novs) > 0: 
            for ot_nov in ot_novs:
                novedades.append(ot_nov.novedad)
        data = {
            "ID_OT": ot.ot_id,
            "PATENTE": ot.ot_patente,
            "ESTADO": ot.ot_estado,
            "TALLER": ot.ot_taller,
            "NOVEDADES": novedades,
            "FECHA_LIMITE": ot.ot_fecha_taller,
            "FECHA_CREACION": ot.ot_fecha
        }
        if ot.ot_estado == "PROGRAMADO":cant_ot_programadas +=1 
        elif ot.ot_estado == "EN TALLER": cant_ot_taller +=1
        elif ot.ot_estado == "DEMORADO": cant_ot_demoradas +=1
        elif ot.ot_estado == "CERRADO": cant_ot_cerradas +=1
        list_data.append(data)
    
    return {
        "OT_NOV_LIST": list_data,
        "TOTAL": total_result,
        "CANT_PROGRAMADAS": cant_ot_programadas,
        "CANT_EN_TALLER": cant_ot_taller,
        "CANT_DEMORADAS": cant_ot_demoradas,
        "CANT_CERRADAS": cant_ot_cerradas
    }


@ot_route.get('/{ot_id}')
async def obtener_ot(ot_id: int, db=conn):
    ot = db.exec(select(OT).where(OT.ot_id == ot_id)).first()
    
    if ot is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la orden de trabajo para el ID {ot_id}")

    return ot

@ot_route.post('/',response_model=OT)
async def crear_ot(nuevo_ot:OTCreate, lista_nov: list[int] = Body(), db=conn):
    fecha_actual = datetime.now(timezone.utc)
    ot= OT(**dict(nuevo_ot))
    if ot.ot_fecha_taller.date() < fecha_actual.date():
        raise HTTPException(status_code=409, detail=f"La fecha de la OT debe ser mayor a la actual: {fecha_actual}")
    db.add(ot)
    db.commit()
    db.refresh(ot)
    ot_ = db.exec(select(OT).where(OT.ot_id == ot.ot_id)).first()
    for novedad in lista_nov:
        novedad_ = db.exec(select(Novedad).where(Novedad.nov_id == novedad)).first()
        if novedad_ is None:
            raise HTTPException(status_code=404, detail=f"No se encontró la novedad para el ID {novedad}, se cancela la creacion de la orden")
        novedad_.nov_estado = "ASIGNADA"
        ot_nov_c : OT_NovCreate = {"ot_id": ot_.ot_id,
                                    "nov_id": novedad,
                                    "cumplida": False, 
                                    "fecha": ot_.ot_fecha,
                                    "observaciones": "Sin observaciones"}
        ot_nov= OT_Nov(**dict(ot_nov_c))
        db.add(ot_nov)
        db.commit()
        
    return ot

@ot_route.delete('/novedad/{nov_id}')
async def eliminar_novedad_de_ot(nov_id: int, db=conn):
    ot_nov = db.exec(select(OT_Nov).where(OT_Nov.nov_id == nov_id)).first()
    ot = db.exec(select(OT).where(OT.ot_id == ot_nov.ot_id)).first()
    
    if ot_nov is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la orden de trabajo con para la novedad con ID {nov_id}")
    if ot.ot_estado == "CERRADO":
        raise HTTPException(status_code=409, detail=f"La orden de trabajo con ID {ot.ot_id} ya se encuentra cerrada y sus novedades no pueden ser eliminadas")
    nov = db.exec(select(Novedad).where(Novedad.nov_id == ot_nov.nov_id)).first()
    nov.nov_estado = "PENDIENTE"
    db.delete(ot_nov)
    db.commit()

@ot_route.delete('/{ot_id}')
async def eliminar_ot(ot_id: int, db=conn):
    sql = select(OT).where(OT.ot_id == ot_id)
    ot = db.exec(sql).first()
    if ot is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la orden de trabajo con ID {ot_id}")
    
    if ot.ot_estado == "CERRADO":
        raise HTTPException(status_code=409, detail=f"La orden de trabajo con ID {ot_id} ya se encuentra cerrada y no puede ser eliminada")
    ot_novs = db.exec(select(OT_Nov).where(OT_Nov.ot_id == ot_id)).all()
    if len(ot_novs) > 0:
        for ot_nov in ot_novs:
            nov = db.exec(select(Novedad).where(Novedad.nov_id == ot_nov.nov_id)).first()
            nov.nov_estado = "PENDIENTE"
            db.delete(ot_nov)
    db.delete(ot)
    db.commit()

    return {"mensaje": f"orden de trabajo con ID {ot_id} eliminada exitosamente"}


@ot_route.put('/{ot_id}', response_model=OT)
async def actualizar_ot_admin(ot_id:int, nueva_info_ot: OTCreate, db=conn):
    ot_existente = db.exec(select(OT).where(OT.ot_id == ot_id)).first()

    if ot_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la OT con ID {ot_id}")

    for key, value in nueva_info_ot.model_dump().items():
        setattr(ot_existente, key, value)

    db.commit()
    db.refresh(ot_existente)
    return ot_existente

@ot_route.put('/cambiar_estado/{ot_id}', response_model=OT)
async def actualizar_estado_ot_admin(ot_id:int, estado:str, fecha_taller:datetime = None,db=conn):
    ot_existente = db.exec(select(OT).where(OT.ot_id == ot_id)).first()

    if ot_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la OT con ID {ot_id}")
    if ot_existente.ot_estado == "CERRADO":
        raise HTTPException(status_code=409, detail=f"La orden de trabajo con ID {ot_id} ya se encuentra cerrada y no puede ser modificada")
    
    if estado == "PROGRAMADO":
        ot_existente.ot_estado = "PROGRAMADO"
        if fecha_taller:
            ot_existente.ot_fecha_taller = fecha_taller
            
    elif estado == "EN TALLER":
        ot_existente.ot_estado = "EN TALLER"
        if fecha_taller:
            ot_existente.ot_fecha_taller = fecha_taller
            ot_novs = db.exec(select(OT_Nov).where(OT_Nov.ot_id == ot_existente.ot_id)).all()
            for ot_nov in  ot_novs:
                novedad_ = db.exec(select(Novedad).where(Novedad.nov_id == ot_nov.nov_id)).first()
                novedad_.nov_estado = "ASIGNADA"
                db.commit()
    elif estado == "DEMORADO":
        ot_existente.ot_estado = "DEMORADO"
    elif estado == "CERRADO":
        ot_existente.ot_estado = "CERRADO"
        ot_novs = db.exec(select(OT_Nov).where(OT_Nov.ot_id == ot_existente.ot_id)).all()
        for ot_nov in  ot_novs:
            novedad_ = db.exec(select(Novedad).where(Novedad.nov_id == ot_nov.nov_id)).first()
            novedad_.nov_estado = "CERRADA"
            db.commit()
    else:
        raise HTTPException(status_code=404, detail=f"Estado invalido: {estado}")

    db.commit()
    db.refresh(ot_existente)
    return ot_existente