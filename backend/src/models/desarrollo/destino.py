from sqlmodel import SQLModel, Field, Relationship
from typing import Optional,TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
if TYPE_CHECKING:
    from models.desarrollo.hdr import HDR
    from models.desarrollo.tipo_destino import TipoDestino

class DestinoCreate(SQLModel):
    des_nombre:str = Field(..., min_length=3,max_length=60)
    des_tipo:int = Field(...,foreign_key=("tipodestino.td_id"))
    
class Destino(DestinoCreate, table=True):
    des_id: Optional[int] = Field(default=None, primary_key=True)

    hdr: Optional['HDR'] = Relationship(back_populates="destino")
    tipo_destino: Optional['TipoDestino'] = Relationship(back_populates="destino")

crud = CRUDManager(Destino,engine)