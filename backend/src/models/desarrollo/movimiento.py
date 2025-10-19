from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine

if TYPE_CHECKING:
    from models.desarrollo.tipo_kilometro import TipoKilometro

class MovimientoCreate(SQLModel):
    mov_hdr_id: int = Field(..., foreign_key=("hdr.hdr_id"))
    mov_inicio: datetime
    mov_inicio_real: datetime
    mov_fin: Optional[datetime] = None
    mov_fin_real: Optional[datetime] = None
    mov_lat_inicio: Optional[float]
    mov_lng_inicio: Optional[float]
    mov_lat_fin: Optional[float]
    mov_lng_fin: Optional[float]
    mov_km_odo_inicio: int = Field(default=0, ge=0)
    mov_km_odo_fin: Optional[int] = Field(default=None, ge=0)
    mov_tipo_km_id: int = Field(...,foreign_key="tipokilometro.tk_id") 
    mov_lugar_inicio: str = Field(..., min_length=3,max_length=60)
    mov_lugar_fin: Optional[str] = Field(default=None,max_length=60)
    mov_lleva_carga: bool=False
    mov_permanencia: int = Field(default=0, ge=0)
    mov_cruce_frontera: bool=False
    
class Movimiento(MovimientoCreate, table=True):
    mov_id: Optional[int] = Field(default=None, primary_key=True)

    tipokm:Optional['TipoKilometro'] = Relationship(back_populates="movimiento")

crud = CRUDManager(Movimiento,engine)

    
