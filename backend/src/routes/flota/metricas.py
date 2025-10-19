
from typing import List
from models.desarrollo.deposito import Deposito
from fastapi import APIRouter, Body, Depends, HTTPException, Security,BackgroundTasks
from sqlmodel import Session, select, SQLModel
from fastapi_jwt import JwtAuthorizationCredentials
from data.functions.security import access_security
from datetime import datetime, date
from database import get_db
from models.desarrollo.cubierta import Cubiertas, CubiertasCreate
from sqlalchemy import func, and_, or_
from sqlalchemy.orm import selectinload, joinedload
from models.desarrollo.flo_cub_pos import FloCubPos
from models.desarrollo.hdr import HDR
from models.desarrollo.carga_combustible import Carga
from models.desarrollo.movimiento import Movimiento
from models.desarrollo.otc import Otc
from models.desarrollo.novedad import Novedad
from models.seguridad.user import Usuario
from models.desarrollo.flota import Flota
from models.desarrollo.chofer import Chofer
from models.desarrollo.orden_trabajo import OT
from data.functions.consumo import calcular_consumo_combustible
from models.desarrollo.batea import Batea
from models.desarrollo.cubierta import Cubiertas
from models.desarrollo.flota_cubiertas import FlotaCubiertas
from models.desarrollo.tipo_kilometro import TipoKilometro
from fastapi.responses import FileResponse
import pandas as pd
import os

metricas_route = APIRouter(prefix="/metricas")

conn:Session = Depends(get_db)

class Parametros(SQLModel):
    fecha_desde:str | None = None
    fecha_hasta:str | None = None
    destino_id:int | None = None

@metricas_route.get('/analitica')
async def analitica(parametros:Parametros = Depends(),db=conn):
    query = select(HDR)
    count_query = select(func.count()).select_from(HDR) 

    if parametros.fecha_desde:
        query = query.filter(and_(HDR.hdr_carga >= parametros.fecha_desde))
        count_query = count_query.filter(and_(HDR.hdr_carga >= parametros.fecha_desde))

    if parametros.fecha_hasta:
        fecha_hasta_fin_del_dia = parametros.fecha_hasta + " 23:59:59"
        query = query.filter(and_(HDR.hdr_carga <= fecha_hasta_fin_del_dia))
        count_query = count_query.filter(and_(HDR.hdr_carga <= fecha_hasta_fin_del_dia))

    if parametros.destino_id:
        query = query.filter(and_(HDR.hdr_destino_id == parametros.destino_id))
        count_query = count_query.filter(and_(HDR.hdr_destino_id == parametros.destino_id))

    total_result = db.scalar(count_query) 
    hdrs = db.exec(query.options(selectinload(HDR.chofer).selectinload(Chofer.user), selectinload(HDR.flota))).all()

    km_mayor_obj = 0
    km_medio_obj = 0
    km_menor_obj = 0
    consumo_mayor_obj = 0
    consumo_regular_obj = 0
    consumo_menor_obj = 0
    contador_consumo = 0
    contador_km = 0
    vehiculos_unicos = set()
    for hdr in hdrs:
        km = calcular_km(hdr,db)
        contador_km += km
        vehiculos_unicos.add(hdr.hdr_flota_id)
        response=calcular_consumo_combustible(hdr,db)
        ratio_consumo = response["ratio_consumo"]
        if ratio_consumo <= 0.36: consumo_menor_obj += 1 
        elif ratio_consumo > 0.36 and ratio_consumo <= 0.40: consumo_regular_obj += 1
        else: consumo_mayor_obj += 1
        if km <= 1000: km_menor_obj += 1 
        elif km > 1000 and km <= 2000: km_medio_obj += 1
        else: km_mayor_obj += 1 
        contador_consumo += ratio_consumo

    cantidad_vehiculos = len(vehiculos_unicos)
    km_promedio = contador_km / total_result if contador_km > 0 else 0
    consumo_promedio = contador_consumo / total_result if contador_consumo > 0 else 0

    flotas = get_porcentaje_disponibles(db)

    return {"CANTIDAD_HDR": total_result,
            "CANTIDAD_VEHICULOS":cantidad_vehiculos,
            "CONSUMO_PROMEDIO":consumo_promedio,
            "CONSUMO_SEGMENTO_MAL":consumo_mayor_obj,
            "CONSUMO_SEGMENTO_REGULAR":consumo_regular_obj,
            "CONSUMO_SEGMENTO_BIEN":consumo_menor_obj,
            "KM_PROMEDIO": km_promedio,
            "KM_SEGMENTO_LARGO":km_mayor_obj,
            "KM_SEGMENTO_MEDIO": km_medio_obj,
            "KM_SEGMENTO_CORTO": km_menor_obj,
            "FLOTAS_DISPONIBLES": flotas["flotas_disponibles"],
            "FLOTAS_NO_DISPONIBLES": flotas["flotas_no_disponibles"],
            "PORCENTAJE_FLOTAS_DISPONIBLES": flotas["porcentaje_flotas_disponibles"]}

