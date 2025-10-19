from fastapi import APIRouter, Depends,Body, HTTPException, Security
from sqlmodel import Session, select
from fastapi_jwt import JwtAuthorizationCredentials
from data.functions.security import access_security
from sqlalchemy import func, and_
from database import get_db
from models.desarrollo.otc import Otc
from models.desarrollo.otc_general import OtcGeneral, OtcGeneralCreate
from models.desarrollo.cubierta import Cubiertas
from models.desarrollo.estado import Estado
from models.desarrollo.historico import Historico
from datetime import datetime
from data.functions.check_cubiertas import checkear_cubiertas_en_flotas, checkear_posicion_cubierta

from models.desarrollo.marcas_modelos import MarcaModelo

otc_general_route = APIRouter(prefix="/otc_general")

conn:Session = Depends(get_db)


@otc_general_route.get('/')
async def obtener_otcs_generales(init: int = 0, limit: int = 10,numero_otc:int=None,proveedor_id:int=None,deposito_id:int=None,estado_id:int=None,fecha_desde: str = None, fecha_hasta: str = None,db=conn):
    if init < 0 or limit <= 0:
        raise HTTPException(status_code=400, detail="init debe ser mayor o igual a 0 y limit debe ser mayor a 0")

    list_otcs = []
    total_result= 0

    query = select(OtcGeneral).select_from(OtcGeneral)
    if numero_otc: query = query.filter(and_(OtcGeneral.id == numero_otc))

    if fecha_desde:query = query.filter(and_(OtcGeneral.otc_gen_fecha >= fecha_desde))
    if fecha_hasta:
        fecha_hasta_fin_del_dia = fecha_hasta + " 23:59:59"
        query = query.filter(and_(OtcGeneral.otc_gen_fecha <= fecha_hasta_fin_del_dia))

    if proveedor_id:query = query.filter(and_(OtcGeneral.otc_prov_id == proveedor_id))
    if deposito_id:query = query.filter(and_(OtcGeneral.otc_dep_id == deposito_id))
    if estado_id:query = query.filter(and_(OtcGeneral.otc_estado_id == estado_id))     
    
    total_result = db.exec(select(func.count()).select_from(query.alias())).one()

    query = query.offset(init).limit(limit)

    otc_generales = db.exec(query).all()
    
    for otc_g in otc_generales:
        otcs_asociadas = db.exec(select(Otc).where(Otc.otc_general_id == otc_g.id)).all()
        cant_cubiertas = sum(1 if otc.cubiertas else 0 for otc in otcs_asociadas)
        list_id_cubiertas = {otc.cubiertas.cub_nro_interno for otc in otcs_asociadas if otc.cubiertas}

        data = {"ID":otc_g.id,
                "FECHA":otc_g.otc_gen_fecha,
                "PROVEEDOR":otc_g.proveedores.prov_nombre,
                "DEPOSITO":otc_g.depositos.dep_nombre,
                "CANTIDAD DE CUBIERTAS":len(list_id_cubiertas),
                "CUBIERTAS_NROS_INTERNOS" : list(list_id_cubiertas),
                "CANTIDAD DE TRABAJOS":len(otcs_asociadas),
                "ESTADO":otc_g.estados.est_nombre,
                "OBSERVACION":otc_g.otc_gen_obs
                }
        list_otcs.append(data)
    return {
        "OTCS_LIST": list_otcs,
        "TOTAL": total_result,
    }

@otc_general_route.get('/{otc_id}')
async def obtener_otc_general(otc_id: int, db=conn):
    otc = db.exec(select(OtcGeneral).where(OtcGeneral.id == otc_id)).first()
    
    if otc is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la OTC para el ID {otc_id}")
    otcs_ = db.exec(select(Otc).where(Otc.otc_general_id == otc.id)).all()
    
    list_otcs = []
    for otc_ in otcs_:
        cubierta = db.exec(select(Cubiertas).where(Cubiertas.cub_id == otc_.cub_id)).first()
        data ={
            "ID":otc_.otc_id,
            "FECHA":otc_.otc_fecha,
            "CUBIERTA":cubierta.cub_nro_interno,
            "ESTADO":otc_.otc_estado,
            "TIPO": otc_.tipos.tt_nombre,
            "TRABAJO": otc_.trabajos.tra_nombre,
        }
        list_otcs.append(data)


    data_g={"ID":otc.id,
            "FECHA":otc.otc_gen_fecha,
            "PROVEEDOR":otc.proveedores.prov_nombre,
            "DEPOSITO":otc.depositos.dep_nombre,
            "ESTADO":otc.estados.est_nombre,
            "OBSERVACION":otc.otc_gen_obs}
    return {"OTC_GENERAL":data_g,
            "OTCS":list_otcs}

