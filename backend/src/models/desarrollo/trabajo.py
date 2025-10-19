from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine

class TrabajoCreate(SQLModel):
    tra_des:str = Field(..., min_length=3,max_length=200) 
    tra_nombre:str = Field(..., min_length=3,max_length=200) 

    
class Trabajo(TrabajoCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
crud = CRUDManager(Trabajo,engine)