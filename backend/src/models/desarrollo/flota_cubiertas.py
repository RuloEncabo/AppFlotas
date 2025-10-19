from datetime import date
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine

class FlotaCubiertasCreate(SQLModel):
    fc_fecha:date
    fc_patente:str = Field(..., min_length=3,max_length=10) 
    fc_tipo:int
    fc_km_odo:int

    
class FlotaCubiertas(FlotaCubiertasCreate, table=True):
    fc_id: Optional[int] = Field(default=None, primary_key=True)
    
crud = CRUDManager(FlotaCubiertas,engine)