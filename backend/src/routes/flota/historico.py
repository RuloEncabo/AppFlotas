from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session,select

from database import get_db
from models.desarrollo.historico import Historico,HistoricoCreate,crud
from models.desarrollo.cubierta import Cubiertas

historico_route = APIRouter(prefix="/historico")

conn:Session = Depends(get_db)

@historico_route.get('/')
async def ver_historico(db=conn):
    query = select(Historico)
    results = db.exec(query).all()
    list_data = []
    for result in results:
        data = {"his_nro_interno": result.cubiertas.cub_nro_interno,
                "his_fecha": result.his_fecha,
                "his_km": result.his_km,
                "his_mm": result.his_mm,
                "his_accion": result.his_accion,
                "his_valor": result.his_valor,
                "his_deposito" : result.his_deposito,
                "his_tractor": result.his_tractor,
                "his_posicion":result.his_posicion,
                "his_observaciones": result.his_observaciones,
                }
        list_data.append(data)
    return list_data

@historico_route.get('/{id_cubierta}')
async def ver_historico_por_id(
    id_cubierta: int,
    accion: str = None,
    columname: str = "his_fecha",  # Nombre de la columna para ordenar
    order: bool = False,          # Dirección de ordenamiento: False (ascendente), True (descendente)
    db=conn
):
    query = select(Historico).where(Historico.his_cub_id == id_cubierta)
    cubierta = db.exec(select(Cubiertas).where(Cubiertas.cub_id == id_cubierta)).first()

    if accion:
        if accion not in ["ALTA", "BAJA", "DEFINITIVA", "ROTACION", "UBICACION", "RECAPADO", "REPARACION", "MANTENIMIENTO", "DESGASTE"]:
            raise HTTPException(status_code=400, detail="La acción proporcionada no es válida.")
        query = query.where(Historico.his_accion == accion)

    results = db.exec(query).all()

    # Definir las columnas disponibles para el ordenamiento
    columnas_orden = {
        "his_fecha": lambda x: x.his_fecha,
        "his_km": lambda x: x.his_km,
        "his_mm": lambda x: x.his_mm,
        "his_accion": lambda x: x.his_accion,
        "his_valor": lambda x: x.his_valor,
        "his_deposito": lambda x: x.his_deposito,
        "his_tractor": lambda x: x.his_tractor,
        "his_posicion": lambda x: x.his_posicion,
        "his_observaciones": lambda x: x.his_observaciones
    }

    # Verificar si el nombre de la columna es válido
    if columname not in columnas_orden:
        raise HTTPException(status_code=400, detail=f"La columna '{columname}' no es válida para el ordenamiento.")

    # Ordenar los resultados
    results.sort(key=columnas_orden[columname], reverse=order)

    data = {
        "km_actual": cubierta.cub_km_recorridos,
        "historicos": results
    }
    return data

@historico_route.post('/')
async def crear_historico(nuevo_historico: HistoricoCreate):
    return crud.create(nuevo_historico)
