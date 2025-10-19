from sqlmodel import SQLModel, Field, TIMESTAMP,text, Relationship
from sqlalchemy import Column, String
from typing import Optional, TYPE_CHECKING
from pydantic import EmailStr
from datetime import datetime

if TYPE_CHECKING:
    from rol import Rol
    from desarrollo.chofer import Chofer


class UsuarioLogin(SQLModel):
    usr_email: EmailStr = Field(sa_column=Column("usr_email",String, index=True, unique=True))
    usr_password:str

class UsuarioCreate(UsuarioLogin):
    usr_nombre:str
    usr_apellido:str
    
class Usuario(UsuarioCreate, table=True):
    usr_id: Optional[int] = Field(default=None, primary_key=True)
    usr_rol_id:Optional[int] = Field(default=None,foreign_key="rol.rol_id")
    usr_alta:Optional[datetime] = Field(default=None,sa_column=Column(TIMESTAMP(timezone=True),nullable=False,server_default=text("CURRENT_TIMESTAMP")))
    usr_enable:bool = True
    rol:Optional['Rol'] = Relationship(back_populates="usuario")
    chofer:Optional['Chofer'] = Relationship(back_populates='user')
    
