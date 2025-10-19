from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
if TYPE_CHECKING:
    from models.desarrollo.viatico import Viatico

class TipoViaticoCreate(SQLModel):
    tv_nombre: str = Field(None, min_length=3,max_length=60)
    tv_des: str = Field(None, min_length=1, max_length=5)
    

class TipoViatico(TipoViaticoCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    viatico: Optional['Viatico'] = Relationship(back_populates="tipo_viatico")

crud = CRUDManager(TipoViatico,engine)