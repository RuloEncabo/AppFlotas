from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select
from fastapi_jwt import JwtAuthorizationCredentials
from datetime import datetime, timezone
from database import get_db
from models.desarrollo.hdr import HDR, HDRCreate
from models.desarrollo.novedad import Novedad
from models.desarrollo.gasto import Gasto
from models.desarrollo.carga_combustible import Carga
from models.desarrollo.batea import Batea
from models.desarrollo.movimiento import Movimiento
from models.desarrollo.viatico  import Viatico
from models.desarrollo.tipo_viatico import TipoViatico
from data.functions.security import access_security, obtener_chofer
from typing import Optional, List
from data.functions.recorrido import actualizar_cubiertas
from models.desarrollo.flota import Flota
from data.functions.check_cubiertas import checkear_cubiertas_para_hdr

hdr_route = APIRouter(prefix="/hdr")

conn:Session = Depends(get_db)

@hdr_route.get('/')
async def leer_hojas_de_ruta(db=conn):
    statement = select(HDR)
    data = db.exec(statement).all()
    return data

@hdr_route.get('/chofer')
async def leer_hdr_actual(credentials: JwtAuthorizationCredentials= Security(access_security), db=conn):
    id = obtener_chofer(credentials,db)
    hoja_de_ruta = db.exec(select(HDR).where(HDR.hdr_chofer_id == id, HDR.hdr_active == True)).first()

    if hoja_de_ruta is None:
        raise HTTPException(status_code=404, detail=f"Hoja de ruta no encontrada para el chofer con id {id}")

    novedades = db.exec(select(Novedad).where(Novedad.nov_hdr_id == hoja_de_ruta.hdr_id)).all()
    cargas = db.exec(select(Carga).where(Carga.car_hdr_id == hoja_de_ruta.hdr_id)).all()
    movimientos = db.exec(select(Movimiento).where(Movimiento.mov_hdr_id == hoja_de_ruta.hdr_id)).all()
    gastos = db.exec(select(Gasto).where(Gasto.gas_hdr_id == hoja_de_ruta.hdr_id)).all()
    tipo_vi = db.exec(select(TipoViatico)).all()
    viaticos= db.exec(select(Viatico).where(Viatico.vi_hdr_id == hoja_de_ruta.hdr_id)).all()

    cant_comb, cant_urea, km_recorridos, monto_gastos, adelantos, mov_permanencia = obtener_totales(cargas, movimientos,novedades, gastos, viaticos, tipo_vi)

    data = {
        "hoja_de_ruta": hoja_de_ruta,
        "batea": hoja_de_ruta.batea.bat_dominio,
        "destino":{"nombre": hoja_de_ruta.destino.des_nombre, "tipo": hoja_de_ruta.destino.tipo_destino.td_nombre},
        "flota": {"nombre":hoja_de_ruta.flota.flo_nombre ,"dominio": hoja_de_ruta.flota.flo_dom_tractor, "odometro": hoja_de_ruta.flota.flo_km_odo},
        "cant_novedades":len(novedades),
        "cant_comb_cargado":cant_comb,
        "cant_urea_cargada":cant_urea,
        "km_recorridos":(km_recorridos - hoja_de_ruta.flota.flo_km_odo),
        "monto_total_gastos":monto_gastos,
        "total_adelantos":adelantos["total_adelantos"],
        "total_via_nac":adelantos["total_via_nac"],
        "total_via_plus":adelantos["total_via_plus"],
        "mov_permanencia":mov_permanencia
    }
    return data

def obtener_totales(cargas, movimientos,novedades , gastos, viaticos, tipo_vi):
    cant_comb = 0
    cant_urea = 0
    km_recorridos = 0
    monto_gastos = 0
    ad=0
    nac=0
    plus=0
    adelanto=0
    nacional=0
    intern=0
    mov_permanencia = 0
    total_via={}

    if len(cargas) > 0:
        for carga in cargas:
            cant_comb += carga.car_lt_cargados
            cant_urea += carga.car_lt_urea_cargados
            if carga.car_km_odo > km_recorridos: km_recorridos = carga.car_km_odo
    
    if len(movimientos) > 0:
        for movimiento in movimientos:
            mov_permanencia += movimiento.mov_permanencia
            if movimiento.mov_km_odo_inicio > km_recorridos: km_recorridos = movimiento.mov_km_odo_inicio
            if movimiento.mov_km_odo_fin: 
                if movimiento.mov_km_odo_fin > km_recorridos: km_recorridos = movimiento.mov_km_odo_fin
                
    if len(novedades) > 0:
        for novedad in novedades:
            if novedad.nov_km_odo > km_recorridos: km_recorridos = novedad.nov_km_odo
    
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


    return cant_comb, cant_urea, km_recorridos, monto_gastos, total_via, mov_permanencia

