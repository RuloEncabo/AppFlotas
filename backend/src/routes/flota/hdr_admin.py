from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select
from fastapi_jwt import JwtAuthorizationCredentials
from datetime import datetime, timedelta
from data.functions.security import access_security, obtener_user_flota
from typing import Optional, List
from sqlalchemy import func, and_, or_
from operator import attrgetter
from sqlalchemy.orm import selectinload

from database import get_db
from models.desarrollo.hdr import HDR, HDRCreate
from models.desarrollo.chofer import Chofer
from models.desarrollo.flota import Flota
from models.desarrollo.viatico import Viatico
from models.desarrollo.tipo_viatico import TipoViatico
from models.desarrollo.movimiento import Movimiento
from models.desarrollo.carga_combustible import Carga
from models.desarrollo.novedad import Novedad
from models.desarrollo.cat_nov import CatNovedad
from models.desarrollo.gasto import Gasto
from ..seguridad.auth import Usuario
from data.functions.consumo import calcular_consumo_combustible


hdr_admin_route = APIRouter(prefix="/hdr_admin")

conn:Session = Depends(get_db)

@hdr_admin_route.get('/')
async def leer_hojas_de_ruta_admin(init: int = 0, limit: int = 10, fecha_desde: str = None, fecha_hasta: str = None, chofer_name: str = None, flo_dominio: str = None, hdr_activa: bool = None, hdr_rendida: bool = None, columname: str = "HDR_ID",order: bool = False,db=conn):
    if init < 0 or limit <= 0:
        raise HTTPException(status_code=400, detail="init debe ser mayor o igual a 0 y limit debe ser mayor a 0")
    query = select(HDR)
    count_query = select(func.count()).select_from(HDR)

    # Filtros
    if fecha_desde:
        query = query.filter(and_(HDR.hdr_carga >= fecha_desde))
        count_query = count_query.filter(and_(HDR.hdr_carga >= fecha_desde))

    if fecha_hasta:
        fecha_hasta_fin_del_dia = fecha_hasta + " 23:59:59"
        query = query.filter(and_(HDR.hdr_carga <= fecha_hasta_fin_del_dia))
        count_query = count_query.filter(and_(HDR.hdr_carga <= fecha_hasta_fin_del_dia))

    if hdr_activa is not None:
        query = query.where(HDR.hdr_active == hdr_activa)
        count_query = count_query.where(HDR.hdr_active == hdr_activa)

    if hdr_rendida is not None:
        query = query.where(HDR.hdr_rendida == hdr_rendida)
        count_query = count_query.where(HDR.hdr_rendida == hdr_rendida)

    if chofer_name:
        nombre_apellido = chofer_name.split()
        if len(nombre_apellido) == 1:
            usuarios = db.exec(select(Usuario).where(or_(
                Usuario.usr_nombre.ilike(f"%{chofer_name}%"), 
                Usuario.usr_apellido.ilike(f"%{chofer_name}%")
            ))).all()
        else:
            nombre, apellido = nombre_apellido[0], nombre_apellido[1]
            usuarios = db.exec(select(Usuario).where(and_(
                or_(Usuario.usr_nombre.ilike(f"%{nombre}%"), Usuario.usr_apellido.ilike(f"%{apellido}%")),
                or_(Usuario.usr_apellido.ilike(f"%{nombre}%"), Usuario.usr_apellido.ilike(f"%{apellido}%"))
            ))).all()
        
        if usuarios:
            chofer_ids = [usuario.chofer.chofer_id for usuario in usuarios if usuario and usuario.chofer]
            query = query.filter(HDR.hdr_chofer_id.in_(chofer_ids))
            count_query = count_query.filter(HDR.hdr_chofer_id.in_(chofer_ids))
        else:
            return {"HDR_LIST": [], "TOTAL": 0}

    if flo_dominio:
        flotas = db.exec(select(Flota).where(Flota.flo_dom_tractor.ilike(f"%{flo_dominio}%"))).all()
        if flotas:
            flo_ids = [flota.flo_id for flota in flotas]
            query = query.filter(HDR.hdr_flota_id.in_(flo_ids))
            count_query = count_query.filter(HDR.hdr_flota_id.in_(flo_ids))
        else:
            return {"HDR_LIST": [], "TOTAL": 0}

    total_result = db.scalar(count_query)
    
    hdrs = db.exec(query.options(selectinload(HDR.chofer).selectinload(Chofer.user), selectinload(HDR.flota))).all()

    list_data = []
    for hdr in hdrs:
        km_recorridos, lleva_carga, consumo, total_cargado, ratio_consumo, estado_consumo, tiempo_inactivo, monto_gastos, adelantos = obtener_totales(hdr, db)
        data = {
            "HDR": hdr,
            "CHOFER": hdr.chofer.user.usr_nombre + " " + hdr.chofer.user.usr_apellido,
            "PATENTE": hdr.flota.flo_dom_tractor,
            "FLOTA": hdr.flota.flo_nombre,
            "LLEVA_CARGA": lleva_carga,
            "KM ODO": km_recorridos if hdr.hdr_active else hdr.flota.flo_km_odo,
            "TOTAL KM": (km_recorridos - hdr.flota.flo_km_odo) if hdr.hdr_active else km_recorridos,
            "TOTAL CARGADO": total_cargado,
            "CONSUMO": consumo,
            "RATIO CONSUMO": ratio_consumo,
            "ESTADO CONSUMO": estado_consumo,
            "TIEMPO INACTIVO": tiempo_inactivo if hdr.hdr_active else "No Aplica",
            "TOTAL GASTOS": monto_gastos,
            "TOTAL VIATICOS": adelantos["total_adelantos"],
            "TOTAL VIATICOS NAC": adelantos["total_via_nac"],
            "TOTAL VIATICOS PLUS": adelantos["total_via_plus"],
            "HDR_ID": hdr.hdr_id
        }
        list_data.append(data)

    list_data = sorted(
        list_data,
        key=lambda x: x.get(columname, x["HDR_ID"]),
        reverse=order
    )
    list_data_paginated = list_data[init:init + limit]

    return {
        "HDR_LIST": list_data_paginated,
        "TOTAL": total_result
    }