def get_porcentaje_disponibles(db):
    contador_disp = 0
    contador_no_disp = 0
    contador_en_transito = 0
    contador_parado = 0
    flotas = db.exec(select(Flota)).all()
    for flota in flotas:
        ots = db.exec(select(OT).filter(OT.ot_patente == flota.flo_dom_tractor)).all() 
        flota_disponible = True    
        for ot in ots:
            if ot.ot_estado not in ["PROGRAMADO", "CERRADO"]:
                contador_no_disp += 1
                flota_disponible = False  
                break  
        if flota_disponible:
            contador_disp += 1
            activa = db.exec(select(HDR).filter(HDR.hdr_flota_id == flota.flo_id, HDR.hdr_active==True)).first()
            if activa: contador_en_transito += 1
            else: contador_parado += 1
    total_flotas = contador_disp + contador_no_disp
    porcentaje_disp = (contador_disp / total_flotas) * 100 if total_flotas > 0 else 0
    return {
        "flotas_disponibles": contador_disp,
        "flotas_no_disponibles": contador_no_disp,
        "flotas_disponibles_en_transito": contador_en_transito,
        "flotas_disponibles_parado": contador_parado,
        "porcentaje_flotas_disponibles": round(porcentaje_disp,2)
    }

def calcular_km(hdr: HDR, db):
    novedades = db.exec(select(Novedad).where(Novedad.nov_hdr_id == hdr.hdr_id)).all()
    cargas = db.exec(select(Carga).where(Carga.car_hdr_id == hdr.hdr_id)).all()
    movimientos = db.exec(select(Movimiento).where(Movimiento.mov_hdr_id == hdr.hdr_id).order_by(Movimiento.mov_fin.desc())).all()
    km_recorridos = 0

    if hdr.hdr_active == True:
        if len(cargas) > 0:
            for carga in cargas:
                if carga.car_km_odo > km_recorridos: km_recorridos = carga.car_km_odo
        
        if len(novedades) > 0:
            for novedad in novedades:
                if novedad.nov_km_odo > km_recorridos: km_recorridos = novedad.nov_km_odo

        if len(movimientos) > 0:
            for index, movimiento in enumerate(movimientos):
                if movimiento.mov_km_odo_inicio > km_recorridos: km_recorridos = movimiento.mov_km_odo_inicio
                if movimiento.mov_km_odo_fin:
                    if movimiento.mov_km_odo_fin > km_recorridos: km_recorridos = movimiento.mov_km_odo_fin
        return km_recorridos - hdr.flota.flo_km_odo
    else:
        for index, movimiento in enumerate(movimientos):
                km_recorridos += (movimiento.mov_km_odo_fin - movimiento.mov_km_odo_inicio) 

    return km_recorridos
                

@metricas_route.get('/kmPorFlota')
async def obtener_km_x_flotas(destino_id:str = None, nombre: str = None,fecha_desde: str = None, fecha_hasta: str = None,db=conn):
    query = select(HDR).options(joinedload(HDR.flota))

    if fecha_desde:
        query = query.filter(and_(HDR.hdr_carga >= fecha_desde))

    if fecha_hasta:
        fecha_hasta_fin_del_dia = fecha_hasta + " 23:59:59"
        query = query.filter(and_(HDR.hdr_carga <= fecha_hasta_fin_del_dia))
    
    if nombre:
        query = query.filter(HDR.flota.has(Flota.flo_nombre.ilike(f"%{nombre}%")))

    if destino_id:
        query = query.filter(and_(HDR.hdr_destino_id == destino_id))

    hdrs = db.exec(query).all()

    list_data = {}
    for hdr in hdrs:
        km = calcular_km(hdr,db)
        flota = hdr.flota.flo_nombre
        if flota not in list_data:
            list_data[flota] = {"KM": 0}
        list_data[flota]["KM"] += km

    result_list = [{"NOMBRE": flota, "KM": data["KM"]} for flota, data in list_data.items()]

    return result_list
        
