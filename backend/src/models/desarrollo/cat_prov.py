from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
if TYPE_CHECKING:
    from models.desarrollo.proveedores import Proveedores

class CategoriaProveedoresCreate(SQLModel):
    cp_nombre:str = Field(None, min_length=3,max_length=60)
    
class CategoriaProveedores(CategoriaProveedoresCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    proveedores: Optional['Proveedores'] = Relationship(back_populates="categ_proveedores")

crud = CRUDManager(CategoriaProveedores,engine)