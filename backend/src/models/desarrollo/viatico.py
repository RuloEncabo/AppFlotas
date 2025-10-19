from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from models.desarrollo.tipo_viatico import TipoViatico
class ViaticoCreate(SQLModel):
    vi_hdr_id:int = Field(..., foreign_key=("hdr.hdr_id"))
    vi_monto: float
    vi_fecha: datetime
    vi_tipo: int = Field(..., foreign_key=("tipoviatico.id"))
    
class Viatico(ViaticoCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    tipo_viatico: Optional['TipoViatico'] = Relationship(back_populates="viatico")

crud = CRUDManager(Viatico,engine)