from datetime import datetime,date
from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select, SQLModel
from fastapi_jwt import JwtAuthorizationCredentials
#from data.functions.security import access_security

from database import get_db
from models.desarrollo.flota_cubiertas import FlotaCubiertas, FlotaCubiertasCreate
from models.desarrollo.flo_cub_pos import FloCubPos
from models.desarrollo.cubierta import Cubiertas
from models.desarrollo.flota import Flota
from data.functions.recorrido import cambiar_cubierta, rotar_cubierta
from models.desarrollo.batea import Batea
from models.desarrollo.historico import Historico
from data.functions.check_cubiertas import checkear_cubiertas_en_flotas, checkear_posicion_cubierta

flota_cubiertas_route = APIRouter(prefix="/flota_cubiertas")

conn:Session = Depends(get_db)


@flota_cubiertas_route.get('/')
async def obtener_flota_cubiertas(db=conn):
    statement = select(FlotaCubiertas)
    data = db.exec(statement).all()
    return data

@flota_cubiertas_route.get('/{flota_cubiertas_id}')
async def obtener_flota_cubiertas(flota_cubiertas_id: int, db=conn):
    flota_cubiertas = db.exec(select(FlotaCubiertas).where(FlotaCubiertas.fc_id == flota_cubiertas_id)).first()
    
    if flota_cubiertas is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la Flota Cubierta para el ID {flota_cubiertas_id}")

    return flota_cubiertas

@flota_cubiertas_route.get('/patente/{patente}')
async def obtener_flota_cubiertas_por_patente(patente: str, db=conn):
    flota_cubiertas = db.exec(select(FlotaCubiertas).where(FlotaCubiertas.fc_patente == patente)).first()
    fc_tipo_ = 0
    if flota_cubiertas is None:
        flota = db.exec(select(Flota).where(Flota.flo_dom_tractor == patente)).first()
        fc_tipo_ = 1
        if flota is None: 
            batea = db.exec(select(Batea).where(Batea.bat_dominio == patente)).first()
            if batea is None: raise HTTPException(status_code=404, detail=f"No se encontró la Flota o Batea con patente {patente}")
            fc_tipo_ = 2
        nuevo_fc =  FlotaCubiertas(
                fc_fecha= datetime.today(),
                fc_patente= patente,
                fc_tipo= fc_tipo_,
                fc_km_odo= 0#PARTE DE TRATAMIENTO
            )
        db.add(nuevo_fc)
        db.commit()
        db.refresh(nuevo_fc)
        flota_cubiertas = nuevo_fc
    
    list_data = []
    posiciones:FloCubPos = db.exec(select(FloCubPos).where(FloCubPos.fc_id == flota_cubiertas.fc_id).order_by(FloCubPos.pos_id)).all()
    rango = range(1, 8) if flota_cubiertas.fc_tipo == 1 else range(8, 18)
    for x in rango:
        posicion_encontrada = False
        for posicion in posiciones:
            if posicion.pos_id == x:
                data= {"POSICION":x,
                       "ID_CUBIERTA":posicion.cubierta.cub_id,
                       "NRO_INTERNO":posicion.cubierta.cub_nro_interno,
                       "SERIE":posicion.cubierta.cub_serie,
                       "MODELO":posicion.cubierta.cub_modelo,
                       "MM":posicion.cubierta.cub_mm,
                       "PRESION":posicion.cubierta.cub_presion,
                       "KM_BASE":posicion.km_base,
                       "KM_ROTAR":(posicion.cubierta.cub_pos_actual),
                       "OBSERVACION":posicion.cubierta.cub_observaciones}
                list_data.append(data)
                posicion_encontrada = True
                break
        if not posicion_encontrada:
            data = {
                "POSICION": x,
                "ID_CUBIERTA":None,
                "NRO_INTERNO": None,
                "SERIE": None,
                "MODELO": None,
                "MM": None,
                "PRESION": None,
                "KM_BASE":None,
                "KM_ROTAR":None,
                "OBSERVACION": None
            }
            list_data.append(data)
        

    return {"FLOTA_CUBIERTAS":flota_cubiertas,
            "POSICIONES":list_data}

class Recambio(SQLModel):
    fc_id:int
    cub_id:int
    pos_id:int
    km_base:int
    numero_interno:int
    km_ot:int
    dep_id:int | None

