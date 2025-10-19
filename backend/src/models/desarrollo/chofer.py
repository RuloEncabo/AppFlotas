from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
if TYPE_CHECKING:
    from seguridad.user import Usuario
    from models.desarrollo.hdr import HDR

class ChoferCreate(SQLModel):
    cho_dni:str = Field(None, min_length=7,max_length=9)
    
class Chofer(ChoferCreate, table=True):
    chofer_id: Optional[int] = Field(default=None, primary_key=True)
    usr_id: int = Field(...,foreign_key="usuario.usr_id") 
    
    user:Optional['Usuario']= Relationship(back_populates="chofer")
    hdr: Optional['HDR'] = Relationship(back_populates="chofer")

crud = CRUDManager(Chofer,engine)