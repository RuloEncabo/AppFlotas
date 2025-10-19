from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_db
from models.desarrollo.historico_aceite import HistoricoAceite, HistoricoAceiteCreate, crud

hist_aceite_route = APIRouter(prefix="/hist_aceite")

conn:Session = Depends(get_db)

@hist_aceite_route.get('/')
async def ver_hist_aceites(db=conn):
    query = select(HistoricoAceite)
    results = db.exec(query).all()
    list_data = []
    for result in results:
        data = {
            "id": result.id,
            "hist_flota_patente": result.hist_flota_patente,
            "hist_aceite_fecha_cambio": result.hist_aceite_fecha_cambio,
            "hist_aceite_fecha_ultimo_cambio": result.hist_aceite_fecha_ultimo_cambio if result.hist_aceite_fecha_ultimo_cambio else None,
            "hist_tipo_aceite": result.tipo_aceite.ta_nombre if result.tipo_aceite else None,
            "hist_ultimo_tipo_aceite": result.ultimo_tipo_aceite.ta_nombre if result.ultimo_tipo_aceite else None,
            "hist_taller": result.taller.taller_nombre if result.taller else None,
            "hist_aceite_km": result.hist_aceite_km,
            "hist_user_flota": result.hist_user_flota
        }
        list_data.append(data)
    return list_data

@hist_aceite_route.post('/')
async def crear_hist_aceite(nuevo_hist_aceite: HistoricoAceiteCreate):
    return crud.create(nuevo_hist_aceite)

@hist_aceite_route.delete('/')
async def borrar_hist_aceite(hist_aceite_a_eliminar: int):
    return crud.delete(hist_aceite_a_eliminar)