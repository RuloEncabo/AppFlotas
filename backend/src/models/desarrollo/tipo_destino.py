from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
if TYPE_CHECKING:
    from models.desarrollo.destino import Destino

class TipoDestinoCreate(SQLModel):
    td_nombre:str = Field(None, min_length=3,max_length=60)
    
class TipoDestino(TipoDestinoCreate, table=True):
    td_id: Optional[int] = Field(default=None, primary_key=True)

    destino: Optional['Destino'] = Relationship(back_populates="tipo_destino")

crud = CRUDManager(TipoDestino,engine)