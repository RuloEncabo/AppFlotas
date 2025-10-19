from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
from datetime import date

if TYPE_CHECKING:
    from models.desarrollo.cubierta import Cubiertas
    from models.desarrollo.proveedores import Proveedores
    from models.desarrollo.estado import Estado
    from models.desarrollo.deposito import Deposito
    from models.desarrollo.otc import Otc

class OtcGeneralCreate(SQLModel):
    otc_gen_fecha:date 
    otc_prov_id:int = Field(..., foreign_key=("proveedores.id"))
    otc_estado_id:int  = Field(..., foreign_key=("estado.id"))
    otc_dep_id:int = Field(..., foreign_key=("deposito.id"))
    otc_gen_obs:str = Field(None, min_length=3,max_length=200)
    
class OtcGeneral(OtcGeneralCreate, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


    proveedores: Optional['Proveedores'] = Relationship()
    depositos: Optional['Deposito'] = Relationship()
    estados: Optional['Estado'] = Relationship()
    otcs: List['Otc'] = Relationship(back_populates="otc_general")
    
crud = CRUDManager(OtcGeneral,engine)