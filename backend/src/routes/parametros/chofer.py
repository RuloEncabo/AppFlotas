from fastapi import APIRouter, Depends, HTTPException, Security, status
from sqlmodel import Session, select
from fastapi_jwt import JwtAuthorizationCredentials
from data.functions.security import access_security, common_exeption

from database import get_db
from models.desarrollo.chofer import Chofer, ChoferCreate
from models.seguridad.user import Usuario


chofer_route = APIRouter(prefix="/chofer")

conn:Session = Depends(get_db)


@chofer_route.get('/')
async def obtener_choferes(db=conn):
    statement = select(Chofer, Usuario).join(Usuario, Chofer.usr_id == Usuario.usr_id)
    results = db.exec(statement).all()

    choferes = [
        {
            "usr_id": chofer.usr_id,
            "cho_dni": chofer.cho_dni,
            "chofer_id": chofer.chofer_id,
            "fullname": usuario.usr_nombre + " " + usuario.usr_apellido,
        }
        for chofer, usuario in results
    ]
    return choferes


@chofer_route.get('/{chofer_id}')
async def obtener_chofer(chofer_id: int, db=conn):
    chofer = db.exec(select(Chofer).where(Chofer.chofer_id == chofer_id)).first()
    
    if chofer is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el chofer para el ID {chofer_id}")

    return chofer

@chofer_route.post('/',response_model=Chofer)
async def crear_chofer(nuevo_chofer:ChoferCreate,credentials: JwtAuthorizationCredentials= Security(access_security), db=conn):
    statement = select(Usuario).where(Usuario.usr_email==credentials.subject["email"])
    user_ = db.exec(statement).first()
    if user_.chofer:
        raise common_exeption(status.HTTP_409_CONFLICT,"Ya existe un chofer registrado con su usuario")
    
    chofer = Chofer(**dict(nuevo_chofer), usr_id = user_.usr_id )
    db.add(chofer)
    db.commit()
    db.refresh(chofer)
    return chofer

@chofer_route.delete('/{chofer_id}')
async def eliminar_chofer(chofer_id: int, db=conn):
    sql = select(Chofer).where(Chofer.chofer_id == chofer_id)
    chofer = db.exec(sql).first()
    if chofer is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el chofer con ID {chofer_id}")

    db.delete(chofer)
    db.commit()

    return {"mensaje": f"Chofer con ID {chofer_id} eliminada exitosamente"}


@chofer_route.get('/resultado')
async def get_resultados(km_actuales: int, km_anterior:int, db=conn):
    return "resultados: " + (km_actuales - km_anterior)