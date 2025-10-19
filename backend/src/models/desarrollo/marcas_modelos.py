from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine

class MarcaModeloCreate(SQLModel):
    marca:str = Field(..., min_length=3,max_length=50) 
    modelo:str = Field(..., min_length=3,max_length=100) 

    
class MarcaModelo(MarcaModeloCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
crud = CRUDManager(MarcaModelo,engine)