@metricas_route.get('/kmPorChofer')
async def obtener_km_x_chofer(destino_id:str = None, nombre: str = None,fecha_desde: str = None, fecha_hasta: str = None,db=conn):
    query = select(HDR).select_from(HDR)

    if fecha_desde:
        query = query.filter(and_(HDR.hdr_carga >= fecha_desde))

    if fecha_hasta:
        fecha_hasta_fin_del_dia = fecha_hasta + " 23:59:59"
        query = query.filter(and_(HDR.hdr_carga <= fecha_hasta_fin_del_dia))

    if nombre:
        nombre_apellido = nombre.split()
    
        if len(nombre_apellido) == 1:
            usuarios = db.exec(select(Usuario).where(or_(
                Usuario.usr_nombre.ilike(f"%{nombre}%"), 
                Usuario.usr_apellido.ilike(f"%{nombre}%")
            ))).all()
        else:  
            nombre = nombre_apellido[0]
            apellido = nombre_apellido[1]
            usuarios = db.exec(select(Usuario).where(and_(
                or_(Usuario.usr_nombre.ilike(f"%{nombre}%"), Usuario.usr_apellido.ilike(f"%{apellido}%")),
                or_(Usuario.usr_apellido.ilike(f"%{nombre}%"), Usuario.usr_apellido.ilike(f"%{apellido}%"))
            ))).all()
            
        if len(usuarios) == 0:
            return {} 
        
        chofer_ids = [usuario.chofer.chofer_id for usuario in usuarios if usuario and usuario.chofer]
        query = query.filter(HDR.hdr_chofer_id.in_(chofer_ids))
    if destino_id:
        query = query.filter(and_(HDR.hdr_destino_id == destino_id))

    hdrs = db.exec(query).all()

    list_data = {}
    for hdr in hdrs:
        km = calcular_km(hdr,db)
        chofer = hdr.chofer.user.usr_nombre + " " +hdr.chofer.user.usr_apellido
        if chofer not in list_data:
            list_data[chofer] = {"KM": 0}
        list_data[chofer]["KM"] += km

    result_list = [{"NOMBRE": chofer, "KM": data["KM"]} for chofer, data in list_data.items()]

    return result_list

def get_flotas_disponibles(db):
    contador_disp_flotas = 0
    contador_no_disp_flotas = 0
    contador_en_transito_flotas = 0
    contador_parado_flotas = 0
    contador_disp_bateas = 0
    contador_no_disp_bateas = 0
    contador_en_transito_bateas = 0
    contador_parado_bateas = 0
    flotas = db.exec(select(Flota)).all()
    bateas = db.exec(select(Batea)).all()
    for flota in flotas:
        ots = db.exec(select(OT).filter(OT.ot_patente == flota.flo_dom_tractor)).all() 
        flota_disponible = True    
        for ot in ots:
            if ot.ot_estado not in ["PROGRAMADO", "CERRADO"]:
                contador_no_disp_flotas += 1
                flota_disponible = False  
                break  
        if flota_disponible:
            contador_disp_flotas += 1
            activa = db.exec(select(HDR).filter(HDR.hdr_flota_id == flota.flo_id, HDR.hdr_active==True)).first()
            if activa: contador_en_transito_flotas += 1
            else: contador_parado_flotas += 1
    total_flotas = contador_disp_flotas + contador_no_disp_flotas
    porcentaje_disp_flotas = (contador_disp_flotas / total_flotas) * 100 if total_flotas > 0 else 0
    for batea in bateas:
        ots = db.exec(select(OT).filter(OT.ot_patente == batea.bat_dominio)).all() 
        flota_disponible = True    
        for ot in ots:
            if ot.ot_estado not in ["PROGRAMADO", "CERRADO"]:
                contador_no_disp_bateas += 1
                flota_disponible = False  
                break  
        if flota_disponible:
            contador_disp_bateas += 1
            activa = db.exec(select(HDR).filter(HDR.hdr_batea_id == batea.bat_id, HDR.hdr_active==True)).first()
            if activa: contador_en_transito_bateas += 1
            else: contador_parado_bateas += 1
    total_bateas = contador_disp_bateas + contador_no_disp_bateas
    porcentaje_disp_bateas = (contador_disp_bateas / total_bateas) * 100 if total_bateas > 0 else 0
    return {
        "tractores_disponibles": contador_disp_flotas,
        "tractores_no_disponibles": contador_no_disp_flotas,
        "tractores_disponibles_en_transito": contador_en_transito_flotas,
        "tractores_disponibles_parado": contador_parado_flotas,
        "porcentaje_tractores_disponibles": round(porcentaje_disp_flotas,2),
        "bateas_disponibles": contador_disp_bateas,
        "bateas_no_disponibles": contador_no_disp_bateas,
        "bateas_disponibles_en_transito": contador_en_transito_bateas,
        "bateas_disponibles_parado": contador_parado_bateas,
        "porcentaje_bateas_disponibles": round(porcentaje_disp_bateas,2)
    }

