from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
if TYPE_CHECKING:
    from models.desarrollo.cat_nov import CatNovedad

class GastoCreate(SQLModel):
    gas_hdr_id:int = Field(..., foreign_key=("hdr.hdr_id"))
    gas_fecha:datetime
    gas_lugar:str = Field(None, min_length=3,max_length=100)
    gas_ticket:int = Field(default=0, ge=0)
    gas_cat_id:int = Field(..., foreign_key=("catnovedad.cn_id"))
    gas_proveedor:str = Field(None, min_length=3,max_length=200)
    gas_monto:float = Field(default=0, ge=0)
    gas_img:str = Field(None, min_length=3,max_length=200)
    
class Gasto(GastoCreate, table=True):
    gas_id: Optional[int] = Field(default=None, primary_key=True)

    cat_nov:Optional['CatNovedad'] = Relationship(back_populates="gastos")
    

crud = CRUDManager(Gasto,engine)