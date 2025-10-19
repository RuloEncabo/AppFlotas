from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select
from fastapi_jwt import JwtAuthorizationCredentials
from datetime import datetime
from database import get_db
from models.desarrollo.novedad import Novedad, NovedadCreate
from models.desarrollo.hdr import HDR
from models.desarrollo.flota import Flota
from models.desarrollo.cat_nov import CatNovedad
from data.functions.security import access_security, obtener_chofer
from typing import Optional, List
from ..seguridad.auth import Usuario
from sqlalchemy import func, and_
from models.desarrollo.ot_nov import OT_Nov 

novedad_admin_route = APIRouter(prefix="/novedad_admin")

conn:Session = Depends(get_db)

@novedad_admin_route.get('/')
async def leer_novedades_admin(init: int = 0, limit: int = 10, fecha_desde: str = None, fecha_hasta: str = None, flo_dominio: str = None, flo_nombre: str = None, nov_estado: str = None, cat_nombre: str = None,columname: str = "nov_id",order: bool = False, db=conn):
    if init < 0 or limit <= 0:
        raise HTTPException(status_code=400, detail="init debe ser mayor o igual a 0 y limit debe ser mayor a 0")

    list_data = []
    cant_pendientes = 0
    cant_cerradas = 0
    cant_asignadas = 0

    query = select(Novedad, Flota, CatNovedad).select_from(Novedad).join(HDR).join(Flota).join(CatNovedad)

    if fecha_desde:
        query = query.filter(Novedad.nov_fecha >= fecha_desde)

    if fecha_hasta:
        fecha_hasta_fin_del_dia = fecha_hasta + " 23:59:59"
        query = query.filter(Novedad.nov_fecha <= fecha_hasta_fin_del_dia)

    if flo_dominio:
        flotas = db.exec(select(Flota).where(Flota.flo_dom_tractor.ilike(f"%{flo_dominio}%"))).all()
        if flotas:
            flo_ids = [flota.flo_id for flota in flotas]
            query = query.filter(HDR.hdr_flota_id.in_(flo_ids))
        else:
            return {
                "NOV_LIST": list_data,
                "TOTAL": 0,
                "CANT_PENDIENTES": cant_pendientes,
                "CANT_ASIGNADAS": cant_asignadas,
                "CANT_CERRADAS": cant_cerradas
            }

    if flo_nombre:
        flotas = db.exec(select(Flota).where(Flota.flo_nombre.ilike(f"%{flo_nombre}%"))).all()
        if flotas:
            flo_ids = [flota.flo_id for flota in flotas]
            query = query.filter(HDR.hdr_flota_id.in_(flo_ids))
        else:
            return {
                "NOV_LIST": list_data,
                "TOTAL": 0,
                "CANT_PENDIENTES": cant_pendientes,
                "CANT_ASIGNADAS": cant_asignadas,
                "CANT_CERRADAS": cant_cerradas
            }

    if nov_estado and nov_estado.upper() in ("PENDIENTE", "RESUELTA", "ASIGNADA", "ATENDIDA", "CERRADA"):
        query = query.where(Novedad.nov_estado == nov_estado.upper())

    if cat_nombre:
        query = query.where(CatNovedad.cn_nombre.ilike(f"%{cat_nombre}%"))

    total_result = db.exec(select(func.count()).select_from(query.alias())).one()

    novedades = db.exec(query).all()

    flotas_ocupadas = obtener_flotas_ocupadas(db)

    for novedad, flota, categoria in novedades:
        hdr = db.exec(select(HDR).where(HDR.hdr_id == novedad.nov_hdr_id)).first()
        data = {
            "NOVEDAD": novedad.model_dump(),
            "CATEGORIA": categoria.model_dump(),
            "PATENTE": flota.flo_dom_tractor,
            "DISPONIBILIDAD": "En Ruta" if flota.flo_id in flotas_ocupadas else "Libre",
            "NOMBRE": flota.flo_nombre,
            "CHOFER": hdr.chofer.user.usr_nombre + " " + hdr.chofer.user.usr_apellido
        }
        if novedad.nov_estado == "PENDIENTE":
            cant_pendientes += 1
        elif novedad.nov_estado == "CERRADA":
            cant_cerradas += 1
        elif novedad.nov_estado == "ASIGNADA":
            cant_asignadas += 1
        list_data.append(data)

    column_mapping = {
        "nov_fecha": lambda x: x["NOVEDAD"]["nov_fecha"],
        "ID_NOVEDAD": lambda x: x["NOVEDAD"]["nov_id"],
        "ID_HDR": lambda x: x["NOVEDAD"]["nov_hdr_id"],
        "NOMBRE_FLOTA": lambda x: x["NOMBRE"],
        "PATENTE": lambda x: x["PATENTE"],
        "NOV_OBSERVACIONES": lambda x: x["NOVEDAD"]["nov_observaciones"],
        "CHOFER": lambda x: x["CHOFER"],
        "CATEGORIA": lambda x: x["CATEGORIA"]["cn_nombre"],
        "ESTADO": lambda x: x["NOVEDAD"]["nov_estado"]
    }

    if columname in column_mapping:
        list_data = sorted(
            list_data,
            key=column_mapping[columname],
            reverse=order
        )

    paginated_data = list_data[init:init + limit]

    return {
        "NOV_LIST": paginated_data,
        "TOTAL": total_result,
        "CANT_PENDIENTES": cant_pendientes,
        "CANT_ASIGNADAS": cant_asignadas,
        "CANT_CERRADAS": cant_cerradas
    }




