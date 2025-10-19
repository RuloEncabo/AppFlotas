from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from enum import Enum
from database import engine
if TYPE_CHECKING:
    from models.desarrollo.ot_nov import OT_Nov
    from models.desarrollo.proveedores import Proveedores
    from models.desarrollo.taller import Taller

class OTEstadoType(str, Enum):
    PROGRAMADO = "PROGRAMADO"
    EN_TALLER = "EN TALLER"
    DEMORADO = "DEMORADO"
    CERRADO = "CERRADO"

class OTCreate(SQLModel):
    ot_fecha: datetime 
    ot_patente: str = Field(None, min_length=3,max_length=100)
    ot_taller: int = Field(..., foreign_key=("taller.id"))
    ot_programada: bool
    ot_fecha_taller: datetime
    ot_observaciones: str = Field(None, min_length=3,max_length=200)
    ot_estado: OTEstadoType
    ot_proveedor: Optional[int] = Field( default=None,foreign_key=("proveedores.id"))
    ot_monto: Optional[float] = Field(default=0, ge=0)
    ot_nr_factura: Optional[int] = Field(default=None)
    ot_imgs: str|None = None

class OT(OTCreate, table=True):
    ot_id: Optional[int] = Field(default=None, primary_key=True)
    
    ot_nov:Optional['OT_Nov'] = Relationship(back_populates="ot")
    proveedores: Optional['Proveedores'] = Relationship(back_populates="ot_p")
    taller: Optional['Taller'] = Relationship(back_populates="ot_t")

