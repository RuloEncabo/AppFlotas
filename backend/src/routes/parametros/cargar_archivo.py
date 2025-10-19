from fastapi import APIRouter, UploadFile, File, Depends
from sqlmodel import Session
import os
from os import getcwd
from database import get_db
from data.functions.security import common_exeption
import shutil

conn:Session = Depends(get_db)

archivo = APIRouter()


@archivo.post('/cargar_archivo')
async def cargar_archivo(nombre: str, nuevo_archivo: UploadFile = File(...)):
    ext = nuevo_archivo.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "pdf", "xlsx", "docx", "csv"]:
        raise common_exeption(415, "Se admiten solo extensiones jpg, jpeg, png, pdf, xlsx, docx, csv")
    ruta = getcwd() + "/data/archivos/"
    if not os.path.exists(ruta):
        os.makedirs(ruta)
    
    ruta_archivo = f"{ruta}{nombre}.{ext}"
    
    try:
        with open(ruta_archivo, "wb") as archivo:
            contenido = await nuevo_archivo.read()
            archivo.write(contenido)
    except Exception as e:
        return {"error": str(e)}
    return {"filepath": ruta_archivo}


@archivo.get('/leer_documentos')
async def leer_documentos():
    try:
        ruta= getcwd() + f"/data/archivos/"
        # contenido= os.listdir(ruta)
        with os.scandir(ruta) as documentos:
            contenido= [documento.name for documento in documentos if documento.is_file() and (documento.name.lower().endswith('.pdf') 
                                                                                               or documento.name.lower().endswith('.xlsx') 
                                                                                               or documento.name.lower().endswith('.docx'))]
    except:    
        contenido=["not_found.docx"]

    return {"RUTA": f"/data/archivos/",
            "CONTENIDO": contenido}