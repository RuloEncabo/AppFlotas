from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
if TYPE_CHECKING:
    from models.desarrollo.gasto import Gasto


class CatNovedadCreate(SQLModel):
    cn_nombre: str = Field(None, min_length=3,max_length=60)
    
class CatNovedad(CatNovedadCreate, table=True):
    cn_id: Optional[int] = Field(default=None, primary_key=True)

    gastos:Optional['Gasto'] = Relationship(back_populates="cat_nov")

crud = CRUDManager(CatNovedad,engine)