from fastapi import APIRouter, Depends


from .seguridad.auth import auth_route
from .parametros.batea import batea_route
from .parametros.cat_nov import categoria_novedad_route
from .parametros.chofer import chofer_route
from .parametros.flota import flota_route
from .conductor.hdr import hdr_route
from .conductor.movimiento import movimiento_route 
from .conductor.novedad import novedad_route
from .conductor.viatico import viatico_route
from .parametros.tipo_viatico import tipo_viatico_route
from .parametros.destino import destino_route
from .parametros.tipo_destino import tipo_destino_route
from .parametros.tipo_combustible import tipo_combustible_route
from .parametros.tipo_kilometro import tipo_kilometro_route
from .parametros.taller import taller_route
from .conductor.carga_combustible import carga_route
from .conductor.gasto import gasto_route
from .parametros.cargar_foto import foto
from .parametros.cargar_archivo import archivo
from .flota.fotos_admin import foto_admin
from .flota.historico_aceite import hist_aceite_route
from .flota.hdr_admin import hdr_admin_route
from .flota.novedad_admin import novedad_admin_route
from .flota.orden_trabajo import ot_route
from .flota.ot_nov import ot_nov_route
from .flota.cubierta import cubierta_route
from .flota.flo_cub_pos import flo_cub_pos_route
from .flota.flota_cubiertas import flota_cubiertas_route
from .flota.otc import otc_route
from .flota.otc_general import otc_general_route
from .flota.posicion import posicion_route
from .flota.historico import historico_route
from .flota.metricas import metricas_route
from .parametros.estado import estado_route
from .parametros.marcas_modelos import marcas_modelos_route
from .parametros.tipo_tratamiento import tipo_tratamiento_route
from .parametros.proveedores import proveedores_route
from .parametros.trabajo import trabajo_route
from .parametros.deposito import deposito_route
from .parametros.cat_prov import cat_proveedores_route
from .parametros.tipo_aceite import tipo_aceite_route


from data.functions.permisos import permisoChofer,permisoFlota,permisoChoferFlota

seguridad_route = APIRouter(prefix="/seguridad",tags=["SEGURIDAD"])
desarrollo_route = APIRouter(prefix="/desarrollo",tags=["DESARROLLO"])
conductor_route = APIRouter(
    prefix="/conductor",
    tags=["CONDUCTOR"],
    dependencies=[Depends(permisoChofer)]
)
admin_route = APIRouter(prefix="/admin",tags=["ADMIN"])
userflota_route = APIRouter(
    prefix="/userflota",
    tags=["FLOTA"],
    dependencies=[Depends(permisoFlota)]
)
#taller_route = APIRouter(prefix="/taller",tags=["TALLER"])

params_route = APIRouter(
    prefix="/params",
    tags=["PARAMETROS"],
    dependencies=[Depends(permisoChoferFlota)]    
)


seguridad_route.include_router(auth_route)

userflota_route.include_router(metricas_route)
userflota_route.include_router(historico_route)
userflota_route.include_router(foto_admin)
userflota_route.include_router(hdr_admin_route)
userflota_route.include_router(novedad_admin_route)
userflota_route.include_router(hist_aceite_route)
userflota_route.include_router(ot_route)
userflota_route.include_router(ot_nov_route)
userflota_route.include_router(cubierta_route)
userflota_route.include_router(flo_cub_pos_route)
userflota_route.include_router(flota_cubiertas_route)
userflota_route.include_router(otc_route)
userflota_route.include_router(otc_general_route)
userflota_route.include_router(posicion_route)

params_route.include_router(deposito_route)
params_route.include_router(estado_route)
params_route.include_router(destino_route)
params_route.include_router(marcas_modelos_route)
params_route.include_router(tipo_tratamiento_route)
params_route.include_router(proveedores_route)
params_route.include_router(cat_proveedores_route)
params_route.include_router(trabajo_route)
params_route.include_router(archivo)
params_route.include_router(foto)
params_route.include_router(tipo_kilometro_route)
params_route.include_router(batea_route)
params_route.include_router(categoria_novedad_route)
params_route.include_router(chofer_route)
params_route.include_router(flota_route)
params_route.include_router(tipo_combustible_route)
params_route.include_router(tipo_destino_route)
params_route.include_router(tipo_viatico_route)
params_route.include_router(taller_route)
params_route.include_router(tipo_aceite_route)

conductor_route.include_router(hdr_route)
conductor_route.include_router(movimiento_route)
conductor_route.include_router(novedad_route)
conductor_route.include_router(carga_route)
conductor_route.include_router(gasto_route)
conductor_route.include_router(viatico_route)