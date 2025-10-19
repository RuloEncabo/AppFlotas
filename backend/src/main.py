from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel

from routes.routes import *
from config.prod import enviro
from database import engine
from models import *
from database import carga_inicial_datos

SQLModel.metadata.create_all(engine)

app = FastAPI(
    title="ELTA",
    description='''
    INSTRUCCIONES DE USO - APIS BACKEND
    - Cuando ejecute el proyecto por primera vez:
    ''',
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=enviro.ORIGINS,
    allow_credentials=True,
    allow_methods="[*]",
    allow_headers="[*]"
)

app.mount("/files", StaticFiles(directory='data/files'),name="files")

app.mount("/archivos", StaticFiles(directory='data/archivos'),name="archivos")

@app.on_event("startup")
async def cargar():
    carga_inicial_datos()

app.include_router(seguridad_route)
app.include_router(desarrollo_route)
app.include_router(conductor_route)
app.include_router(userflota_route)
app.include_router(admin_route)
app.include_router(taller_route)
app.include_router(params_route)
