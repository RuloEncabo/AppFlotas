from sqlmodel import SQLModel, Field
from typing import Optional
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine

class TipoPeajeCreate(SQLModel):
    tip_peaje_nombre:str
    

class TipoPeaje(TipoPeajeCreate, table=True):
    tip_peaje_id: Optional[int] = Field(default=None, primary_key=True)

crud = CRUDManager(TipoPeaje,engine)