@flota_cubiertas_route.put('/cambiarCubierta/')
async def cambiar_flota_cubiertas_por_patente(recambio:Recambio,db=conn):
    cambiar_cubierta(recambio,db)
    return "Cubiertas cambiadas exitosamente"


@flota_cubiertas_route.put('/modificar/{patente}')
async def modificar_flota_cubiertas_por_patente(patente: str, posicion:int, mm:float= None, presion:float= None, observacion: str= None, db=conn):
    flota_cubiertas = db.exec(select(FlotaCubiertas).where(FlotaCubiertas.fc_patente == patente)).first()
    
    if flota_cubiertas is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la Flota Cubierta para la patente {patente}")

    cubierta = db.exec(select(FloCubPos).where(FloCubPos.fc_id == flota_cubiertas.fc_id, FloCubPos.pos_id == posicion)).first()

    if cubierta is None:
        raise HTTPException(status_code=404, detail=f"No se encontró ninguna cubierta en la posicion {posicion}")
    
    cub_ = db.exec(select(Cubiertas).where(Cubiertas.cub_id == cubierta.cub_id)).first()

    if mm: cubierta.cubierta.cub_mm = mm
    if presion: cubierta.cubierta.cub_presion = presion
    if observacion: cubierta.cubierta.cub_observaciones = observacion
    patente = checkear_cubiertas_en_flotas(cub_.cub_id,db)
    posicion = checkear_posicion_cubierta(db, cub_.cub_id)
    reajuste_historico = Historico(
            his_cub_id=cub_.cub_id,
            his_fecha=datetime.today(),
            his_km=cub_.cub_km_recorridos,
            his_mm=cub_.cub_mm,
            his_accion="REAJUSTE",
            his_valor = mm,
            his_deposito= cub_.deposito.dep_nombre if patente == None else "Rodando",
            his_tractor=patente if patente != None else "Rodando",
            his_posicion=posicion if posicion != None else 'No Ubicada',
            his_observaciones=observacion if observacion != None else "Sin Observaciones",
        )
    db.add(reajuste_historico)
    db.commit()
    db.refresh(cubierta)
    return cubierta

class Rotacion(SQLModel):
    fc_id:int
    cub_id_1:int
    cub_pos_1:int
    km_base_1:int
    cub_id_2:int
    cub_pos_2:int
    km_base_2:int
    km_ot:int

@flota_cubiertas_route.put("/rotarCubierta/")
async def rotar_cubiertas(rotacion:Rotacion, db=conn):
    # Actualizo km base para nueva rotacion
    rotar_cubierta(rotacion,db)
    # Actualizo nuevas posiciones de cubiertas
    pos1 = db.exec(select(FloCubPos).where(FloCubPos.fc_id == rotacion.fc_id, FloCubPos.pos_id == rotacion.cub_pos_1)).first()
    pos2 = db.exec(select(FloCubPos).where(FloCubPos.fc_id == rotacion.fc_id, FloCubPos.pos_id == rotacion.cub_pos_2)).first()
    pos1.cub_id= rotacion.cub_id_2
    pos1.km_base = rotacion.km_base_2
    pos1.fecha_rotacion = date.today()
    pos2.cub_id= rotacion.cub_id_1
    pos2.km_base = rotacion.km_base_1
    pos2.fecha_rotacion = date.today()
    db.add(pos1)
    db.add(pos2)
    db.commit()
    return "Cubiertas rotadas exitosamente"

@flota_cubiertas_route.post('/',response_model=FlotaCubiertas)
async def crear_flota_cubiertas(nuevo_fc:FlotaCubiertasCreate, db=conn):
    flota_cubiertas= FlotaCubiertas(**dict(nuevo_fc))
    db.add(flota_cubiertas)
    db.commit()
    db.refresh(flota_cubiertas)
    return flota_cubiertas

@flota_cubiertas_route.delete('/{flota_cubiertas_id}')
async def eliminar_flota_cubiertas(flota_cubiertas_id: int, db=conn):
    sql = select(FlotaCubiertas).where(FlotaCubiertas.fc_id == flota_cubiertas_id)
    flota_cubiertas = db.exec(sql).first()
    if flota_cubiertas is None:
        raise HTTPException(status_code=404, detail=f"No se encontró la Flota Cubierta con ID {flota_cubiertas_id}")

    db.delete(flota_cubiertas)
    db.commit()

    return {"mensaje": f"Flota Cubierta con ID {flota_cubiertas} eliminada exitosamente"}