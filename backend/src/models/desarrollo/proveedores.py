from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
if TYPE_CHECKING:
    from models.desarrollo.cat_prov import CategoriaProveedores
    from models.desarrollo.orden_trabajo import OT
class ProveedoresCreate(SQLModel):
    prov_des:Optional[str] = Field(..., min_length=3,max_length=200) 
    prov_nombre:str = Field(..., min_length=3,max_length=200) 
    prov_razon_social: str = Field(..., min_length=3,max_length=200) 
    prov_contacto: str = Field(..., min_length=3,max_length=200)
    prov_ubic: Optional[str] = Field(..., min_length=3,max_length=200)
    prov_categ: int = Field(...,foreign_key=("categoriaproveedores.id"))
    
class Proveedores(ProveedoresCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    categ_proveedores: Optional['CategoriaProveedores'] = Relationship(back_populates="proveedores")
    ot_p: Optional['OT'] = Relationship(back_populates="proveedores")
    
crud = CRUDManager(Proveedores,engine)