@metricas_route.get('/porcentajeDisponibilidadFlotas')
async def porcentaje_disponibilidad_flotas(db=conn):
    flotas = get_flotas_disponibles(db)

    return flotas



@metricas_route.get('/porcentajeTiposDeViajesActivos')
async def porcentaje_tipos_viajes_activos(db=conn):
    hdrs_query = select(HDR).where(HDR.hdr_active == True)
    hdrs_activas = db.exec(hdrs_query).all()
    
    total_hdrs_activas = len(hdrs_activas)

    nacionales_count = 0
    internacionales_count = 0

    for hdr in hdrs_activas:
        if hdr.hdr_destino_id == 1:
            nacionales_count += 1
        else:
            internacionales_count += 1

    if total_hdrs_activas > 0:
        porcentaje_nacionales = (nacionales_count / total_hdrs_activas) * 100
        porcentaje_internacionales = (internacionales_count / total_hdrs_activas) * 100
    else:
        porcentaje_nacionales = 0
        porcentaje_internacionales = 0

    return {
        "NACIONAL": round(porcentaje_nacionales,2),
        "INTERNACIONAL": round(porcentaje_internacionales,2),
        "TOTAL_VIAJES_ACTIVOS": total_hdrs_activas
    }


@metricas_route.get('/porcentajeHDRPorMotivo')
async def porcentaje_hdrs_cerradas_x_motivo(db=conn):
    hdrs_inactivas = db.exec(select(HDR).where(HDR.hdr_active == False)).all()
    total_hdrs_inactivas = len(hdrs_inactivas)

    rendicion_count = 0
    cambio_count = 0
    rotura_count = 0

    for hdr in hdrs_inactivas:
        comentario = hdr.hdr_comentarios.lower() 
        if "rendicion de cuenta" in comentario:
            rendicion_count += 1
        elif "cambio de flota" in comentario:
            cambio_count += 1
        elif "por rotura" in comentario:
            rotura_count += 1

    if total_hdrs_inactivas > 0:
        porcentaje_rendicion = (rendicion_count / total_hdrs_inactivas) * 100
        porcentaje_cambio = (cambio_count / total_hdrs_inactivas) * 100
        porcentaje_rotura = (rotura_count / total_hdrs_inactivas) * 100
    else:
        porcentaje_rendicion = 0
        porcentaje_cambio = 0
        porcentaje_rotura = 0

    return {
        "RENDICION_DE_CUENTA": round(porcentaje_rendicion,2),
        "CAMBIO_DE_FLOTA": round(porcentaje_cambio,2),
        "ROTURA":round(porcentaje_rotura,2),
        "TOTAL_HDR": total_hdrs_inactivas
    }


@metricas_route.get('/totalOrdenesTrabajo')
async def total_ordenes_trabajo(db=conn):
    total_result= 0
    cant_ot_programadas = 0
    cant_ot_taller = 0
    cant_ot_demoradas = 0
    cant_ot_cerradas = 0

    query = select(OT)
    total_result = db.exec(select(func.count()).select_from(query.alias())).one()
    ots = db.exec(query).all()
    
    for ot in ots:
        if ot.ot_estado == "PROGRAMADO":cant_ot_programadas +=1 
        elif ot.ot_estado == "EN TALLER": cant_ot_taller +=1
        elif ot.ot_estado == "DEMORADO": cant_ot_demoradas +=1
        elif ot.ot_estado == "CERRADO": cant_ot_cerradas +=1

    return {
        "TOTAL": total_result,
        "CANT_PROGRAMADAS": cant_ot_programadas,
        "CANT_EN_TALLER": cant_ot_taller,
        "CANT_DEMORADAS": cant_ot_demoradas,
        "CANT_CERRADAS": cant_ot_cerradas
    }