@hdr_route.put('/desactivar/')
async def desactivar_hdr(comentario: str,credentials: JwtAuthorizationCredentials= Security(access_security), db=conn):
    id = obtener_chofer(credentials,db)
    statement = select(HDR).where(HDR.hdr_chofer_id == id, HDR.hdr_active==True)
    hoja_de_ruta = db.exec(statement).first()
    if hoja_de_ruta is None:
        raise HTTPException(status_code=404, detail="Hoja de ruta no encontrada")
    
    fecha_cierre = verificar_cierre_hdr(hoja_de_ruta, db)

    hoja_de_ruta.hdr_modif = fecha_cierre
    if hoja_de_ruta.hdr_comentarios:
        hoja_de_ruta.hdr_comentarios += f" {comentario}"
    else:
        hoja_de_ruta.hdr_comentarios = comentario
    hoja_de_ruta.hdr_active = False
    actualizar_cubiertas(hoja_de_ruta,"cierre",db)
    db.commit()

    return {"message": f"La hoja de ruta para el chofer con ID {id} ha sido cerrada"}

def verificar_cierre_hdr(hoja_de_ruta: HDR, db):
    fecha_actual = datetime.now(timezone.utc)
    novedades = db.exec(select(Novedad).where(Novedad.nov_hdr_id == hoja_de_ruta.hdr_id)).all()
    movimientos = db.exec(select(Movimiento).where(Movimiento.mov_hdr_id == hoja_de_ruta.hdr_id)).all()
    cargas = db.exec(select(Carga).where(Carga.car_hdr_id == hoja_de_ruta.hdr_id)).all()
    ultimo_movimiento = 0
    if len(movimientos) > 0:
        
        for movimiento in movimientos:
            if movimiento.mov_km_odo_fin is None or movimiento.mov_lugar_fin is None:
                raise HTTPException(status_code=409, detail="No se permite cerrar la Hoja de Ruta si existe un movimiento no finalizado")
            if ultimo_movimiento is None or movimiento.mov_km_odo_fin > ultimo_movimiento:
                ultimo_movimiento = movimiento.mov_km_odo_fin
        km_recorridos = sum(movimiento.mov_km_odo_fin - movimiento.mov_km_odo_inicio for movimiento in movimientos)
    else:
        # Verifico que pueda cerrar la HDR solo si no existen movimientos ni cargas
        # EN cargas tomo >1 porque la carga inicial se graba automaticamente al crear la HDR y no implica una carga de combustible real sino solo un hito
        if len(novedades) > 0 or len(cargas) > 1:
            raise HTTPException(status_code=409, detail="No se permite cerrar la Hoja de Ruta si no se han registrado movimientos y tiene novedades o cargas")
        return fecha_actual
        
    primer_carga = min(carga.car_km_odo for carga in cargas)

    def verificar_fecha(objeto, fecha_inicio, fecha_fin):
        fecha_inicio = fecha_inicio.replace(tzinfo=None)
        fecha_fin = fecha_fin.replace(tzinfo=None)

        if isinstance(objeto, Movimiento):
            return fecha_inicio <= objeto.mov_inicio <= fecha_fin and fecha_inicio <= objeto.mov_fin <= fecha_fin
        elif isinstance(objeto, Novedad):
            return fecha_inicio <= objeto.nov_fecha <= fecha_fin
        elif isinstance(objeto, Carga):
            return fecha_inicio <= objeto.car_fecha <= fecha_fin
        else:
            raise ValueError("Tipo de objeto no reconocido")
        
    def verificar_km(objeto, km_inicio, km_fin):
        if isinstance(objeto, Movimiento):
            return km_inicio <= objeto.mov_km_odo_inicio and objeto.mov_km_odo_inicio <= km_fin and \
                objeto.mov_km_odo_fin >= km_inicio and objeto.mov_km_odo_fin <= km_fin
        elif isinstance(objeto, Novedad):
            return km_inicio <= objeto.nov_km_odo and objeto.nov_km_odo <= km_fin
        elif isinstance(objeto, Carga):
            return km_inicio <= objeto.car_km_odo and objeto.car_km_odo <= km_fin

    for tipo_objeto, objetos in (("novedad", novedades), ("carga", cargas), ("movimiento", movimientos)):
        if len(objetos) > 0:
            for objeto in objetos:
                if not verificar_fecha(objeto, hoja_de_ruta.hdr_carga, fecha_actual):
                    if tipo_objeto == "movimiento":
                        descripcion = f"Lugar inicio: {objeto.mov_lugar_inicio}, Fecha inicio: {objeto.mov_inicio}"
                    elif tipo_objeto == "novedad":
                        descripcion = f"Lugar: {objeto.nov_lugar}, Fecha: {objeto.nov_fecha}, Descripción: {objeto.nov_desc}"
                    elif tipo_objeto == "carga":
                        descripcion = f"Lugar: {objeto.car_lugar}, Fecha: {objeto.car_fecha}, Litros cargados: {objeto.car_lt_cargados}"

                    hoja_de_ruta.hdr_comentarios = (
                        f"Error de Fecha en {tipo_objeto.capitalize()} - {descripcion}: Fecha fuera del rango"
                    )
                    # Opcionalmente, puedes levantar la excepción:
                    # raise HTTPException(status_code=409, detail=hoja_de_ruta.hdr_comentarios)

                if not verificar_km(objeto, primer_carga, ultimo_movimiento):
                    if tipo_objeto == "movimiento":
                        descripcion = f"Lugar inicio: {objeto.mov_lugar_inicio}, KM inicio: {objeto.mov_km_odo_inicio}, KM fin: {objeto.mov_km_odo_fin}"
                    elif tipo_objeto == "novedad":
                        descripcion = f"Lugar: {objeto.nov_lugar}, KM: {objeto.nov_km_odo}"
                    elif tipo_objeto == "carga":
                        descripcion = f"Lugar: {objeto.car_lugar}, KM: {objeto.car_km_odo}"

                    raise HTTPException(
                        status_code=409,
                        detail=f"Error de Kilómetros en {tipo_objeto.capitalize()} - {descripcion}: Kilómetros cargados fuera del rango"
                    )
                    
    if hoja_de_ruta.batea.bat_nombre != "Sin Batea":
        hoja_de_ruta.batea.bat_km += km_recorridos
    hoja_de_ruta.flota.flo_km_odo = ultimo_movimiento

    return fecha_actual

