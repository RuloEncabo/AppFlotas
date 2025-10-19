from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from user import Usuario
    
class Rol(SQLModel, table=True):
    rol_id: Optional[int] = Field(default=None, primary_key=True)
    rol_nombre:str
    
    usuario:Optional['Usuario'] = Relationship(back_populates="rol")
    
    
   