def obtener_totales(hdr, db):
    total_km_hdr = 0
    lleva_carga=False
    consumo = 0
    monto_gastos = 0
    ad=0
    nac=0
    plus=0
    adelanto=0
    nacional=0
    intern=0
    movimientos_query = select(Movimiento).where(Movimiento.mov_hdr_id == hdr.hdr_id).order_by(Movimiento.mov_fin.desc())
    novedades = db.exec(select(Novedad).where(Novedad.nov_hdr_id == hdr.hdr_id)).all()
    cargas = db.exec(select(Carga).where(Carga.car_hdr_id == hdr.hdr_id)).all()
    gastos = db.exec(select(Gasto).where(Gasto.gas_hdr_id == hdr.hdr_id)).all()
    tipo_vi = db.exec(select(TipoViatico)).all()
    viaticos= db.exec(select(Viatico).where(Viatico.vi_hdr_id == hdr.hdr_id)).all()
    movimientos = db.exec(movimientos_query).all()
    ultimo_timestamp = None
    if hdr.hdr_active == True:
        km_recorridos = 0
        if len(cargas) > 0:
            for carga in cargas:
                if carga.car_km_odo > km_recorridos: km_recorridos = carga.car_km_odo
                if not ultimo_timestamp or carga.car_fecha > ultimo_timestamp: ultimo_timestamp = carga.car_fecha
        
        if len(novedades) > 0:
            for novedad in novedades:
                if novedad.nov_km_odo > km_recorridos: km_recorridos = novedad.nov_km_odo
                if not ultimo_timestamp or novedad.nov_fecha > ultimo_timestamp: ultimo_timestamp = novedad.nov_fecha

        if len(movimientos) > 0:
            for index, movimiento in enumerate(movimientos):
                if movimiento.mov_km_odo_inicio > km_recorridos: km_recorridos = movimiento.mov_km_odo_inicio
                if not ultimo_timestamp or movimiento.mov_inicio > ultimo_timestamp: ultimo_timestamp = movimiento.mov_inicio
                if movimiento.mov_km_odo_fin:
                    if movimiento.mov_km_odo_fin > km_recorridos: km_recorridos = movimiento.mov_km_odo_fin
                    if not ultimo_timestamp or movimiento.mov_fin > ultimo_timestamp: ultimo_timestamp = movimiento.mov_fin
                if index == 0: lleva_carga = movimiento.mov_lleva_carga
        if ultimo_timestamp:
            ultimo_timestamp = (datetime.now() - ultimo_timestamp).total_seconds()
            horas = int(ultimo_timestamp // 3600)
            minutos = int((ultimo_timestamp % 3600) // 60)
            ultimo_timestamp = f"{horas}H {minutos}Min"
    else:
        km_recorridos = 0
        for index, movimiento in enumerate(movimientos):
                km_recorridos += (movimiento.mov_km_odo_fin - movimiento.mov_km_odo_inicio) 
                if index == 0: lleva_carga = movimiento.mov_lleva_carga

    if len(gastos) > 0:
        for gasto in gastos:
            monto_gastos += gasto.gas_monto

    for ti in tipo_vi:
        if ti.tv_des == "ad": ad=ti.id
        if ti.tv_des == "via": nac=ti.id
        if ti.tv_des == "plus": plus=ti.id

    for viatico in viaticos:
        if viatico.vi_tipo==ad : adelanto+=viatico.vi_monto
        if viatico.vi_tipo==nac : nacional+=viatico.vi_monto
        if viatico.vi_tipo==plus : intern+=viatico.vi_monto

    total_via ={
        "total_adelantos":adelanto,
        "total_via_nac":nacional,
        "total_via_plus":intern
    }
    response=calcular_consumo_combustible(hdr,db)
    consumo=response["consumo"]
    total_cargado=response["total_cargado"] 
    ratio_consumo=response["ratio_consumo"]
    total_km_hdr=response["distancia"]
    
    estado_consumo = "rojo" if ratio_consumo > 0.4 else ("amarillo" if ratio_consumo>0.37 else "verde")
        
    return km_recorridos, lleva_carga, consumo , total_cargado , ratio_consumo, estado_consumo, ultimo_timestamp, monto_gastos, total_via



@hdr_admin_route.get('/{hdr_id}')
async def leer_hdr_admin(hdr_id: int, db=conn):
    statement = select(HDR).where(HDR.hdr_id == hdr_id)
    hoja_de_ruta = db.exec(statement).first()
    
    if hoja_de_ruta is None:
        return hoja_de_ruta
    
    data = {
        "hoja_de_ruta": hoja_de_ruta,
        "batea": hoja_de_ruta.batea.bat_dominio,
        "destino":{"nombre": hoja_de_ruta.destino.des_nombre, "tipo": hoja_de_ruta.destino.tipo_destino.td_nombre},
        "flota": {"nombre":hoja_de_ruta.flota.flo_nombre ,"dominio": hoja_de_ruta.flota.flo_dom_tractor, "odometro": hoja_de_ruta.flota.flo_km_odo}
    }

    return data


@hdr_admin_route.get('/kilometros/{hdr_id}')
async def leer_km_hdr_admin(hdr_id: int, db=conn):
    hoja_de_ruta = db.exec(select(HDR).where(HDR.hdr_id == hdr_id)).first()
    if hoja_de_ruta is None:
        raise HTTPException(status_code=404, detail="La HDR especificada no existe")
    movimientos = db.exec(select(Movimiento).where(Movimiento.mov_hdr_id == hoja_de_ruta.hdr_id)).all()
    carga:Carga = db.exec(select(Carga).where(Carga.car_hdr_id == hoja_de_ruta.hdr_id).order_by(Carga.car_km_odo)).first()
    primer_km = carga.car_km_odo
    km_iniciales = hoja_de_ruta.flota.flo_km_odo if hoja_de_ruta.hdr_active == True else primer_km
    km_recorridos = 0
    km_actuales = 0
    list_movimientos = []

    if len(movimientos) == 0:
        return {"KM_INICIALES": km_iniciales,
            "KM_ACTUALES": km_actuales,
            "KM_RECORRIDOS": km_recorridos,
            "TABLA": list_movimientos}
    delta = timedelta(minutes=15)
    for movimiento in movimientos:
        if movimiento.mov_km_odo_fin == None or movimiento.mov_lugar_fin == None:
            km_actuales = movimiento.mov_km_odo_inicio 
        else:
            km_recorridos += (movimiento.mov_km_odo_fin - movimiento.mov_km_odo_inicio)

        infraccion = False

        if abs(movimiento.mov_inicio_real - movimiento.mov_inicio) > delta:
            infraccion = True

        if movimiento.mov_fin_real and movimiento.mov_fin and abs(movimiento.mov_fin_real - movimiento.mov_fin) > delta:
            infraccion = True
            
        info_tabla = {"ID": movimiento.mov_id,
                      "FECHA REGISTRADA":movimiento.mov_inicio_real,
                      "FECHA LLEGADA REGISTRADA":movimiento.mov_fin_real if movimiento.mov_fin_real else "No Finalizado",
                        "FECHA": movimiento.mov_inicio,
                        "FECHA LLEGADA":movimiento.mov_fin if movimiento.mov_fin else "No Finalizado",
                        "SALIDA": movimiento.mov_km_odo_inicio,
                        "LUGAR SALIDA":movimiento.mov_lugar_inicio,
                        "LLEGADA": movimiento.mov_km_odo_fin if movimiento.mov_km_odo_fin else "No Finalizado",
                        "LUGAR LLEGADA":movimiento.mov_lugar_fin if movimiento.mov_lugar_fin else "No Finalizado",
                        "DIFERENCIA": (movimiento.mov_km_odo_fin - movimiento.mov_km_odo_inicio)if movimiento.mov_km_odo_fin else "No Finalizado",
                        "PERMANENCIAS" : (movimiento.mov_permanencia) if (movimiento.mov_permanencia) else "No Finalizado",
                        "CARGADO": movimiento.mov_lleva_carga,
                        "INFRACCION":infraccion,
                        "TIPO KM": movimiento.tipokm.tk_nombre if (movimiento.tipokm) else "No Finalizado"}
        list_movimientos.append(info_tabla)

    km_iniciales = (hoja_de_ruta.flota.flo_km_odo - km_recorridos) if km_iniciales < 0 else km_iniciales

    data = {"KM_INICIALES": km_iniciales,
            "KM_ACTUALES": km_actuales if km_actuales != 0 else (km_iniciales + km_recorridos),
            "KM_RECORRIDOS": km_recorridos,
            "TABLA": list_movimientos}
    return data
    

@hdr_admin_route.get('/cargas/{hdr_id}')
async def leer_cargas_hdr_admin(hdr_id: int, db=conn):
    hoja_de_ruta = db.exec(select(HDR).where(HDR.hdr_id == hdr_id)).first()
    if hoja_de_ruta is None:
        raise HTTPException(status_code=404, detail="La HDR especificada no existe")
    cargas = db.exec(select(Carga).where(Carga.car_hdr_id == hoja_de_ruta.hdr_id).order_by(Carga.car_km_odo)).all()

    lt_combustible = 0
    lt_urea = 0
    list_cargas = []

    if len(cargas) == 0:
        return {"LT_COMBUSTIBLE": lt_combustible,
                "LT_UREA": lt_urea,
                "TABLA": list_cargas}
    response=calcular_consumo_combustible(hoja_de_ruta,db)
    etapa=response["etapas"]
    #consumo_anterior = None
    i=1
    for carga in cargas:
        lt_combustible += carga.car_lt_cargados
        lt_urea += carga.car_lt_urea_cargados
        consumo=etapa[i][0]
        
        #consumo_actual = None
        #if consumo_anterior is not None:
        #    consumo_actual = carga.car_lt_cargados / (carga.car_km_odo - consumo_anterior["KM"])
        
        info_tabla = {"ID": carga.car_id,
                      "FECHA": carga.car_fecha,
                      "LITROS": carga.car_lt_cargados,
                      "LITROS UREA": carga.car_lt_urea_cargados,
                      "SUCURSAL": carga.car_sucursal,
                      "KM": carga.car_km_odo,
                      "LITROS UREA": carga.car_lt_urea_cargados,
                      "CARGA COMPLETA":carga.car_tanque_lleno,
                      "CONSUMO":consumo
                }
        i+=1
        list_cargas.append(info_tabla)
        
        # consumo_anterior = {"ID": carga.car_id, "KM": carga.car_km_odo}
    
    data = {"LT_COMBUSTIBLE": lt_combustible,
            "LT_UREA": lt_urea,
            "TABLA": list_cargas}
    return data


@hdr_admin_route.get('/novedades/{hdr_id}')
async def leer_novedades_hdr_admin(hdr_id: int, db=conn):
    hoja_de_ruta = db.exec(select(HDR).where(HDR.hdr_id == hdr_id)).first()
    if hoja_de_ruta is None:
        raise HTTPException(status_code=404, detail="La HDR especificada no existe")
    novedades = db.exec(select(Novedad, CatNovedad).select_from(Novedad).join(CatNovedad).where(Novedad.nov_hdr_id == hoja_de_ruta.hdr_id)).all()

    cant_novedades = len(novedades)
    nov_pendientes = 0
    nov_finalizadas = 0
    list_novedades = []

    if cant_novedades == 0:
        return {"CANT_NOVEDADES": cant_novedades,
            "PENDIENTES": nov_pendientes,
            "FINALIZADAS": nov_finalizadas,
            "TABLA": list_novedades}
    
    for novedad, categoria in novedades:
        if novedad.nov_estado == "PENDIENTE": nov_pendientes += 1 
        else: nov_finalizadas += 1
        
        info_tabla = {"ID": novedad.nov_id,
                      "FECHA": novedad.nov_fecha,
                      "ID": novedad.nov_id,
                      "ESTADO": novedad.nov_estado,
                      "CATEGORIA": categoria.cn_nombre}
        list_novedades.append(info_tabla)
    
    data = {"CANT_NOVEDADES": cant_novedades,
            "PENDIENTES": nov_pendientes,
            "FINALIZADAS": nov_finalizadas,
            "TABLA": list_novedades}
    return data


@hdr_admin_route.get('/gastos/{hdr_id}')
async def leer_gastos_hdr_admin(hdr_id: int, db=conn):
    hoja_de_ruta = db.exec(select(HDR).where(HDR.hdr_id == hdr_id)).first()
    if hoja_de_ruta is None:
        raise HTTPException(status_code=404, detail="La HDR especificada no existe")
    gastos = db.exec(select(Gasto, CatNovedad).select_from(Gasto).join(CatNovedad).where(Gasto.gas_hdr_id == hoja_de_ruta.hdr_id)).all()
    adelantos = db.exec(select(Viatico).where(Viatico.vi_hdr_id == hoja_de_ruta.hdr_id)).all()
    adelantos = [adelanto for adelanto in adelantos if adelanto.vi_tipo == 1]

    total_gastos = 0
    total_adelantos = 0
    total_peajes = 0
    list_gastos =[]

    for adelanto in adelantos:
        total_adelantos += adelanto.vi_monto

    if len(gastos) == 0:
        return {"TOTAL_GASTOS": total_gastos,
            "PEAJES": total_peajes,
            "TABLA": list_gastos}
    
    for gasto, categoria in gastos:
        total_gastos += gasto.gas_monto
        if categoria.cn_nombre == "Peajes" or categoria.cn_nombre == "Peajes Internacionales":
            total_peajes += gasto.gas_monto
        info_tabla = {"ID": gasto.gas_id,
                    "FECHA": gasto.gas_fecha,
                    "CATEGORIA": categoria.cn_nombre,
                    "N COMPROBANTE": gasto.gas_ticket,
                    "RAZON SOCIAL": gasto.gas_proveedor,
                    "MONTO": gasto.gas_monto}
        list_gastos.append(info_tabla)

    data = {"TOTAL_GASTOS": total_gastos,
            "PEAJES": total_peajes,
            "TOTAL_ADELANTOS": total_adelantos,
            "TABLA": list_gastos}
    return data


@hdr_admin_route.get('/general/{hdr_id}')
async def leer_general_hdr_admin(hdr_id: int, db=conn):
    hoja_de_ruta = db.exec(select(HDR).where(HDR.hdr_id == hdr_id)).first()
    if hoja_de_ruta is None:
        raise HTTPException(status_code=404, detail="La HDR especificada no existe")
    
    movimientos = db.exec(select(Movimiento).where(Movimiento.mov_hdr_id == hdr_id)).all()
    #gastos = db.exec(select(Gasto, CatNovedad).select_from(Gasto).join(CatNovedad).where(Gasto.gas_hdr_id == hoja_de_ruta.hdr_id)).all()
    cargas = db.exec(select(Carga).where(Carga.car_hdr_id == hdr_id)).all()
    novedades = db.exec(select(Novedad, CatNovedad).select_from(Novedad).join(CatNovedad).where(Novedad.nov_hdr_id == hoja_de_ruta.hdr_id)).all()

    todos_eventos_con_km = []

    for movimiento in movimientos:
        salida = {"TIPO": "MOVIMIENTO",
                  "TIPO_MOVIMIENTO":"SALIDA",
                  "KM_SALIDA":movimiento.mov_km_odo_inicio,
                  "FECHA":movimiento.mov_inicio}
        todos_eventos_con_km.append((salida, movimiento.mov_km_odo_inicio))
        if movimiento.mov_fin:
            llegada = { "TIPO": "MOVIMIENTO",
                        "MOVIMIENTO":"LLEGADA",
                        "KM_LLEGADA":movimiento.mov_km_odo_fin,
                        "FECHA":movimiento.mov_fin}
            todos_eventos_con_km.append((llegada, movimiento.mov_km_odo_fin))

    for carga in cargas:
        if carga.car_observaciones != "Inicio de hoja de ruta":
            carga_ = {"TIPO":"CARGA",
                    "KM":carga.car_km_odo,
                    "LTS_COMB": carga.car_lt_cargados,
                    "FECHA": carga.car_fecha}
            todos_eventos_con_km.append((carga_, carga.car_km_odo))

    # for gasto, cat_nov in gastos:
    #     gasto_ = {"TIPO":"GASTO",
    #               "MONTO": gasto.gas_monto,
    #               "CAT_NOVEDAD": cat_nov.cn_nombre,
    #               "FECHA": gasto.gas_fecha}
    #     todos_eventos_con_km.append((gasto_, gasto.gas_fecha))

    for novedad, cat_nov in novedades:
        novedad_ = {"TIPO":"NOVEDAD",
                    "KM":novedad.nov_km_odo,
                    "CAT_NOVEDAD": cat_nov.cn_nombre,
                    "FECHA": novedad.nov_fecha}
        todos_eventos_con_km.append((novedad_, novedad.nov_km_odo))


    eventos_ordenados = sorted(todos_eventos_con_km, key=lambda x: x[1])

    eventos_ordenados = [evento[0] for evento in eventos_ordenados]

    return eventos_ordenados

@hdr_admin_route.put('/rendir/{hdr_id}', response_model=HDR)
async def rendir_hdr_admin(hdr_id: int,observaciones: str = None,credentials: JwtAuthorizationCredentials= Security(access_security) , db=conn):
    hdr_existente = db.exec(select(HDR).where(HDR.hdr_id == hdr_id)).first()

    if hdr_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la hoja de ruta con ID {hdr_id}")
    
    user_flota = obtener_user_flota(credentials,db)

    hdr_existente.hdr_rendida = True
    hdr_existente.hdr_fecha_rendida = datetime.now()
    hdr_existente.hdr_obs_rendida = observaciones
    hdr_existente.hdr_user_rendida = user_flota.usr_nombre + " " + user_flota.usr_apellido
    db.commit()
    db.refresh(hdr_existente)

    return hdr_existente

@hdr_admin_route.put('/{hdr_id}', response_model=HDR)
async def actualizar_hdr_admin(hdr_id: int, nueva_info_hdr: HDRCreate,credentials: JwtAuthorizationCredentials= Security(access_security) , db=conn):
    hdr_existente = db.exec(select(HDR).where(HDR.hdr_id == hdr_id, HDR.hdr_active==True)).first()

    if hdr_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la hoja de ruta con ID {hdr_id}")
    
    hdr_existente.hdr_modif = datetime.now()
    for key, value in nueva_info_hdr.model_dump().items():
        setattr(hdr_existente, key, value)


    db.commit()
    db.refresh(hdr_existente)

    return hdr_existente