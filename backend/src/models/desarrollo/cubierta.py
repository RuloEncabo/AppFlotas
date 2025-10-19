from datetime import date
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from sqlmodel_crud_manager.crud import CRUDManager
from database import engine
from enum import Enum
from models.desarrollo.otc import Otc
from models.desarrollo.deposito import Deposito
from models.desarrollo.historico import Historico
from sqlalchemy import UniqueConstraint
class MotivoType(str, Enum):
    FIN_DE_CICLO = "FIN DE CICLO"
    GARANTIA_RECAPADO = "GARANTIA RECAPADO"
    GARANTIA_FABRICANTE = "GARANTIA FABRICANTE"
    VENTA_CASCO = "VENTA CASCO"

#enum 4 bajas definitivas
class CubiertasCreate(SQLModel):
    __table_args__ = (UniqueConstraint("cub_nro_interno"),)
    cub_fecha_alta:date
    cub_serie: str 
    cub_dot: str
    cub_id_dep: int = Field(..., foreign_key=("deposito.id"))
    cub_nro_interno: int = Field(None,gt=1)
    cub_modelo: str = Field(None, min_length=3,max_length=50)
    cub_marca: str = Field(None, min_length=3,max_length=100)
    cub_mm: int = Field(None,gt=0)
    cub_presion: float|None = None
    cub_banda: str = Field(None, min_length=3,max_length=50)
    cub_medida: str 
    cub_km_recorridos: int 
    cub_km_totales: int = 0
    cub_pos_actual: int|None = None
    cub_cant_recapados: int|None = 0
    cub_observaciones: str|None = None
    cub_estado: str|None = None
    cub_motivo:str|None = None
    cub_fecha_baja:date|None = None
    cub_mot_baja: MotivoType |None = None
    cub_imgs: str|None = None
    
class Cubiertas(CubiertasCreate, table=True):
    cub_id: Optional[int] = Field(default=None, primary_key=True)
    
    deposito: Optional[Deposito] = Relationship()
    otc_cubs: Optional[Otc] = Relationship(back_populates="cubiertas")
    historico: Optional[Historico] = Relationship(back_populates="cubiertas")