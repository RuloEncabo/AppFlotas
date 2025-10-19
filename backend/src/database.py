import os
from sqlmodel import create_engine, Session,select,text, inspect

from config.prod import enviro
from models.seguridad.rol import Rol

URL= enviro.DB_URL

engine = create_engine(URL)

def get_db():
    session = Session(engine)
    try:
        yield session
        session.commit()
    finally:
        session.close()

        
def carga_inicial_datos():
    with Session(engine) as db:
        check=db.exec(select(Rol)).first()
        if not check:
            tablas = inspect(engine)
            for table in tablas.get_table_names():
                db.exec(text(f"truncate table {table} restart identity cascade;"))
            nombre="bd_init"
            ext="sql"
            archivo=os.getcwd()+f"/data/sql/{nombre}.{ext}"
            with open(archivo,'r', encoding='utf-8') as precarga:
                statement= precarga.read()
                db.exec(text(statement))
    