from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
from enum import Enum
if TYPE_CHECKING:
    from models.desarrollo.ot_nov import OT_Nov
class EstadoType(str, Enum):
    PENDIENTE = "PENDIENTE"
    RESUELTA = "RESUELTA"
    ASIGNADA = "ASIGNADA"
    ATENDIDA = "ATENDIDA"
    CERRADA = "CERRADA"

class NovedadCreate(SQLModel):
    nov_hdr_id: int = Field(..., foreign_key=("hdr.hdr_id"))
    nov_fecha: datetime
    nov_lugar: str = Field(None, min_length=3,max_length=60)
    nov_desc: Optional[str] = Field(None,max_length=255)
    nov_km_odo: int = Field(default=0, ge=0)
    nov_cat_id: int = Field(..., foreign_key=("catnovedad.cn_id"))
    nov_img: str
    nov_solucionado: bool
    nov_tractor: bool = Field(default=True)
    nov_observaciones: Optional[str] = Field(None,max_length=255)
    nov_estado: EstadoType
    
class Novedad(NovedadCreate, table=True):
    nov_id: Optional[int] = Field(default=None, primary_key=True)
    nov_infraccion: bool  = Field(default=False)

    ot_nov: List["OT_Nov"] = Relationship(back_populates="novedad")
crud = CRUDManager(Novedad,engine)