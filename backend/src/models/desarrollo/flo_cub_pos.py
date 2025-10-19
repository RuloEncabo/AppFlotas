from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
from models.desarrollo.cubierta import Cubiertas
from datetime import date

class FloCubPosCreate(SQLModel):
    fc_id:int = Field(..., foreign_key=("flotacubiertas.fc_id")) 
    cub_id:int = Field(..., foreign_key=("cubiertas.cub_id"))
    pos_id:int = Field(..., foreign_key=("posicion.id"))
    km_base:int
    fecha_rotacion:date|None = None
class FloCubPos(FloCubPosCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    cubierta: Optional[Cubiertas] = Relationship()
    
crud = CRUDManager(FloCubPos,engine)