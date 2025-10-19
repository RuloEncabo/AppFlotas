from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine

if TYPE_CHECKING:
    from models.desarrollo.orden_trabajo import OT
    from models.desarrollo.novedad import Novedad

class OT_NovCreate(SQLModel):
    ot_id: int = Field(..., foreign_key=("ot.ot_id"))
    nov_id: int = Field(..., foreign_key=("novedad.nov_id"))
    cumplida: bool 
    fecha: datetime
    observaciones: str = Field(None, min_length=3,max_length=200)
    
class OT_Nov(OT_NovCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    ot:Optional['OT'] = Relationship(back_populates="ot_nov")
    novedad: Optional['Novedad'] = Relationship(back_populates="ot_nov")
    
crud = CRUDManager(OT_Nov,engine)
