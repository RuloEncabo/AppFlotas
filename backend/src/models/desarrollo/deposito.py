from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
if TYPE_CHECKING:
    from models.desarrollo.cubierta import Cubiertas

class DepositoCreate(SQLModel):
    dep_des:str = Field(..., min_length=3,max_length=200)
    dep_nombre:str = Field(..., min_length=3,max_length=200)

    
class Deposito(DepositoCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

crud = CRUDManager(Deposito,engine)