from fastapi import APIRouter, UploadFile, File, Depends
from sqlmodel import Session
import os
from os import getcwd
from database import get_db
from data.functions.security import common_exeption
import shutil

conn:Session = Depends(get_db)

foto_admin = APIRouter()


@foto_admin.get('/listado_fotos_admin')
def leer_fotos_admin(tipo:str,hdr:str,id: int):
    try:
        ruta= getcwd() + f"/data/files/{tipo}/{hdr}/{id}"
        # contenido= os.listdir(ruta)
        with os.scandir(ruta) as fotos:
            contenido= [foto.name for foto in fotos if foto.is_file() and (foto.name.lower().endswith('.jpg') or foto.name.lower().endswith('.png') or foto.name.lower().endswith('.jpeg'))]
    except:    
        contenido=["not_found.png"]

    return {"RUTA": f"/files/{tipo}/{hdr}/{id}",
            "CONTENIDO": contenido}

@foto_admin.get('/listado_files_admin')
def leer_files_admin(tipo:str,hdr:str,id: int):
    try:
        ruta= getcwd() + f"/data/files/{tipo}/{hdr}/{id}"
        # contenido= os.listdir(ruta)
        with os.scandir(ruta) as fotos:
            contenido= [foto.name for foto in fotos if foto.is_file() and (foto.name.lower().endswith('.jpg') or foto.name.lower().endswith('.png') or foto.name.lower().endswith('.jpeg'))]
    except:    
        contenido=["not_found.png"]

    return {"RUTA": f"/files/{tipo}/{hdr}/{id}",
            "CONTENIDO": contenido}