@hdr_route.post('/',response_model=HDR)
async def crear_hdr(nueva_hdr:HDRCreate,viat_nac: int = None, viat_plus:int = None, adel_viaje:int = None,credentials: JwtAuthorizationCredentials= Security(access_security),db=conn):
    id = obtener_chofer(credentials,db)
    hdr=HDR(**dict(nueva_hdr),hdr_chofer_id=id)
    flota = db.exec(select(Flota).where(Flota.flo_id == nueva_hdr.hdr_flota_id)).first()
    batea = db.exec(select(Batea).where(Batea.bat_id == nueva_hdr.hdr_batea_id)).first()
    check = checkear_cubiertas_para_hdr(db,flota.flo_dom_tractor,batea.bat_dominio)
    if check:
        raise HTTPException(status_code=409, detail=f"No se puede crear la HDR ya que una o mas cubiertas ({check}) se encuentran en el taller")
    if nueva_hdr.hdr_comentarios: nueva_hdr.hdr_comentarios = nueva_hdr.hdr_comentarios.strip() # hacer nulleable
    db.add(hdr)
    db.commit()
    db.refresh(hdr)
    # Estado inicial de combustible para este chofer/flota
    # CAmbiar car_km_odo agregando nuevo campo a hdr km inicial
    carga_inicial= Carga(
        car_hdr_id=hdr.hdr_id,
        car_fecha= hdr.hdr_carga,
        car_km_odo=hdr.flota.flo_km_odo,
        car_lugar="Inicio de viaje",
        car_lt_cargados=0,
        car_lt_urea_cargados=0,
        car_lng=-49.01101606763457,
        car_lat=-24.964616562468724,
        car_tanque_lleno=hdr.hdr_tanque_lleno,
        car_tanque_lleno_urea=False,
        car_ypf="CONTADO",
        car_sucursal="No aplica",
        car_observaciones="Inicio de hoja de ruta",
        car_tc_id=1,
        car_infraccion=False
        )
    db.add(carga_inicial)
    if viat_nac:
        viatico_nac= Viatico(
            vi_hdr_id=hdr.hdr_id,
            vi_monto=viat_nac,
            vi_fecha=datetime.now(),
            vi_tipo=2
        )
        db.add(viatico_nac)
    if viat_plus:
        viatico_plus= Viatico(
            vi_hdr_id=hdr.hdr_id,
            vi_monto=viat_plus,
            vi_fecha=datetime.now(),
            vi_tipo=3
        )
        db.add(viatico_plus)
    if adel_viaje:
        adelanto_viaje= Viatico(
            vi_hdr_id=hdr.hdr_id,
            vi_monto=adel_viaje,
            vi_fecha=datetime.now(),
            vi_tipo=1
        ) 
        db.add(adelanto_viaje)
    db.commit()
    actualizar_cubiertas(hdr,"apertura",db)
    return hdr

def checkear_eventos(hdr:HDR,db):
    novedades = db.exec(select(Novedad).where(Novedad.nov_hdr_id == hdr.hdr_id)).all()
    movimientos = db.exec(select(Movimiento).where(Movimiento.mov_hdr_id == hdr.hdr_id)).all()
    cargas = db.exec(select(Carga).where(Carga.car_hdr_id == hdr.hdr_id)).all()
    gastos = db.exec(select(Gasto).where(Gasto.gas_hdr_id == hdr.hdr_id)).all()

    if len(novedades) == 0 and len(movimientos) == 0 and len(cargas) == 1 and len(gastos) == 0: 
        return True
    else:
        return False

