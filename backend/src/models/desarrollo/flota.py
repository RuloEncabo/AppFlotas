from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
from datetime import datetime

if TYPE_CHECKING:
    from models.desarrollo.tipo_combustible import TipoCombustible
    from models.desarrollo.hdr import HDR

class FlotaCreate(SQLModel):
    flo_nombre:str = Field(None, min_length=3,max_length=60)
    flo_dom_tractor: str #regex patentes
    flo_km_odo: int = Field(..., ge=0)
    flo_combust_id: Optional[int] = Field(foreign_key="tipocombustible.tc_id")
    flo_fecha_aceite: datetime | None = None
    flo_km_aceite: int = Field(default=0)
    
    
class Flota(FlotaCreate, table=True):
    flo_id: Optional[int] = Field(default=None, primary_key=True)
   
    combustible:Optional['TipoCombustible'] = Relationship(back_populates="flota")
    hdr: Optional['HDR'] = Relationship(back_populates="flota")

crud = CRUDManager(Flota,engine)