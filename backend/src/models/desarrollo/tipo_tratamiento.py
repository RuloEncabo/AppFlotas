from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine

class TipoTratamientoCreate(SQLModel):
    tt_des:str = Field(..., min_length=3,max_length=200) 
    tt_nombre:str = Field(..., min_length=3,max_length=200) 

    
class TipoTratamiento(TipoTratamientoCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
crud = CRUDManager(TipoTratamiento,engine)