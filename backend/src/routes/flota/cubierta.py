
from fastapi import APIRouter, Body, Depends, HTTPException, Security
from sqlmodel import Session, select, SQLModel
from fastapi_jwt import JwtAuthorizationCredentials
from data.functions.security import access_security
from datetime import datetime
from datetime import date
from database import get_db
from models.desarrollo.cubierta import Cubiertas, CubiertasCreate
from sqlalchemy import func, and_
from data.functions.check_cubiertas import checkear_cubiertas_en_flotas

from models.desarrollo.flo_cub_pos import FloCubPos
from models.desarrollo.historico import Historico


cubierta_route = APIRouter(prefix="/cubierta")

conn:Session = Depends(get_db)

@cubierta_route.get('/')
async def leer_cubiertas_admin(init: int = 0, limit: int = 10, numero_interno: int = None, fecha_desde: str = None, fecha_hasta: str = None, cub_modelo: str = None, cub_marca: str = None,estado: str = None,deposito: int = None,filtro_deposito: bool = None, columname: str = "cub_fecha_alta", order: bool = False,db=conn):
    if init < 0 or limit <= 0:
        raise HTTPException(status_code=400, detail="init debe ser mayor o igual a 0 y limit debe ser mayor a 0")

    total_result = 0
    query = select(Cubiertas).select_from(Cubiertas)

    if fecha_desde:
        query = query.filter(Cubiertas.cub_fecha_alta >= fecha_desde)
    if fecha_hasta:
        fecha_hasta_fin_del_dia = fecha_hasta + " 23:59:59"
        query = query.filter(Cubiertas.cub_fecha_alta <= fecha_hasta_fin_del_dia)

    if estado:
        if estado not in ["ACTIVA", "BAJA", "BAJA DEFINITIVA", "MOVIMIENTO INTERNO"]:
            raise HTTPException(status_code=400, detail="El estado proporcionado no es válido.")
        query = query.where(Cubiertas.cub_estado == estado)

    if filtro_deposito is not None:
        cubiertas_ocupadas = db.exec(select(FloCubPos)).all()
        cubiertas_ocupadas_ids = [cub.cub_id for cub in cubiertas_ocupadas]
        if filtro_deposito:
            query = query.where(~Cubiertas.cub_id.in_(cubiertas_ocupadas_ids))
        else:
            query = query.where(Cubiertas.cub_id.in_(cubiertas_ocupadas_ids))
    
    if deposito:
        query = query.where(Cubiertas.cub_id_dep == deposito)
    if numero_interno:
        query = query.where(Cubiertas.cub_nro_interno == numero_interno)
    if cub_modelo:
        query = query.where(Cubiertas.cub_modelo.ilike(f"%{cub_modelo}%"))
    if cub_marca:
        query = query.where(Cubiertas.cub_marca.ilike(f"%{cub_marca}%"))

    total_result = db.exec(select(func.count()).select_from(query.alias())).one()

    query = query.offset(init).limit(limit)
    cubiertas = db.exec(query).all()
    
    list_cubiertas = []
    for cubierta in cubiertas:
        data = {
            "CUBIERTA": cubierta,
            "KM_ROTAR": (cubierta.cub_pos_actual),
            "DEPOSITO": cubierta.deposito.dep_nombre
        }
        list_cubiertas.append(data)
    
    columnas_orden = {
        "cub_fecha_alta": lambda x: x["CUBIERTA"].cub_fecha_alta,
        "cub_nro_interno": lambda x: x["CUBIERTA"].cub_nro_interno,
        "cub_km_recorridos": lambda x: x["CUBIERTA"].cub_km_recorridos,
        "cub_km_totales": lambda x: x["CUBIERTA"].cub_km_totales,
        "KM_ROTAR": lambda x: x["KM_ROTAR"],
        "DEPOSITO": lambda x: x["DEPOSITO"],
        "cub_modelo": lambda x: x["CUBIERTA"].cub_modelo,
        "cub_marca": lambda x: x["CUBIERTA"].cub_marca,
        "cub_mm": lambda x: x["CUBIERTA"].cub_mm,
        "cub_medida": lambda x: x["CUBIERTA"].cub_medida,
        "cub_cant_recapados": lambda x: x["CUBIERTA"].cub_cant_recapados,
        "cub_motivo": lambda x: x["CUBIERTA"].cub_motivo,
        "cub_observaciones": lambda x: x["CUBIERTA"].cub_observaciones
    }

    if columname in columnas_orden:
        list_cubiertas.sort(
            key=columnas_orden[columname],
            reverse=order 
        )

    return {
        "CUB_LIST": list_cubiertas,
        "TOTAL": total_result,
    }