@hdr_route.put('/{hdr_id}', response_model=HDR)
async def actualizar_hdr(nueva_info_hdr: HDRCreate,credentials: JwtAuthorizationCredentials= Security(access_security) , db=conn):
    id = obtener_chofer(credentials,db)
    hdr_existente = db.exec(select(HDR).where(HDR.hdr_chofer_id == id, HDR.hdr_active==True)).first()

    if hdr_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la hoja de ruta para el chofer con ID {id}")
    
    bool_eventos = checkear_eventos(hdr_existente,db)

    if bool_eventos == False:
        raise HTTPException(status_code=409, detail=f"No se debe modificar la HDR si ya existen eventos cargados")

    hdr_existente.hdr_modif = datetime.now()
    for key, value in nueva_info_hdr.model_dump().items():
        setattr(hdr_existente, key, value)

    db.commit()
    db.refresh(hdr_existente)
    carga = db.exec(select(Carga).where(Carga.car_hdr_id == hdr_existente.hdr_id,Carga.car_lugar == "Inicio de viaje")).first()
    flota = db.exec(select(Flota).where(Flota.flo_id == hdr_existente.hdr_flota_id)).first()
    carga.car_km_odo = flota.flo_km_odo
    carga.car_tanque_lleno = hdr_existente.hdr_tanque_lleno
    carga.car_tanque_lleno_urea = hdr_existente.hdr_tanque_lleno_urea
    db.commit()
    return hdr_existente

@hdr_route.delete('/{hdr_id}', response_model=dict)
async def eliminar_hdr(hdr_id: int, db=conn):
    hdr_existente = db.exec(select(HDR).where(HDR.hdr_id == hdr_id)).first()

    if hdr_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la hoja de ruta con ID {hdr_id}")

    db.delete(hdr_existente)
    db.commit()

    return {"mensaje": f"Hoja de ruta con ID {hdr_id} eliminada exitosamente"}

# @hdr_route.put('/viatico/{hdr_id}')
# async def agregar_viatico_hdr(hdr_id:int,viatico_nacional: Optional[int] = None, adelanto_viaje:Optional[int]= None, viatico_plus:Optional[int]= None, db=conn):
#     hdr_existente = db.exec(select(HDR).where(HDR.hdr_id == hdr_id)).first()

#     if hdr_existente is None:
#         raise HTTPException(status_code=404, detail=f"No se encontró la hoja de ruta con ID {hdr_id}")
    
#     if viatico_nacional:hdr_existente.hdr_viatico_nac += viatico_nacional
#     if adelanto_viaje: hdr_existente.hdr_adelanto += adelanto_viaje
#     if viatico_plus: hdr_existente.hdr_viatico_plus += viatico_plus

#     db.commit()
#     db.refresh(hdr_existente)

#     data = {
#         "Viat Nac" :hdr_existente.hdr_viatico_nac,
#         "Adel Viaje": hdr_existente.hdr_adelanto,
#         "Viat Plus": hdr_existente.hdr_viatico_plus
#     }

#     return f"Nuevos valores: Viat Nac {hdr_existente.hdr_viatico_nac}$, Viat Plus {hdr_existente.hdr_adelanto}$, Adelanto {hdr_existente.hdr_viatico_plus}$"

@hdr_route.get('/ultimo_km')
async def consultar_ultimo_km_hdr(credentials: JwtAuthorizationCredentials= Security(access_security) , db=conn):
    id = obtener_chofer(credentials,db)
    hdr_existente = db.exec(select(HDR).where(HDR.hdr_chofer_id == id, HDR.hdr_active == True)).first()
    
    if hdr_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la hoja de ruta para el chofer con ID {id}")
    
    return obtener_km_actuales(hdr_existente, db)

def obtener_km_actuales(hdr, db):
    movimientos = db.exec(select(Movimiento).where(Movimiento.mov_hdr_id == hdr.hdr_id)).all()
    km_recorridos = hdr.flota.flo_km_odo

    if len(movimientos) > 0:
        for movimiento in movimientos:
            if movimiento.mov_km_odo_fin:
                km_recorridos += (movimiento.mov_km_odo_fin - movimiento.mov_km_odo_inicio)
            if movimiento.mov_km_odo_inicio > km_recorridos: km_recorridos = movimiento.mov_km_odo_inicio
            if movimiento.mov_km_odo_fin: 
                if movimiento.mov_km_odo_fin > km_recorridos: km_recorridos = movimiento.mov_km_odo_fin
    return km_recorridos