def obtener_flotas_ocupadas(db):
    subquery = select(HDR.hdr_flota_id).where(HDR.hdr_active == True).distinct()
    subquery_result = db.exec(subquery).all()
    flotas_ocupadas_ids = []
    if subquery_result:
        for result in subquery_result:
            if result != None: flotas_ocupadas_ids.append(result)
    return flotas_ocupadas_ids

@novedad_admin_route.get('/{nov_id}')
async def leer_novedad_admin(nov_id: int, db=conn):
    sql = select(Novedad, HDR, Flota, CatNovedad).select_from(Novedad).join(HDR).join(Flota).join(CatNovedad).where(Novedad.nov_id == nov_id)
    result = db.exec(sql).first()
    if result:
        novedad, hdr, flota, categoria = result
    else:
        raise HTTPException(status_code=404, detail=f"No se encontró la novedad con id: {nov_id}")

    data = {
            "NOVEDAD": novedad.model_dump(),
            "FLOTA": flota.flo_nombre,
            "PATENTE": flota.flo_dom_tractor,
            "CATEGORIA": categoria.cn_nombre,
            "HDR": hdr.hdr_id
        }
    
    return data

#CRUDS NOVEDADES

@novedad_admin_route.delete('/{novedad_id}')
async def eliminar_novedad_admin(novedad_id: int, db=conn):
    sql = select(Novedad).where(Novedad.nov_id == novedad_id)
    novedad = db.exec(sql).first()
    if novedad is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la novedad con ID {novedad_id}")

    db.delete(novedad)
    db.commit()

    return {"mensaje": f"Novedad con ID {novedad_id} eliminada exitosamente"}

@novedad_admin_route.post('/',response_model=Novedad)
async def crear_novedad_admin(nueva_novedad:NovedadCreate, db=conn):
    novedad=Novedad(**dict(nueva_novedad))
    db.add(novedad)
    db.commit()
    db.refresh(novedad)
    return novedad


@novedad_admin_route.put('/{novedad_id}', response_model=Novedad)
async def actualizar_novedad_admin(novedad_id:int, nueva_info_novedad: NovedadCreate, db=conn):
    novedad_existente = db.exec(select(Novedad).where(Novedad.nov_id == novedad_id)).first()

    if novedad_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la novedad con ID {novedad_id}")
    
    ot_existente = db.exec(select(OT_Nov).where(OT_Nov.nov_id == novedad_id)).first()
    if ot_existente is not None:
        raise HTTPException(status_code=409, detail=f"La novedad con ID {novedad_id} ya se encuentra asignada a una orden de trabajo")
    
    for key, value in nueva_info_novedad.model_dump().items():
        setattr(novedad_existente, key, value)

    db.commit()
    db.refresh(novedad_existente)
    return novedad_existente