@cubierta_route.get('/{cubierta_id}')
async def obtener_cubierta(cubierta_id: int, db=conn):
    cubierta = db.exec(select(Cubiertas).where(Cubiertas.cub_id == cubierta_id)).first()
    
    if cubierta is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la cubierta para el ID {cubierta_id}")

    data = {"CUBIERTA":cubierta,
            "DEPOSITO": cubierta.deposito.dep_nombre}
    return data

@cubierta_route.get('/nro_interno/{nro_interno}')
async def obtener_cubierta_nro_interno(nro_interno: int, db=conn):
    cubierta = db.exec(select(Cubiertas).where(Cubiertas.cub_nro_interno == nro_interno)).first()

    if cubierta is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la cubierta para el Nro interno {nro_interno}")

    patente = checkear_cubiertas_en_flotas(cubierta.cub_id,db)
    data = {"CUBIERTA":cubierta,
            "DEPOSITO": cubierta.deposito.dep_nombre if patente == None else "Rodando",
            "PATENTE":patente}
    return data

@cubierta_route.post('/',response_model=Cubiertas)
async def crear_cubierta(nueva_cubierta:CubiertasCreate, db=conn):
    cubierta_rep = db.exec(select(Cubiertas).where(Cubiertas.cub_nro_interno == nueva_cubierta.cub_nro_interno)).first()
    if cubierta_rep:raise HTTPException(status_code=409, detail=f"Ya existe una cubierta para el Nro interno {nueva_cubierta.cub_nro_interno}")
    cubierta= Cubiertas(**dict(nueva_cubierta))
    db.add(cubierta)
    db.commit()
    db.refresh(cubierta)
    
    alta_historico = Historico(
            his_cub_id = cubierta.cub_id,
            his_fecha = datetime.today(),
            his_km = cubierta.cub_km_recorridos,
            his_mm= cubierta.cub_mm,
            his_accion = "ALTA",
            his_valor = cubierta.cub_mm,
            his_deposito= cubierta.deposito.dep_nombre,
            his_tractor='No Ubicada',
            his_posicion='No Ubicada',
            his_observaciones = None,
        )
    db.add(alta_historico)
    db.commit()
    return cubierta

class CubAltaBaja(SQLModel):
    cub_estado:str
    cub_motivo:str
    cub_observaciones:str
    cub_id_dep:int
    cub_imgs:str
    cub_fecha_baja:date = None

