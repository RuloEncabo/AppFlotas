from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine

if TYPE_CHECKING:
    from models.desarrollo.historico_aceite import HistoricoAceite

class TipoAceiteCreate(SQLModel):
    ta_nombre:str = Field(..., min_length=3,max_length=200) 
    
class TipoAceite(TipoAceiteCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    historico_actual: List['HistoricoAceite'] = Relationship(
        back_populates="tipo_aceite", 
        sa_relationship_kwargs={"foreign_keys": "HistoricoAceite.hist_tipo_aceite"}
    )

    # Relación con el último tipo de aceite en HistoricoAceite
    historico_ultimo: List['HistoricoAceite'] = Relationship(
        back_populates="ultimo_tipo_aceite", 
        sa_relationship_kwargs={"foreign_keys": "HistoricoAceite.hist_ultimo_tipo_aceite"}
    )
    
crud = CRUDManager(TipoAceite,engine)