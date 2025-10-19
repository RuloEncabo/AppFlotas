from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_db
from models.desarrollo.gasto import Gasto, GastoCreate
from datetime import datetime

from models.desarrollo.hdr import HDR

gasto_route = APIRouter(prefix="/gastos")

conn:Session = Depends(get_db)

@gasto_route.get('/')
async def leer_gastos(db=conn):
    statement = select(Gasto)
    data = db.exec(statement).all()
    return data

@gasto_route.delete('/{gasto_id}')
async def eliminar_gasto(gasto_id: int, db=conn):
    sql = select(Gasto).where(Gasto.gas_id == gasto_id)
    gasto = db.exec(sql).first()
    if gasto is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el gasto con ID {gasto_id}")

    db.delete(gasto)
    db.commit()

    return {"mensaje": f"Gasto con ID {gasto_id} eliminado exitosamente"}

@gasto_route.get('/{hdr_id}')
async def leer_gastos_hdr(hdr_id: int, db=conn):
    sql = select(Gasto).where(Gasto.gas_hdr_id == hdr_id)
    gastos = db.exec(sql).all()
    
    if len(gastos) == 0:
        raise HTTPException(status_code=404, detail=f"No se encontraron gastos para la Hoja de ruta: {hdr_id}")
    
    list_gastos = []
    for gasto in gastos:
        data = {"Gasto":gasto,
                "Categoria": gasto.cat_nov.cn_nombre}
        list_gastos.append(data)

    return list_gastos

@gasto_route.post('/',response_model=Gasto)
async def crear_gasto(nuevo_gasto:GastoCreate, db=conn):
    gasto=Gasto(**dict(nuevo_gasto))
    hoja_de_ruta = db.exec(select(HDR).where(HDR.hdr_id == gasto.gas_hdr_id)).first()
    
    if hoja_de_ruta is None:
        raise HTTPException(status_code=404, detail=f"No se encontro la hoja de ruta")
    
    fecha_actual = datetime.now()
    hoja_de_ruta.hdr_modif = fecha_actual
    db.add(gasto)
    db.commit()
    db.refresh(gasto)
    return gasto

@gasto_route.put('/{gasto_id}', response_model=Gasto)
async def actualizar_gasto(gasto_id:int, nueva_info_gasto: GastoCreate, db=conn):
    gasto_existente = db.exec(select(Gasto).where(Gasto.gas_id == gasto_id)).first()

    if gasto_existente is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el gasto con ID {gasto_id}")

    for key, value in nueva_info_gasto.model_dump().items():
        setattr(gasto_existente, key, value)

    db.commit()
    db.refresh(gasto_existente)
    return gasto_existente