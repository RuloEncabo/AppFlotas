from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
if TYPE_CHECKING:
    from models.desarrollo.hdr import HDR

class BateaCreate(SQLModel):
    bat_nombre:str = Field(..., min_length=3,max_length=60)
    bat_dominio:str #regex patentes
    bat_km:int
    
class Batea(BateaCreate, table=True):
    bat_id: Optional[int] = Field(default=None, primary_key=True)
    
    hdr: Optional['HDR'] = Relationship(back_populates="batea")

crud = CRUDManager(Batea,engine)