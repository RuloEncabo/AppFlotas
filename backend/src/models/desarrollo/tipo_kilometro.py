from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine

if TYPE_CHECKING:
    from models.desarrollo.movimiento import Movimiento

class TipoKilometroCreate(SQLModel):
    tk_nombre: str = Field(None, min_length=3,max_length=60)
    

class TipoKilometro(TipoKilometroCreate, table=True):
    tk_id: Optional[int] = Field(default=None, primary_key=True)
    
    movimiento:Optional[list['Movimiento']] = Relationship(back_populates="tipokm")

crud = CRUDManager(TipoKilometro,engine)