from datetime import date
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
from enum import Enum

if TYPE_CHECKING:
    from models.desarrollo.cubierta import Cubiertas
    from models.desarrollo.trabajo import Trabajo
    from models.desarrollo.tipo_tratamiento import TipoTratamiento
    from models.desarrollo.otc_general import OtcGeneral

class EstadoOtcType(str, Enum):  ## LE CAMBIE EL NOMBRE AL ENUM PORQUE HABIA UN TYPE CON EL MISMO NOMBE, Y NO SE GENERABA
    SIN_ASIGNAR = "SIN ASIGNAR"
    PENDIENTE = "PENDIENTE"
    CERRADA = "CERRADA"

class OtcCreate(SQLModel):
    otc_fecha:date 
    cub_id:int = Field(..., foreign_key=("cubiertas.cub_id"))
    otc_trab_id:int = Field(..., foreign_key=("trabajo.id"))
    otc_tipo: int = Field(..., foreign_key=("tipotratamiento.id")) 
    otc_general_id: Optional[int] = Field(default=None, foreign_key="otcgeneral.id")
    otc_estado: EstadoOtcType
    
class Otc(OtcCreate, table=True):
    otc_id: Optional[int] = Field(default=None, primary_key=True)

    trabajos: Optional['Trabajo'] = Relationship()
    tipos: Optional['TipoTratamiento'] = Relationship()
    cubiertas: Optional['Cubiertas'] = Relationship(back_populates="otc_cubs")
    otc_general: Optional['OtcGeneral'] = Relationship(back_populates="otcs")
    
crud = CRUDManager(Otc,engine)