@metricas_route.get('/totalNovedades')
async def total_novedades(db=conn):
    cant_pendientes = 0
    cant_cerradas = 0
    cant_asignadas = 0

    query = select(Novedad)
    total_result = db.exec(select(func.count()).select_from(query.alias())).one()
    novedades = db.exec(query).all()
    
    for novedad in novedades:
        if novedad.nov_estado == "PENDIENTE":cant_pendientes +=1 
        elif novedad.nov_estado == "CERRADA": cant_cerradas +=1
        elif novedad.nov_estado == "ASIGNADA": cant_asignadas +=1
    
    return {
        "TOTAL": total_result,
        "CANT_PENDIENTES": cant_pendientes,
        "CANT_ASIGNADAS": cant_asignadas,
        "CANT_CERRADAS": cant_cerradas
    }


@metricas_route.get('/combustibleConsumidoChofer')
async def combustible_consumido_por_chofer(destino_id:str = None,nombre: str = None,fecha_desde: str = None, fecha_hasta: str = None,db=conn):
    query = select(HDR)

    if fecha_desde:
        query = query.filter(and_(HDR.hdr_carga >= fecha_desde))

    if fecha_hasta:
        fecha_hasta_fin_del_dia = fecha_hasta + " 23:59:59"
        query = query.filter(and_(HDR.hdr_carga <= fecha_hasta_fin_del_dia))

    if nombre:
        nombre_apellido = nombre.split()
    
        if len(nombre_apellido) == 1:
            usuarios = db.exec(select(Usuario).where(or_(
                Usuario.usr_nombre.ilike(f"%{nombre}%"), 
                Usuario.usr_apellido.ilike(f"%{nombre}%")
            ))).all()
        else:  
            nombre = nombre_apellido[0]
            apellido = nombre_apellido[1]
            usuarios = db.exec(select(Usuario).where(and_(
                or_(Usuario.usr_nombre.ilike(f"%{nombre}%"), Usuario.usr_apellido.ilike(f"%{apellido}%")),
                or_(Usuario.usr_apellido.ilike(f"%{nombre}%"), Usuario.usr_apellido.ilike(f"%{apellido}%"))
            ))).all()
            
        if len(usuarios) == 0:
            return {}  
        
        chofer_ids = [usuario.chofer.chofer_id for usuario in usuarios if usuario and usuario.chofer]
        query = query.filter(HDR.hdr_chofer_id.in_(chofer_ids))
    if destino_id:
        query = query.filter(and_(HDR.hdr_destino_id == destino_id))

    hdrs = db.exec(query).all()

    consumo_por_chofer = {}
    for hdr in hdrs:
        chofer = hdr.chofer.user.usr_nombre + " " +hdr.chofer.user.usr_apellido
        if chofer not in consumo_por_chofer:
            consumo_por_chofer[chofer] = {"consumo": 0, "total_cargado": 0, "ratio_consumo": 0, "distancia": 0}

        response = calcular_consumo_combustible(hdr, db)
        consumo_por_chofer[chofer]["consumo"] += response["consumo"]
        consumo_por_chofer[chofer]["total_cargado"] += response["total_cargado"]
        consumo_por_chofer[chofer]["distancia"] += response["distancia"]

    for chofer, datos in consumo_por_chofer.items():
        if datos["distancia"] > 0:
            datos["ratio_consumo"] = datos["consumo"] / datos["distancia"]
        else:
            datos["ratio_consumo"] = 0

    return consumo_por_chofer

@metricas_route.get('/combustibleConsumidoFlota')
async def combustible_consumido_por_flota(destino_id:str = None,nombre: str = None,fecha_desde: str = None, fecha_hasta: str = None,db=conn):
    query = select(HDR).options(joinedload(HDR.flota))

    if fecha_desde:
        query = query.filter(and_(HDR.hdr_carga >= fecha_desde))

    if fecha_hasta:
        fecha_hasta_fin_del_dia = fecha_hasta + " 23:59:59"
        query = query.filter(and_(HDR.hdr_carga <= fecha_hasta_fin_del_dia))
    
    if nombre:
        query = query.filter(HDR.flota.has(Flota.flo_nombre.ilike(f"%{nombre}%")))

    if destino_id:
        query = query.filter(and_(HDR.hdr_destino_id == destino_id))

    hdrs = db.exec(query).all()

    consumo_por_flota = {}
    for hdr in hdrs:
        flota = hdr.flota.flo_nombre
        if flota not in consumo_por_flota:
            consumo_por_flota[flota] = {"consumo": 0, "total_cargado": 0, "ratio_consumo": 0, "distancia": 0}

        response = calcular_consumo_combustible(hdr, db)
        consumo_por_flota[flota]["consumo"] += response["consumo"]
        consumo_por_flota[flota]["total_cargado"] += response["total_cargado"]
        consumo_por_flota[flota]["distancia"] += response["distancia"]

    for flota, datos in consumo_por_flota.items():
        if datos["distancia"] > 0:
            datos["ratio_consumo"] = datos["consumo"] / datos["distancia"]
        else:
            datos["ratio_consumo"] = 0

    return consumo_por_flota