@cubierta_route.put('/modif_alta_baja/{nro_interno}', response_model=Cubiertas)
async def modif_alta_baja_cubierta_admin(nro_interno:int, cubAltaBaja:CubAltaBaja, db=conn):
    cubierta_existente: Cubiertas = db.exec(select(Cubiertas).where(Cubiertas.cub_nro_interno == nro_interno)).first()

    if cubierta_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la Cubierta con Nro interno {nro_interno}")

    cub_en_posicion: FloCubPos = db.exec(select(FloCubPos).where(FloCubPos.cub_id == cubierta_existente.cub_id)).first()
    if cub_en_posicion:
        raise HTTPException(status_code=409, detail=f"La cubierta con Nro interno {nro_interno} ya se encuentra ubicada en una flota")
    if cubAltaBaja.cub_estado in ("ACTIVA","BAJA","MOVIMIENTO INTERNO"):
        cubierta_existente.cub_estado = cubAltaBaja.cub_estado
        cubierta_existente.cub_motivo = cubAltaBaja.cub_motivo
        cubierta_existente.cub_observaciones = cubAltaBaja.cub_observaciones
        cubierta_existente.cub_imgs = cubAltaBaja.cub_imgs
        cubierta_existente.cub_id_dep = cubAltaBaja.cub_id_dep
    
        
        db.commit()
        db.refresh(cubierta_existente)

    else: HTTPException(status_code=409, detail=f"Estado debe ser igual ACTIVA, BAJA o MOVIMIENTO INTERNO")
    if cubAltaBaja.cub_estado == "MOVIMIENTO INTERNO":
        if cubAltaBaja.cub_fecha_baja: cubierta_existente.cub_fecha_baja = cubAltaBaja.cub_fecha_baja
        movimiento_historico = Historico(
            his_cub_id = cubierta_existente.cub_id,
            his_fecha = datetime.today(),
            his_km = cubierta_existente.cub_km_recorridos,
            his_mm= cubierta_existente.cub_mm,
            his_accion = "MOVIMIENTO INTERNO",
            his_deposito= cubierta_existente.deposito.dep_nombre,
            his_tractor='No Ubicada',
            his_posicion='No Ubicada',
            his_observaciones = None,
        )
        db.add(movimiento_historico)
    if cubAltaBaja.cub_estado == "ACTIVA":
        alta_historico = Historico(
            his_cub_id = cubierta_existente.cub_id,
            his_fecha = datetime.today(),
            his_km = cubierta_existente.cub_km_recorridos,
            his_mm= cubierta_existente.cub_mm,
            his_accion = "ALTA",
            his_deposito= cubierta_existente.deposito.dep_nombre,
            his_tractor='No Ubicada',
            his_posicion='No Ubicada',
            his_observaciones = None,
        )
        db.add(alta_historico)
    if cubAltaBaja.cub_estado == "BAJA":
        if cubAltaBaja.cub_fecha_baja: cubierta_existente.cub_fecha_baja = cubAltaBaja.cub_fecha_baja
        baja_historico = Historico(
            his_cub_id = cubierta_existente.cub_id,
            his_fecha = datetime.today(),
            his_km = cubierta_existente.cub_km_recorridos,
            his_mm= cubierta_existente.cub_mm,
            his_accion = "BAJA",
            his_deposito= cubierta_existente.deposito.dep_nombre,
            his_tractor='No Ubicada',
            his_posicion='No Ubicada',
            his_observaciones = None,
        )
        db.add(baja_historico)
    
    
    db.commit()
    db.refresh(cubierta_existente)
    return cubierta_existente

class CubBajaDef(SQLModel):
    cub_motivo:str
    cub_imgs:str

@cubierta_route.put('/modif_baja_def/{cub_id}', response_model=str) 
async def modif_baja_def_cubierta_admin(cub_id:int,cubierta_baja_def:CubBajaDef, db=conn):
    cubierta_existente = db.exec(select(Cubiertas).where(Cubiertas.cub_id == cub_id)).first()
    if cubierta_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la Cubierta con id {cub_id}")
    cubierta_existente.cub_motivo = cubierta_baja_def.cub_motivo
    cubierta_existente.cub_imgs = cubierta_baja_def.cub_imgs
    cubierta_existente.cub_estado = "BAJA DEFINITIVA"
    cubierta_existente.cub_fecha_baja =  datetime.today()

    definitiva_historico = Historico(
                his_cub_id = cubierta_existente.cub_id,
                his_fecha = datetime.today(),
                his_km = cubierta_existente.cub_km_recorridos,
                his_mm= cubierta_existente.cub_mm,
                his_accion = "DEFINITIVA",
                his_deposito= cubierta_existente.deposito.dep_nombre,
                his_tractor='No Ubicada',
                his_posicion='No Ubicada',
                his_observaciones = None,
            )
    db.add(definitiva_historico)

    db.commit()
    return f"Cubierta {cubierta_existente.cub_id} dadas de baja correctamente"

@cubierta_route.delete('/{cubierta_id}')
async def eliminar_cubierta(cubierta_id: int, db=conn):
    sql = select(Cubiertas).where(Cubiertas.cub_id == cubierta_id)
    cubierta = db.exec(sql).first()
    if cubierta is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la cubierta con ID {cubierta_id}")
    
    return {"mensaje": f"Cubierta con ID {cubierta_id} eliminada exitosamente"}


@cubierta_route.put('/{cubierta_id}', response_model=Cubiertas)
async def actualizar_cubierta_admin(cubierta_id:int, nueva_info_cubierta: CubiertasCreate, db=conn):
    cubierta_existente = db.exec(select(Cubiertas).where(Cubiertas.cub_id == cubierta_id)).first()

    if cubierta_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la Cubierta con ID {cubierta_id}")

    for key, value in nueva_info_cubierta.model_dump().items():
        setattr(cubierta_existente, key, value)

    db.commit()
    db.refresh(cubierta_existente)
    return cubierta_existente


