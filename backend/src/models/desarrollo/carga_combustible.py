from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
from enum import Enum
if TYPE_CHECKING:
    from models.desarrollo.tipo_combustible import TipoCombustible

class YPFType(str, Enum):
    YPF_RUTA = "YPF RUTA"
    CUENTA_CORRIENTE = "CUENTA CORRIENTE"
    CONTADO = "CONTADO"
    CLZ = "CLZ"

class CargaCreate(SQLModel):
    car_hdr_id: int = Field(..., foreign_key=("hdr.hdr_id"))
    car_fecha: datetime
    car_km_odo: int = Field(default=0, ge=0)
    car_lugar: str = Field(None, min_length=3,max_length=60)
    car_lt_cargados: float = Field(default=0, ge=0)
    car_lt_urea_cargados: float = Field(default=0, ge=0)
    car_lng: Optional[float]
    car_lat: Optional[float]
    car_tanque_lleno: bool
    car_tanque_lleno_urea: bool
    car_ypf: YPFType
    car_sucursal: Optional[str] = Field(None,max_length=60)
    car_observaciones: Optional[str] = Field(None,max_length=255)
    car_tc_id: int = Field(..., foreign_key=("tipocombustible.tc_id"))
    
class Carga(CargaCreate, table=True):
    car_id: Optional[int] = Field(default=None, primary_key=True)
    car_infraccion: bool  = Field(default=False)
    
    car_comb:Optional['TipoCombustible'] = Relationship(back_populates="carga")

crud = CRUDManager(Carga,engine)

    
