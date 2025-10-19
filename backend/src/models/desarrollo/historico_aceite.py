from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
from enum import Enum

if TYPE_CHECKING:
    from models.desarrollo.tipo_aceite import TipoAceite
    from models.desarrollo.taller import Taller

class HistoricoAceiteCreate(SQLModel):
    hist_flota_patente: str 
    hist_aceite_fecha_cambio: datetime
    hist_aceite_fecha_ultimo_cambio: Optional[datetime] = None
    hist_tipo_aceite: Optional[int] = Field(default=None, foreign_key="tipoaceite.id")
    hist_ultimo_tipo_aceite: Optional[int] = Field(default=None, foreign_key="tipoaceite.id")
    hist_taller: Optional[int] = Field(default=None, foreign_key="taller.id")
    hist_aceite_km: str
    hist_user_flota: str

    
class HistoricoAceite(HistoricoAceiteCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    taller: Optional['Taller'] = Relationship(back_populates="historico_aceite")
    # Relación con el aceite actual
    tipo_aceite: Optional['TipoAceite'] = Relationship(
        back_populates="historico_actual", 
        sa_relationship_kwargs={"foreign_keys": "HistoricoAceite.hist_tipo_aceite"}
    )

    # Relación con el último tipo de aceite
    ultimo_tipo_aceite: Optional['TipoAceite'] = Relationship(
        back_populates="historico_ultimo", 
        sa_relationship_kwargs={"foreign_keys": "HistoricoAceite.hist_ultimo_tipo_aceite"}
    )

crud = CRUDManager(HistoricoAceite,engine)