from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine

if TYPE_CHECKING:
    from models.desarrollo.flota import Flota
    from models.desarrollo.carga_combustible import Carga

class TipoCombustibleCreate(SQLModel):
    tc_nombre: str = Field(None, min_length=3,max_length=60)
    

class TipoCombustible(TipoCombustibleCreate, table=True):
    tc_id: Optional[int] = Field(default=None, primary_key=True)
    
    flota:Optional[list['Flota']] = Relationship(back_populates="combustible")
    carga:Optional[list['Carga']] = Relationship(back_populates="car_comb")

crud = CRUDManager(TipoCombustible,engine)
    