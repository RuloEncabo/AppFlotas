from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
from enum import Enum

if TYPE_CHECKING:
    from models.desarrollo.cubierta import Cubiertas

class AccionType(str, Enum):
    RECAPADO = "RECAPADO"
    REPARACION = "REPARACION"
    MANTENIMIENTO = "MANTENIMIENTO"
    DESGASTE = "DESGASTE" 
    ALTA = "ALTA"
    BAJA="BAJA"
    DEFINITIVA="DEFINITIVA"
    ROTACION="ROTACION"
    UBICACION="UBICACION" 
    MOVIMIENTO_INTERNO="MOVIMIENTO INTERNO"
    REAJUSTE="REAJUSTE"

class HistoricoCreate(SQLModel):
    his_cub_id: int = Field(..., foreign_key=("cubiertas.cub_id"))
    his_fecha: datetime
    his_km: int = Field(default=0, ge=0)
    his_mm: int = Field(default=0, ge=0)
    his_accion: AccionType
    his_valor: int|None = None
    his_deposito: str | None
    his_tractor: str | None
    his_posicion: str | None 
    his_observaciones: Optional[str] = Field(None,max_length=255)
    
class Historico(HistoricoCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    cubiertas: Optional['Cubiertas'] = Relationship(back_populates="historico")

crud = CRUDManager(Historico,engine)