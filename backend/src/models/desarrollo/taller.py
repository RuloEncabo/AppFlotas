from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
if TYPE_CHECKING:
    from models.desarrollo.orden_trabajo import OT
    from models.desarrollo.historico_aceite import HistoricoAceite

class TallerCreate(SQLModel):
    taller_nombre: str = Field(None, min_length=3,max_length=60)
    taller_des: str = Field(None, min_length=1, max_length=5)
    

class Taller(TallerCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    ot_t: Optional['OT'] = Relationship(back_populates="taller")
    historico_aceite: Optional['HistoricoAceite'] = Relationship(back_populates="taller")

crud = CRUDManager(Taller,engine)