@metricas_route.get('/RotacionesCubiertas')
async def obtener_rotaciones_cubiertas(db=conn):
    flotas = db.exec(select(Flota)).all()
    bateas = db.exec(select(Batea)).all()
    hdr_activas= db.exec(select(HDR).where(HDR.hdr_active==True)).all()
    
    patentes = [flota.flo_dom_tractor for flota in flotas] + [batea.bat_dominio for batea in bateas]
    list_data = []

    def crear_flota_cubiertas(patente, tipo):
        nuevo_fc = FlotaCubiertas(
            fc_fecha=datetime.today(),
            fc_patente=patente,
            fc_tipo=tipo,
            fc_km_odo=0  # PARTE DE TRATAMIENTO
        )
        db.add(nuevo_fc)
        db.commit()
        db.refresh(nuevo_fc)
        return nuevo_fc

    for patente in patentes:
        km_pos = []
        km_live=[]
        days=[]
        nro_interno=[]
        
        km_recorridos = 0
        for hdr in hdr_activas:
            if hdr.flota.flo_dom_tractor == patente or hdr.batea.bat_dominio == patente:
                km_recorridos = calcular_km(hdr, db)
        
        flota_cubiertas = db.exec(select(FlotaCubiertas).where(FlotaCubiertas.fc_patente == patente)).first()
        fc_tipo_ = 0

        if flota_cubiertas is None:
            flota_obj = db.exec(select(Flota).where(Flota.flo_dom_tractor == patente)).first()
            fc_tipo_ = 1

            if flota_obj is None:
                batea_obj = db.exec(select(Batea).where(Batea.bat_dominio == patente)).first()
                if batea_obj is None:
                    raise HTTPException(status_code=404, detail=f"No se encontró la Flota o Batea con patente {patente}")
                fc_tipo_ = 2
            
            flota_cubiertas = crear_flota_cubiertas(patente, fc_tipo_)

        posiciones = db.exec(select(FloCubPos).where(FloCubPos.fc_id == flota_cubiertas.fc_id).order_by(FloCubPos.pos_id)).all()
        rango = range(1, 8) if flota_cubiertas.fc_tipo == 1 else range(8, 18)
        for x in rango:
            posicion_encontrada = False
            for posicion in posiciones:
                if posicion.pos_id == x:
                    km_recorridos = km_recorridos if (posicion.pos_id!=7 and posicion.pos_id!=16 and posicion.pos_id!=17) else 0
                    km_pos.append(posicion.cubierta.cub_km_recorridos - posicion.cubierta.cub_pos_actual),
                    km_live.append(posicion.cubierta.cub_km_recorridos - posicion.cubierta.cub_pos_actual+km_recorridos)
                    days.append((date.today() - posicion.fecha_rotacion).days)
                    nro_interno.append(posicion.cubierta.cub_nro_interno)
                    posicion_encontrada = True
                    break
            
            if not posicion_encontrada:
                km_pos.append(None)
                km_live.append(None)
                days.append(None)
                nro_interno.append(None)
                
        data = {"PATENTE":flota_cubiertas.fc_patente,
                "TIPO":"TRACTOR" if flota_cubiertas.fc_tipo == 1 else "BATEA",
                "KM_POS":km_pos,
                "KM_LIVE":km_live,
                "DIAS":days,
                "NRO_INTERNO":nro_interno}
        list_data.append(data)

    return list_data

