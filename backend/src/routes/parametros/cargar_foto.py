from fastapi import APIRouter, UploadFile, File, Depends
from sqlmodel import Session
import os
from os import getcwd
from database import get_db
from data.functions.security import common_exeption
import shutil

conn:Session = Depends(get_db)

foto = APIRouter()


@foto.get('/listado_fotos')
def leer_fotos(tipo:str,hdr:str,id: int):
    try:
        ruta= getcwd() + f"/data/files/{tipo}/{hdr}/{id}"
        # contenido= os.listdir(ruta)
        with os.scandir(ruta) as fotos:
            contenido= [foto.name for foto in fotos if foto.is_file() and (foto.name.lower().endswith('.jpg') or foto.name.lower().endswith('.png') or foto.name.lower().endswith('.jpeg'))]
    except:    
        contenido=["not_found.png"]

    return {"RUTA": f"/files/{tipo}/{hdr}/{id}",
            "CONTENIDO": contenido}

@foto.post('/cargar_foto')
async def cargar_foto(tipo_foto: str, id_hdr:int,id: int, nueva_foto: UploadFile=File(...)):
    ext = nueva_foto.filename.split(".")[-1]
    tipo_foto = "novedades" if tipo_foto == "novedades" else "facturas"
    if ext not in ["jpg","jpeg","png","JPEG","JPG","PNG"]:
        raise common_exeption(415, "Se admiten solo extensiones jpg y/o png")
    ruta= getcwd() + f"/data/files/{tipo_foto}/"
    try:
        new_ruta=f"{ruta}{id_hdr}/{id}/"
        # posicion = random.randrange(1000,9999,1)
        posicion = len(os.listdir(new_ruta))+1
    except:
        new_ruta=f"{ruta}{id_hdr}/{id}/"
        os.makedirs(new_ruta, exist_ok=True)
        posicion=1
    cadena = str(posicion)+"."+ext #tipo hdr novedad posicion
    with open(getcwd() + f"/data/files/{tipo_foto}/{id_hdr}/{id}/"+cadena, "wb") as novedad:
        contenido= await nueva_foto.read()
        novedad.write(contenido)
        novedad.close()

    return f"/data/files/{tipo_foto}/{id_hdr}/{id}/{cadena}"

@foto.post('/cargar_foto_cubierta')
async def cargar_foto_cubierta(tipo_baja: str, id_cubierta:int, nueva_foto: UploadFile=File(...)):
    ext = nueva_foto.filename.split(".")[-1]
    tipo_baja = "baja" if tipo_baja == "baja" else "baja_definitiva"
    if ext not in ["jpg","jpeg","png","JPEG""JPG","PNG"]:
        raise common_exeption(415, "Se admiten solo extensiones jpg y/o png")
    ruta= getcwd() + f"/data/files/cubiertas/{tipo_baja}/"
    try:
        new_ruta=f"{ruta}{id_cubierta}/"
        posicion = len(os.listdir(new_ruta))+1
    except:
        new_ruta=f"{ruta}{id_cubierta}/"
        os.makedirs(new_ruta, exist_ok=True)
        posicion=1
    cadena = str(posicion)+"."+ext 
    with open(getcwd() + f"/data/files/cubiertas/{tipo_baja}/{id_cubierta}/"+cadena, "wb") as cubierta:
        contenido= await nueva_foto.read()
        cubierta.write(contenido)
        cubierta.close()

    return f"/data/files/cubiertas/{tipo_baja}/{id_cubierta}/{cadena}"

@foto.delete('/eliminar_fotos')
async def eliminar_fotos_carpeta(tipo_foto: str, id_hdr: int, id: int):
    ruta = getcwd() +f"/data/files/{tipo_foto}/{id_hdr}/{id}/" 

    if not os.path.exists(ruta):
        raise FileNotFoundError("La carpeta especificada no existe.")

    try:
        shutil.rmtree(ruta)
        return "Fotos y carpeta eliminadas correctamente."
    except Exception as e:
        return f"No se pudo eliminar la carpeta y sus fotos: {e}"


@foto.delete('/eliminar_fotos_cubiertas')
async def eliminar_fotos_carpeta_cubiertas(tipo_baja: str, id_cubierta: int, id: int):
    ruta = getcwd() +f"/data/files/cubiertas/{tipo_baja}/{id_cubierta}/" 

    if not os.path.exists(ruta):
        raise FileNotFoundError("La carpeta especificada no existe.")

    try:
        shutil.rmtree(ruta)
        return "Fotos y carpeta eliminadas correctamente."
    except Exception as e:
        return f"No se pudo eliminar la carpeta y sus fotos: {e}"