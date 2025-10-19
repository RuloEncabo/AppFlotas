from fastapi import APIRouter, Depends, Response, Security
from sqlmodel import Session, select
from fastapi_jwt import JwtAuthorizationCredentials

from database import get_db,engine
from models.seguridad.user import Usuario, UsuarioCreate, UsuarioLogin
from models.seguridad.rol import Rol
from data.functions.security import autenticar_usuario, get_hashed_password, get_user_exeption, common_exeption
from data.functions.security import access_security,refresh_security
from os import getcwd
from sqlalchemy import inspect, text

auth_route = APIRouter()

conn:Session = Depends(get_db)

@auth_route.post('/login')
async def login(response: Response, login_data:UsuarioLogin, db=conn):
    usuario= autenticar_usuario(login_data, db)
    if not usuario: 
        raise get_user_exeption()
    subject = {"email": login_data.usr_email, "role": usuario.rol.rol_nombre}
    access_token = access_security.create_access_token(subject=subject)
    refresh_token = refresh_security.create_refresh_token(subject=subject)
    access_security.set_access_cookie(response, access_token)
    refresh_security.set_refresh_cookie(response, refresh_token)
    return {
        "usr_id": usuario.usr_id,
        "nombre": usuario.usr_nombre,
        "apellido": usuario.usr_apellido,
        "role": usuario.rol.rol_nombre
    }
    
@auth_route.delete('/logout')
def logout(response: Response):
    access_security.unset_access_cookie(response)
    refresh_security.unset_refresh_cookie(response)
    return {"detalle":"Abandonando la sesión correctamente"}
    

@auth_route.get('/')
async def leer_usuarios(db=conn):
    statement = select(Usuario)
    data = db.exec(statement).all()
    return data

@auth_route.post('/',response_model=Usuario)
async def crear_usuario(nuevo_user:UsuarioCreate, db=conn):
    c_rol= db.exec(select(Rol).where(Rol.rol_nombre == "chofer")).first()
    nuevo_user.usr_password = get_hashed_password(nuevo_user.usr_password)
    user=Usuario(**(dict(nuevo_user)), usr_rol_id=c_rol.rol_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@auth_route.post('/crear_passwords')
async def crear_passwords(db=conn):
    statement = select(Usuario)
    data = db.exec(statement).all()
    for user in data:
        if user.usr_password == 'string':
            passw = user.usr_nombre[0] + user.usr_apellido
            user.usr_password = get_hashed_password(passw.lower())
            db.commit()
            db.refresh(user)
    
    return "Passwords de usuarios actualizadas"


