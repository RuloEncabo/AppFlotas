from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select
from fastapi_jwt import JwtAuthorizationCredentials
from data.functions.security import access_security
from sqlalchemy import func, and_
from database import get_db
from models.desarrollo.otc import Otc, OtcCreate
from models.desarrollo.cubierta import Cubiertas
from models.desarrollo.tipo_tratamiento import TipoTratamiento
from models.desarrollo.marcas_modelos import MarcaModelo
from data.functions.check_cubiertas import checkear_cubiertas_en_flotas

otc_route = APIRouter(prefix="/otc")

conn:Session = Depends(get_db)


@otc_route.get('/')
async def obtener_otcs(init: int = 0, limit: int = 10,tipo_id:int=None,modelo:str = None,estado:str=None,fecha_desde: str = None, fecha_hasta: str = None,db=conn):
    if init < 0 or limit <= 0:
        raise HTTPException(status_code=400, detail="init debe ser mayor o igual a 0 y limit debe ser mayor a 0")

    list_otcs = []
    total_result= 0

    query = select(Otc).select_from(Otc)

    if fecha_desde:query = query.filter(and_(Otc.otc_fecha >= fecha_desde))
    if fecha_hasta:
        fecha_hasta_fin_del_dia = fecha_hasta + " 23:59:59"
        query = query.filter(and_(Otc.otc_fecha <= fecha_hasta_fin_del_dia))

    if tipo_id:query = query.filter(and_(Otc.otc_tipo == tipo_id))   
    if estado: 
        if estado not in ["SIN ASIGNAR", "PENDIENTE", "CERRADA"]:
            raise ValueError("El estado proporcionado no es válido.")
        query = query.where(Otc.otc_estado == estado)


    
    total_result = db.exec(select(func.count()).select_from(query.alias())).one()

    query = query.offset(init).limit(limit)

    otcs = db.exec(query).all()
    nombre_modelo = None
    if modelo:
        nombre_modelo = db.exec(select(MarcaModelo).where(MarcaModelo.id == modelo)).first()
    for otc in otcs:
        if nombre_modelo and otc.cubiertas.cub_modelo.lower() != nombre_modelo.modelo.lower():
            total_result -= 1
            continue
        data = {"ID":otc.otc_id,
                "FECHA":otc.otc_fecha,
                "CUBIERTA_NRO_INTERNO":otc.cubiertas.cub_nro_interno,
                "MODELO":otc.cubiertas.cub_modelo,
                "MM": otc.cubiertas.cub_mm,
                "TIPO": otc.tipos.tt_nombre,
                "TRABAJO": otc.trabajos.tra_nombre,
                "ESTADO":otc.otc_estado}
        list_otcs.append(data)
    return {
        "OTCS_LIST": list_otcs,
        "TOTAL": total_result,
    }

@otc_route.get('/{otc_id}')
async def obtener_otc(otc_id: int, db=conn):
    otc = db.exec(select(Otc).where(Otc.otc_id == otc_id)).first()
    
    if otc is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la OTC para el ID {otc_id}")

    return otc

@otc_route.post('/',response_model=Otc)
async def crear_otc(nuevo_otc: OtcCreate, db=conn):
    # Validar la cubierta
    cubierta = db.exec(select(Cubiertas).where(Cubiertas.cub_id == nuevo_otc.cub_id)).first()
    
    if cubierta is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la cubierta para el ID {nuevo_otc.cub_id}")
    if cubierta.cub_estado in ("BAJA DEFINITIVA"):
        raise HTTPException(status_code=409, detail=f"La cubierta con ID {nuevo_otc.cub_id} se encuentra en estado BAJA DEFINITIVA")
    if cubierta.cub_estado in ("MOVIMIENTO INTERNO"):
        raise HTTPException(status_code=409, detail=f"La cubierta con ID {nuevo_otc.cub_id} se encuentra en estado MOVIMIENTO INTERNO")
    otc = db.exec(select(Otc).where(Otc.cub_id == cubierta.cub_id)).first()
    if otc is not None and otc.otc_estado != "CERRADA":
        raise HTTPException(status_code=409, detail=f"La cubierta con ID {nuevo_otc.cub_id} ya se encuentra asignada a una OTC")
    
    # Validar el tipo de tratamiento
    tipo_tratamiento = db.exec(select(TipoTratamiento).where(TipoTratamiento.id == nuevo_otc.otc_tipo)).first()
    
    if tipo_tratamiento is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el tipo de tratamiento para el ID {nuevo_otc.otc_tipo}")
    
    if tipo_tratamiento.tt_nombre.upper() == "RECAPADO" and cubierta.cub_estado != "ACTIVA":
        raise HTTPException(
            status_code=400, 
            detail=f"No se puede asignar el tratamiento '{tipo_tratamiento.tt_nombre}' a una cubierta con estado '{cubierta.cub_estado}'"
        )
    patente = checkear_cubiertas_en_flotas(cubierta.cub_id,db)
    if patente != None:
        raise HTTPException(status_code=400, detail=f"La cubierta con ID {cubierta.cub_id} se encuentra la flota con patente {patente}")
    # Crear la OTC
    otc = Otc(**dict(nuevo_otc))
    db.add(otc)
    db.commit()

    return otc


@otc_route.delete('/{otc_id}')
async def eliminar_otc(otc_id: int, db=conn):
    sql = select(Otc).where(Otc.otc_id == otc_id)
    otc = db.exec(sql).first()
    if otc is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la OTC con ID {otc_id}")

    db.delete(otc)
    db.commit()

    return {"mensaje": f"OTC con ID {otc_id} eliminada exitosamente"}

@otc_route.put('/estado/{otc_id}', response_model=Otc)
async def actualizar_estado_otc_admin(otc_id:int, estado: str, db=conn):
    otc_existente = db.exec(select(Otc).where(Otc.otc_id == otc_id)).first()

    if otc_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la otc con ID {otc_id}")

    if estado not in ("SIN ASIGNAR","PENDIENTE","CERRADA"):
        raise HTTPException(status_code=400, detail=f"El estado {estado} no es válido")
    if estado == "SIN ASIGNAR":
        otc_existente.otc_general_id = None
    otc_existente.otc_estado = estado

    db.commit()
    db.refresh(otc_existente)
    return otc_existente

@otc_route.put('/{ot_id}', response_model=Otc)
async def actualizar_otc_admin(otc_id:int, nueva_info_otc: OtcCreate, db=conn):
    otc_existente = db.exec(select(Otc).where(Otc.otc_id == otc_id)).first()

    if otc_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la OTC con ID {otc_id}")

    for key, value in nueva_info_otc.model_dump().items():
        setattr(otc_existente, key, value)

    db.commit()
    db.refresh(otc_existente)
    return otc_existente