@metricas_route.get("/ubicacionDeCubiertas/")
async def ubicacion_de_cubiertas(db=conn):
    ubicaciones = {
        "DEPOSITO": 0,
        "TALLER": 0,
        "RODANDO": 0,
        "BAJA": 0,
        "BAJA DEFINITIVA": 0
    }

    bajas = db.exec(select(Cubiertas).where(Cubiertas.cub_estado == "BAJA")).all()
    bajas_definitivas = db.exec(select(Cubiertas).where(Cubiertas.cub_estado == "BAJA DEFINITIVA")).all()

    ubicaciones["BAJA"] = len(bajas)
    ubicaciones["BAJA DEFINITIVA"] = len(bajas_definitivas)
    cubiertas = db.exec(select(Cubiertas)).all()

    for cubierta in cubiertas:
        if cubierta.cub_estado in ["BAJA", "BAJA DEFINITIVA"]:
            continue  
        rodando = db.exec(select(FloCubPos).where(FloCubPos.cub_id == cubierta.cub_id)).first()
        en_taller = db.exec(select(Otc).where(Otc.cub_id == cubierta.cub_id, Otc.otc_estado == "PENDIENTE")).first()
        if rodando:
            ubicaciones["RODANDO"] += 1
            continue
        else:
            ubicaciones["DEPOSITO"] += 1
        if en_taller:
            ubicaciones["TALLER"] += 1
    return ubicaciones


@metricas_route.get("/cubiertasPorDeposito/")
async def cubiertas_por_deposito(db=conn):
    depositos:List[Deposito] = db.exec(select(Deposito)).all()
    print(len(depositos))
    depositos_cubiertas = {}
    for deposito  in depositos:
        cubiertas = db.exec(select(Cubiertas).where(Cubiertas.cub_id_dep == deposito.id)).all()
        depositos_cubiertas[deposito.dep_nombre] = len(cubiertas)
    return depositos_cubiertas



@metricas_route.get("/estadoDeCubiertas/")
async def estado_de_cubiertas(db=conn):
    cubiertas = db.exec(select(Cubiertas)).all()
    count_recapado = 0
    count_rotacion = 0
    for cubierta in cubiertas:
        if cubierta.cub_mm <= 4:
            count_recapado += 1
            pass
        if (cubierta.cub_km_recorridos - cubierta.cub_pos_actual) >= 40000: 
            count_rotacion += 1
    return {"NECESITA_RECAPAR":count_recapado,
            "NECESITA_ROTAR":count_rotacion}


@metricas_route.get("/cubiertasPorMM/")
async def cubiertas_por_mm(db=conn):
    cubiertas = db.exec(select(Cubiertas)).all()
    count_0_2 = 0
    count_3_5 = 0
    count_6_8 = 0
    count_9_10 = 0

    for cubierta in cubiertas:
        if cubierta.cub_mm >= 9:
            count_9_10 += 1
            pass
        if cubierta.cub_mm >= 6 and cubierta.cub_mm <= 8:
            count_6_8 += 1
            pass
        if cubierta.cub_mm >= 3 and cubierta.cub_mm <= 5:
            count_3_5 += 1
            pass
        if cubierta.cub_mm >= 0 and cubierta.cub_mm <= 2:
            count_0_2 += 1
            pass
    return {"ENTRE_0_2":count_0_2,
            "ENTRE_3_5":count_3_5,
            "ENTRE_6_8":count_6_8,
            "ENTRE_9_10":count_9_10}

class ParametrosMovimientosxChofer(SQLModel):
    fecha_desde: str | None = None
    fecha_hasta: str | None = None
    chofer_id: int | None = None

@metricas_route.get("/movimientosPorChofer/")
async def movimientos_por_chofer(parametros: ParametrosMovimientosxChofer = Depends(), db=conn):
    query = (
        select(
            Movimiento.mov_id,
            Movimiento.mov_inicio, 
            Movimiento.mov_fin,
            Movimiento.mov_lugar_inicio,
            Movimiento.mov_lugar_fin,
            Movimiento.mov_km_odo_inicio, 
            Movimiento.mov_km_odo_fin, 
            Movimiento.mov_permanencia,
            Movimiento.mov_lleva_carga,
            HDR.hdr_id,
            Chofer.chofer_id,
            Usuario.usr_nombre,  # Usamos Usuario en lugar de Chofer.user
            Usuario.usr_apellido,
            TipoKilometro.tk_nombre  # Si tienes esta tabla asociada
        )
        .join(HDR, HDR.hdr_id == Movimiento.mov_hdr_id)
        .join(Chofer, Chofer.chofer_id == HDR.hdr_chofer_id)
        .join(Usuario, Usuario.usr_id == Chofer.usr_id)  # Join con la tabla Usuario
        .join(TipoKilometro, TipoKilometro.tk_id == Movimiento.mov_tipo_km_id)
    )

    # Filtros por fechas
    if parametros.fecha_desde:
        query = query.filter(Movimiento.mov_inicio >= parametros.fecha_desde)

    if parametros.fecha_hasta:
        fecha_hasta_fin_del_dia = parametros.fecha_hasta + " 23:59:59"
        query = query.filter(Movimiento.mov_inicio <= fecha_hasta_fin_del_dia)

    # Filtro por chofer
    if parametros.chofer_id:
        query = query.filter(Chofer.chofer_id == parametros.chofer_id)

    resultados = db.exec(query).all()

    list_data = []
    for resultado in resultados:
        data = {
            "FECHA": resultado.mov_inicio,
            "FECHA LLEGADA": resultado.mov_fin if resultado.mov_fin else "No Finalizado",
            "LUGAR DE INICIO": resultado.mov_lugar_inicio,
            "LUGAR DE FIN": resultado.mov_lugar_fin if resultado.mov_lugar_fin else "No Finalizado",
            "KM RECORRIDOS": resultado.mov_km_odo_fin - resultado.mov_km_odo_inicio if resultado.mov_km_odo_fin else "No Finalizado",
            "DIAS DE PERMANENCIA": resultado.mov_permanencia if resultado.mov_permanencia else "0",
            "HOJA DE RUTA ID": resultado.hdr_id,
            "MOVIMIENTO ID": resultado.mov_id,
            "TIPO DE KM": resultado.tk_nombre,
            "LLEVA CARGA": resultado.mov_lleva_carga,
            "CHOFER": resultado.usr_nombre + " " + resultado.usr_apellido
        }
        list_data.append(data)

    return list_data