@otc_general_route.post('/',response_model=OtcGeneral)
async def crear_otc_general(nuevo_otc_general: OtcGeneralCreate, lista_otcs: list[int] = Body(), db=conn):
    try:
        with db.begin_nested():  
            otc_general = OtcGeneral(**dict(nuevo_otc_general))
            db.add(otc_general)
            db.flush() 
            
            for otc in lista_otcs:
                otc_ = db.exec(select(Otc).where(Otc.otc_id == otc)).first()
                cubierta = db.exec(select(Cubiertas).where(Cubiertas.cub_id == otc_.cub_id)).first()
                
                if cubierta is None:
                    raise HTTPException(status_code=404, detail=f"No se encontró la cubierta para el ID {otc_.cub_id}")
                
                patente = checkear_cubiertas_en_flotas(cubierta.cub_id, db)
                if patente is not None:
                    raise HTTPException(
                        status_code=409, 
                        detail=f"La cubierta con número interno: {cubierta.cub_nro_interno}, se encuentra en la patente: {patente}"
                    )
                
                otc_.otc_general_id = otc_general.id
                otc_.otc_estado = "PENDIENTE"

        db.commit()
        db.refresh(otc_general)
        return otc_general
    
    except HTTPException as e:
        db.rollback()
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Ocurrió un error inesperado")

@otc_general_route.delete('/{otc_id}')
async def eliminar_otc_general(otc_id: int, db=conn):
    sql = select(OtcGeneral).where(OtcGeneral.id == otc_id)
    otc_g = db.exec(sql).first()
    if otc_g is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la OTC con ID {otc_id}")

    if otc_g.estados.est_nombre == "Cerrado":
        raise HTTPException(status_code=400, detail=f"La OTC con ID {otc_id} ya ha sido cerrada")
    
    otcs_ = db.exec(select(Otc).where(Otc.otc_general_id == otc_g.id)).all()
    for otc in otcs_:
        otc.otc_general_id = None
        otc.otc_estado = "SIN ASIGNAR"

    db.delete(otc_g)
    db.commit()

    return {"mensaje": f"OTC con ID {otc_id} eliminada exitosamente"}

@otc_general_route.put('/{otc_id}', response_model=OtcGeneral)
async def actualizar_estado_otc_general_admin(otc_id:int, estado_id: int, db=conn):
    otc_general_existente = db.exec(select(OtcGeneral).where(OtcGeneral.id == otc_id)).first()

    if otc_general_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la otc general con ID {otc_id}")

    estado = db.exec(select(Estado).where(Estado.id == estado_id)).first()
    if estado is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el estado con ID {estado}")

    otc_general_existente.otc_estado_id = estado.id

    otcs_ = db.exec(select(Otc).where(Otc.otc_general_id == otc_general_existente.id)).all()
    for otc in otcs_:
        cubierta = db.exec(select(Cubiertas).where(Cubiertas.cub_id == otc.cub_id)).first()
        patente = checkear_cubiertas_en_flotas(cubierta.cub_id,db)
        posicion = checkear_posicion_cubierta(db,cubierta.cub_id)
        if estado.est_nombre == "Cerrado":
            otc.otc_estado = "CERRADA"

            if otc.otc_tipo == 1:
                
                recapado_historico = Historico(
                        his_cub_id = cubierta.cub_id,
                        his_fecha = datetime.today(),
                        his_km = cubierta.cub_km_recorridos ,
                        his_mm = 10,
                        his_accion = "RECAPADO",
                        his_valor= cubierta.cub_cant_recapados + 1,
                        his_deposito= cubierta.deposito.dep_nombre if patente == None else "Rodando",
                        his_tractor=patente if patente else "No ubicada",
                        his_posicion=posicion if posicion else "No ubicada",
                        his_observaciones = "Anterior MM = " + str(cubierta.cub_mm),
                    )
                cubierta.cub_mm = 10
                db.add(recapado_historico)
                cubierta.cub_cant_recapados += 1
                cubierta.cub_km_recorridos = 0
                db.commit()
            elif otc.otc_tipo == 2:
                recapado_historico = Historico(
                        his_cub_id = cubierta.cub_id,
                        his_fecha = datetime.today(),
                        his_km = cubierta.cub_km_recorridos,
                        his_mm = cubierta.cub_mm,
                        his_accion = "REPARACION",
                        his_deposito= cubierta.deposito.dep_nombre if patente == None else "Rodando",
                        his_tractor=patente if patente else "No ubicada",
                        his_posicion=posicion if posicion else "No ubicada",
                        his_observaciones = None,
                    )
                db.add(recapado_historico) 
                db.commit()
    db.commit()
    db.refresh(otc_general_existente)
    return otc_general_existente
