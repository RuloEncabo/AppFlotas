from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_db
from models.desarrollo.cat_nov import CatNovedad

categoria_novedad_route = APIRouter(prefix="/categoria_novedad")

conn:Session = Depends(get_db)

@categoria_novedad_route.get('/')
async def obtener_categorias_novedad(db=conn):
    statement = select(CatNovedad)
    data = db.exec(statement).all()
    return data

@categoria_novedad_route.get('/{categoria_novedad_id}')
async def obtener_categoria_novedad(categoria_novedad_id: int, db=conn):
    categoria_novedad = db.exec(select(CatNovedad).where(CatNovedad.cn_id == categoria_novedad_id)).first()
    
    if categoria_novedad is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el categoria novedad para el ID {categoria_novedad}")

    return categoria_novedad

@categoria_novedad_route.post('/',response_model=CatNovedad)
async def crear_categoria_novedad(nueva_cat_nov:CatNovedad, db=conn):
    nueva_cat_nov.cn_id=None
    db.add(nueva_cat_nov)
    db.commit()
    db.refresh(nueva_cat_nov)
    return nueva_cat_nov

@categoria_novedad_route.delete('/{estado_novedad_id}')
async def eliminar_categoria_novedad(categoria_novedad_id: int, db=conn):
    sql = select(CatNovedad).where(CatNovedad.cn_id == categoria_novedad_id)
    categoria_novedad = db.exec(sql).first()
    if categoria_novedad is None:
        raise HTTPException(status_code=404, detail=f"No se encontró el categoria novedad con ID {categoria_novedad}")

    db.delete(categoria_novedad)
    db.commit()

    return {"mensaje": f"Categoria novedad con ID {categoria_novedad} eliminado exitosamente"}