import tempfile
@metricas_route.get("/excelmovimientosPorChofer/")
async def excel_movimientos_por_chofer(
    background_tasks: BackgroundTasks,
    parametros: ParametrosMovimientosxChofer = Depends(),
    db=conn
):
    query = (
        select(
            Movimiento.mov_inicio, 
            Movimiento.mov_fin,
            Movimiento.mov_lugar_inicio,
            Movimiento.mov_lugar_fin,
            Movimiento.mov_km_odo_inicio, 
            Movimiento.mov_km_odo_fin, 
            Movimiento.mov_permanencia,
            Movimiento.mov_lleva_carga,
            HDR.hdr_id,
            Chofer.chofer_id,
            Usuario.usr_nombre,
            Usuario.usr_apellido,
            TipoKilometro.tk_nombre
        )
        .join(HDR, HDR.hdr_id == Movimiento.mov_hdr_id)
        .join(Chofer, Chofer.chofer_id == HDR.hdr_chofer_id)
        .join(Usuario, Usuario.usr_id == Chofer.usr_id)
        .join(TipoKilometro, TipoKilometro.tk_id == Movimiento.mov_tipo_km_id)
    )

    # Filtros por fechas
    if parametros.fecha_desde:
        query = query.filter(Movimiento.mov_inicio >= parametros.fecha_desde)

    if parametros.fecha_hasta:
        fecha_hasta_fin_del_dia = parametros.fecha_hasta + " 23:59:59"
        query = query.filter(Movimiento.mov_inicio <= fecha_hasta_fin_del_dia)

    # Filtro por chofer
    if parametros.chofer_id:
        query = query.filter(Chofer.chofer_id == parametros.chofer_id)

    resultados = db.exec(query).all()

    # Generar la lista de diccionarios para crear el DataFrame
    list_data = [
        {
            "FECHA": resultado.mov_inicio,
            "FECHA LLEGADA": resultado.mov_fin if resultado.mov_fin else "No Finalizado",
            "LUGAR DE INICIO": resultado.mov_lugar_inicio,
            "LUGAR DE FIN": resultado.mov_lugar_fin if resultado.mov_lugar_fin else "No Finalizado",
            "KM RECORRIDOS": resultado.mov_km_odo_fin - resultado.mov_km_odo_inicio if resultado.mov_km_odo_fin else "No Finalizado",
            "DIAS DE PERMANENCIA": resultado.mov_permanencia if resultado.mov_permanencia else 0,
            "HOJA DE RUTA ID": resultado.hdr_id,
            "TIPO DE KM": resultado.tk_nombre,
            "LLEVA CARGA": "SI" if resultado.mov_lleva_carga else "NO",
            "CHOFER": resultado.usr_nombre + " " + resultado.usr_apellido
        }
        for resultado in resultados
    ]

    df = pd.DataFrame(list_data)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
        df.to_excel(tmp.name, index=False)
        tmp_path = tmp.name

    # Agregar la tarea en segundo plano para limpiar el archivo temporal
    background_tasks.add_task(os.remove, tmp_path)

    # Retornar el archivo como respuesta
    return FileResponse(
        tmp_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="movimientos_por_chofer.xlsx"
    )