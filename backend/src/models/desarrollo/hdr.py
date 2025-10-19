from sqlmodel import SQLModel, Field, Column, TIMESTAMP,text, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
if TYPE_CHECKING:
    from models.desarrollo.batea import Batea
    from models.desarrollo.destino import Destino
    from models.desarrollo.flota import Flota
    from models.desarrollo.chofer import Chofer
    from models.desarrollo.viatico import Viatico

class HDRCreate(SQLModel):
    hdr_flota_id: int= Field(..., foreign_key=("flota.flo_id"))
    hdr_batea_id: Optional[int]= Field(..., foreign_key=("batea.bat_id"))
    # hdr_adelanto: Optional[int] = Field(default=0, ge=0)
    # hdr_viatico_nac: Optional[int] = Field(default=0, ge=0)
    # hdr_viatico_plus: Optional[int] = Field(default=0, ge=0)
    hdr_destino_id: int= Field(..., foreign_key=("destino.des_id"))
    hdr_comentarios:Optional[str] = Field(None,max_length=250)
    hdr_tanque_lleno: bool
    hdr_tanque_lleno_urea: bool
    
class HDR(HDRCreate, table=True):
    hdr_id: Optional[int] = Field(default=None, primary_key=True)
    hdr_chofer_id: int = Field(..., foreign_key=("chofer.chofer_id")) 
    hdr_carga: datetime= Field(default=None,sa_column=Column(TIMESTAMP(timezone=True),nullable=False,server_default=text("CURRENT_TIMESTAMP")))
    hdr_modif:datetime= Field(default=None,sa_column=Column(TIMESTAMP(timezone=True),nullable=False,server_default=text("CURRENT_TIMESTAMP")))
    hdr_active: bool=True
    hdr_rendida: bool=False
    hdr_fecha_rendida: Optional[datetime]
    hdr_obs_rendida: Optional[str] = Field(None,max_length=250)
    hdr_user_rendida: Optional[str]

    batea:Optional['Batea'] = Relationship(back_populates="hdr")
    destino:Optional['Destino'] = Relationship(back_populates="hdr")
    flota:Optional['Flota'] = Relationship(back_populates="hdr")
    chofer:Optional['Chofer'] = Relationship(back_populates="hdr")
    # viatico:Optional['Viatico']= Relationship(back_populates='hdr')