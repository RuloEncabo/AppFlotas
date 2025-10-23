# AppFlotas – Documentación Técnica y Funcional

## Resumen

AppFlotas es una plataforma modular que coordina la operación diaria de choferes, analistas de flota, personal de taller y administradores. La solución se compone de un backend FastAPI que expone servicios REST sobre `SQLModel` y un frontend React/Next.js que consume dichos servicios mediante clientes Axios con control de acceso basado en roles.

## Tecnologías principales

- **Frontend:** Next.js 13, React 18, Material UI (MUI), CASL para control de acceso, Axios, React Hook Form, Yup, ApexCharts, FullCalendar, Iconify.
- **Backend:** FastAPI, SQLModel, PostgreSQL (via SQLAlchemy), autenticación basada en JWT, Alembic para migraciones, Celery (tareas asíncronas cuando aplica).
- **Infraestructura y tooling:** Docker, Poetry para dependencias del backend, Yarn/NPM para el frontend, precommit hooks y linters configurados en los respectivos `package.json`/`pyproject.toml`.

## Arquitectura del frontend React

1. **Layouts y navegación:** `src/layouts/UserLayout` arma la estructura principal (sidebar, topbar) e integra los guards de autenticación y ACL. La navegación vertical se construye en `src/navigation/vertical` agrupando rutas por rol con componentes `CanView*` que consultan CASL.
2. **Rutas y vistas:** Se organiza en `src/pages`, aprovechando rutas tradicionales de Next.js. Cada página declara su configuración ACL (`Component.acl`) y monta vistas de `src/views` que ensamblan componentes de dominio (por ejemplo, `flota-views`, `chofer-views`).
3. **Hooks y estado global:** `src/context/AuthContext` provee el estado de sesión; hooks personalizados en `src/@core/hooks` (como `useSettings`) gestionan preferencias de layout y tema; slices opcionales en `src/features` (Redux Toolkit) cubren dominios específicos como HDR o mantenimiento.
4. **Componentes reutilizables:** Widgets reutilizables se ubican en `src/components`, separados por dominio (flota, chofer, cubiertas, mantenimiento). Estos componentes encapsulan formularios, tablas `DataGrid` y diálogos de confirmación.

## Integración con el backend FastAPI

- **Clientes Axios:** `src/services/axios` crea una instancia configurada con `withCredentials`, headers y manejo centralizado de errores. Los módulos en `src/services/auth`, `src/services/flota_endpoints`, `src/services/chofer_endpoints` encapsulan las llamadas a los endpoints FastAPI.
- **Autenticación y renovación:** El backend emite JWT que se almacenan en cookies seguras. Los interceptores Axios interceptan respuestas 401 para limpiar la sesión, mostrar un aviso de expiración y redirigir a `/login`.
- **Sincronización de datos:** Las vistas disparan peticiones al montar (mediante `useEffect`) y actualizan el estado local o slices Redux. La cache liviana se maneja con estados React; para operaciones críticas (HDR, mantenimiento) se refrescan listados tras cada mutación para mantener consistencia.

## Gestión de estado, autenticación y consumo de APIs

1. **Contexto de autenticación:** `AuthProvider` expone `login`, `logout`, `setUser` y `loading`. Durante `login`, se llama a `auth.login`, se guarda la respuesta en `localStorage` y se establece la habilidad CASL según el rol devuelto.
2. **Protección de rutas:** `_app.js` envuelve cada página con `AuthGuard` (verifica sesión) y `AclGuard` (verifica permisos declarados). Las páginas públicas establecen `authGuard: false`.
3. **Gestión de formularios:** Formularios complejos emplean `react-hook-form` + `YupResolver` para validar datos antes de llamar a los servicios Axios. Los hooks `useForm` y `Controller` se combinan con componentes MUI.
4. **Manejo de feedback:** Notificaciones globales utilizan componentes como `ToastError` y `ConfirmDialog`, disparados desde hooks de resultado o promesas Axios.

## Flujos funcionales clave

- **Inicio de sesión:** El usuario accede a `/login`, ingresa credenciales, el formulario valida con `Yup` y `AuthContext.login` persiste la sesión. Tras autenticarse, se redirige al dashboard principal según el rol.
- **Gestión de flotas:** Analistas navegan a `flota/flota-general` para revisar HDR activas, novedades y métricas. Pueden validar HDR (`flota-validacion-hdr`), programar mantenimientos (`flota-mantenimiento-preventivo`) y gestionar cubiertas (`flota-cubiertas`).
- **Gestión de cargas y HDR:** Choferes desde `chofer/chofer-general` crean HDR nuevas (`crear-hdr`), registran cargas de combustible, viáticos y novedades. Cada acción invoca servicios específicos que actualizan el backend y refrescan listados.
- **Módulo taller:** El personal de taller usa `taller-page` para ejecutar mantenimientos preventivos/correctivos, consumiendo componentes de `mantenimiento-components` y registrando avances sobre las unidades.
- **Administración:** Los administradores acceden a `admin-page` para gestionar catálogos, parámetros globales y reportes, aprovechando componentes CRUD compartidos.

## Documentación de modelos del backend

La siguiente sección resume los 25 modelos principales implementados con `SQLModel`, incluyendo campos, relaciones, enumeraciones y ejemplos CRUD de referencia.

# Modelos de AppFlotas

Este documento describe 25 modelos del backend FastAPI, detallando sus campos, relaciones, enumeraciones y ejemplos CRUD utilizando `SQLModel` y `CRUDManager`.

## Batea

- **Archivo:** `backend/src/models/desarrollo/batea.py`

- **Módulo:** `models.desarrollo.batea`

- **Clases:** `BateaCreate` (entrada) y `Batea` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `bat_nombre` | `str` | Sí | min_length=3, max_length=60 |
| `bat_dominio` | `str` | Sí | — |
| `bat_km` | `int` | Sí | — |
| `bat_id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `hdr` | `Optional['HDR']` | `batea` | `HDR` |

**Enums**: —


**Ejemplo CRUD**

```python
from models.desarrollo.batea import BateaCreate, crud

payload = BateaCreate(
    bat_nombre="bat_nombre_demo",
    bat_dominio="bat_dominio_demo",
    bat_km=1,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.bat_id)
setattr(registro, 'bat_nombre', "bat_nombre_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.bat_id)
```

## Carga

- **Archivo:** `backend/src/models/desarrollo/carga_combustible.py`

- **Módulo:** `models.desarrollo.carga_combustible`

- **Clases:** `CargaCreate` (entrada) y `Carga` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `car_hdr_id` | `int` | Sí | foreign_key='hdr.hdr_id' |
| `car_fecha` | `datetime` | Sí | — |
| `car_km_odo` | `int` | No | default=0, ge=0 |
| `car_lugar` | `str` | No | None, min_length=3, max_length=60 |
| `car_lt_cargados` | `float` | No | default=0, ge=0 |
| `car_lt_urea_cargados` | `float` | No | default=0, ge=0 |
| `car_lng` | `Optional[float]` | No | — |
| `car_lat` | `Optional[float]` | No | — |
| `car_tanque_lleno` | `bool` | Sí | — |
| `car_tanque_lleno_urea` | `bool` | Sí | — |
| `car_ypf` | `YPFType` | Sí | — |
| `car_sucursal` | `Optional[str]` | No | None, max_length=60 |
| `car_observaciones` | `Optional[str]` | No | None, max_length=255 |
| `car_tc_id` | `int` | Sí | foreign_key='tipocombustible.tc_id' |
| `car_id` | `Optional[int]` | No | default=None, primary_key=True |
| `car_infraccion` | `bool` | No | default=False |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `car_comb` | `Optional['TipoCombustible']` | `carga` | `TipoCombustible` |

**Enums**

- `YPFType`: `YPF_RUTA` = 'YPF RUTA', `CUENTA_CORRIENTE` = 'CUENTA CORRIENTE', `CONTADO` = 'CONTADO', `CLZ` = 'CLZ'

**Ejemplo CRUD**

```python
from datetime import datetime
from models.desarrollo.carga_combustible import CargaCreate, YPFType, crud

payload = CargaCreate(
    car_hdr_id=1,
    car_fecha=datetime.now(),
    car_tanque_lleno=True,
    car_tanque_lleno_urea=True,
    car_ypf=YPFType.YPF_RUTA,
    car_tc_id=1,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.car_id)
setattr(registro, 'car_km_odo', 42)
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.car_id)
```

## CatNovedad

- **Archivo:** `backend/src/models/desarrollo/cat_nov.py`

- **Módulo:** `models.desarrollo.cat_nov`

- **Clases:** `CatNovedadCreate` (entrada) y `CatNovedad` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `cn_nombre` | `str` | No | None, min_length=3, max_length=60 |
| `cn_id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `gastos` | `Optional['Gasto']` | `cat_nov` | `Gasto` |

**Enums**: —


**Ejemplo CRUD**

```python
from models.desarrollo.cat_nov import CatNovedadCreate, crud

payload = CatNovedadCreate(
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.cn_id)
setattr(registro, 'cn_nombre', "cn_nombre_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.cn_id)
```

## CategoriaProveedores

- **Archivo:** `backend/src/models/desarrollo/cat_prov.py`

- **Módulo:** `models.desarrollo.cat_prov`

- **Clases:** `CategoriaProveedoresCreate` (entrada) y `CategoriaProveedores` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `cp_nombre` | `str` | No | None, min_length=3, max_length=60 |
| `id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `proveedores` | `Optional['Proveedores']` | `categ_proveedores` | `Proveedores` |

**Enums**: —


**Ejemplo CRUD**

```python
from models.desarrollo.cat_prov import CategoriaProveedoresCreate, crud

payload = CategoriaProveedoresCreate(
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.id)
setattr(registro, 'cp_nombre', "cp_nombre_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.id)
```

## Chofer

- **Archivo:** `backend/src/models/desarrollo/chofer.py`

- **Módulo:** `models.desarrollo.chofer`

- **Clases:** `ChoferCreate` (entrada) y `Chofer` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `cho_dni` | `str` | No | None, min_length=7, max_length=9 |
| `chofer_id` | `Optional[int]` | No | default=None, primary_key=True |
| `usr_id` | `int` | Sí | foreign_key='usuario.usr_id' |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `user` | `Optional['Usuario']` | `chofer` | `Usuario` |
| `hdr` | `Optional['HDR']` | `chofer` | `HDR` |

**Enums**: —


**Ejemplo CRUD**

```python
from models.desarrollo.chofer import ChoferCreate, crud

payload = ChoferCreate(
    usr_id=1,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.chofer_id)
setattr(registro, 'cho_dni', "cho_dni_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.chofer_id)
```

## Cubiertas

- **Archivo:** `backend/src/models/desarrollo/cubierta.py`

- **Módulo:** `models.desarrollo.cubierta`

- **Clases:** `CubiertasCreate` (entrada) y `Cubiertas` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `cub_fecha_alta` | `date` | Sí | — |
| `cub_serie` | `str` | Sí | — |
| `cub_dot` | `str` | Sí | — |
| `cub_id_dep` | `int` | Sí | foreign_key='deposito.id' |
| `cub_nro_interno` | `int` | No | None, gt=1 |
| `cub_modelo` | `str` | No | None, min_length=3, max_length=50 |
| `cub_marca` | `str` | No | None, min_length=3, max_length=100 |
| `cub_mm` | `int` | No | None, gt=0 |
| `cub_presion` | `float | None` | No | — |
| `cub_banda` | `str` | No | None, min_length=3, max_length=50 |
| `cub_medida` | `str` | Sí | — |
| `cub_km_recorridos` | `int` | Sí | — |
| `cub_km_totales` | `int` | No | — |
| `cub_pos_actual` | `int | None` | No | — |
| `cub_cant_recapados` | `int | None` | No | — |
| `cub_observaciones` | `str | None` | No | — |
| `cub_estado` | `str | None` | No | — |
| `cub_motivo` | `str | None` | No | — |
| `cub_fecha_baja` | `date | None` | No | — |
| `cub_mot_baja` | `MotivoType | None` | No | — |
| `cub_imgs` | `str | None` | No | — |
| `cub_id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `deposito` | `Optional[Deposito]` | `—` | `Deposito` |
| `otc_cubs` | `Optional[Otc]` | `cubiertas` | `Otc` |
| `historico` | `Optional[Historico]` | `cubiertas` | `Historico` |

**Enums**

- `MotivoType`: `FIN_DE_CICLO` = 'FIN DE CICLO', `GARANTIA_RECAPADO` = 'GARANTIA RECAPADO', `GARANTIA_FABRICANTE` = 'GARANTIA FABRICANTE', `VENTA_CASCO` = 'VENTA CASCO'

**Ejemplo CRUD**

```python
from datetime import date
from models.desarrollo.cubierta import CubiertasCreate, MotivoType, crud

payload = CubiertasCreate(
    cub_fecha_alta=date.today(),
    cub_serie="cub_serie_demo",
    cub_dot="cub_dot_demo",
    cub_id_dep=1,
    cub_medida="cub_medida_demo",
    cub_km_recorridos=1,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.cub_id)
setattr(registro, 'cub_nro_interno', 42)
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.cub_id)
```

## Deposito

- **Archivo:** `backend/src/models/desarrollo/deposito.py`

- **Módulo:** `models.desarrollo.deposito`

- **Clases:** `DepositoCreate` (entrada) y `Deposito` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `dep_des` | `str` | Sí | min_length=3, max_length=200 |
| `dep_nombre` | `str` | Sí | min_length=3, max_length=200 |
| `id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**: —


**Enums**: —


**Ejemplo CRUD**

```python
from models.desarrollo.deposito import DepositoCreate, crud

payload = DepositoCreate(
    dep_des="dep_des_demo",
    dep_nombre="dep_nombre_demo",
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.id)
setattr(registro, 'dep_des', "dep_des_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.id)
```

## Destino

- **Archivo:** `backend/src/models/desarrollo/destino.py`

- **Módulo:** `models.desarrollo.destino`

- **Clases:** `DestinoCreate` (entrada) y `Destino` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `des_nombre` | `str` | Sí | min_length=3, max_length=60 |
| `des_tipo` | `int` | Sí | foreign_key='tipodestino.td_id' |
| `des_id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `hdr` | `Optional['HDR']` | `destino` | `HDR` |
| `tipo_destino` | `Optional['TipoDestino']` | `destino` | `TipoDestino` |

**Enums**: —


**Ejemplo CRUD**

```python
from models.desarrollo.destino import DestinoCreate, crud

payload = DestinoCreate(
    des_nombre="des_nombre_demo",
    des_tipo=1,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.des_id)
setattr(registro, 'des_nombre', "des_nombre_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.des_id)
```

## Estado

- **Archivo:** `backend/src/models/desarrollo/estado.py`

- **Módulo:** `models.desarrollo.estado`

- **Clases:** `EstadoCreate` (entrada) y `Estado` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `est_des` | `str` | Sí | min_length=3, max_length=200 |
| `est_nombre` | `str` | Sí | min_length=3, max_length=200 |
| `id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**: —


**Enums**: —


**Ejemplo CRUD**

```python
from models.desarrollo.estado import EstadoCreate, crud

payload = EstadoCreate(
    est_des="est_des_demo",
    est_nombre="est_nombre_demo",
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.id)
setattr(registro, 'est_des', "est_des_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.id)
```

## FloCubPos

- **Archivo:** `backend/src/models/desarrollo/flo_cub_pos.py`

- **Módulo:** `models.desarrollo.flo_cub_pos`

- **Clases:** `FloCubPosCreate` (entrada) y `FloCubPos` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `fc_id` | `int` | Sí | foreign_key='flotacubiertas.fc_id' |
| `cub_id` | `int` | Sí | foreign_key='cubiertas.cub_id' |
| `pos_id` | `int` | Sí | foreign_key='posicion.id' |
| `km_base` | `int` | Sí | — |
| `fecha_rotacion` | `date | None` | No | — |
| `id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `cubierta` | `Optional[Cubiertas]` | `—` | `Cubiertas` |

**Enums**: —


**Ejemplo CRUD**

```python
from datetime import date
from models.desarrollo.flo_cub_pos import FloCubPosCreate, crud

payload = FloCubPosCreate(
    fc_id=1,
    cub_id=1,
    pos_id=1,
    km_base=1,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.id)
setattr(registro, 'fecha_rotacion', date.today())
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.id)
```

## Flota

- **Archivo:** `backend/src/models/desarrollo/flota.py`

- **Módulo:** `models.desarrollo.flota`

- **Clases:** `FlotaCreate` (entrada) y `Flota` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `flo_nombre` | `str` | No | None, min_length=3, max_length=60 |
| `flo_dom_tractor` | `str` | Sí | — |
| `flo_km_odo` | `int` | Sí | ge=0 |
| `flo_combust_id` | `Optional[int]` | No | foreign_key='tipocombustible.tc_id' |
| `flo_fecha_aceite` | `datetime | None` | No | — |
| `flo_km_aceite` | `int` | No | default=0 |
| `flo_id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `combustible` | `Optional['TipoCombustible']` | `flota` | `TipoCombustible` |
| `hdr` | `Optional['HDR']` | `flota` | `HDR` |

**Enums**: —


**Ejemplo CRUD**

```python
from models.desarrollo.flota import FlotaCreate, crud

payload = FlotaCreate(
    flo_dom_tractor="flo_dom_tractor_demo",
    flo_km_odo=1,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.flo_id)
setattr(registro, 'flo_nombre', "flo_nombre_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.flo_id)
```

## FlotaCubiertas

- **Archivo:** `backend/src/models/desarrollo/flota_cubiertas.py`

- **Módulo:** `models.desarrollo.flota_cubiertas`

- **Clases:** `FlotaCubiertasCreate` (entrada) y `FlotaCubiertas` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `fc_fecha` | `date` | Sí | — |
| `fc_patente` | `str` | Sí | min_length=3, max_length=10 |
| `fc_tipo` | `int` | Sí | — |
| `fc_km_odo` | `int` | Sí | — |
| `fc_id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**: —


**Enums**: —


**Ejemplo CRUD**

```python
from datetime import date
from models.desarrollo.flota_cubiertas import FlotaCubiertasCreate, crud

payload = FlotaCubiertasCreate(
    fc_fecha=date.today(),
    fc_patente="fc_patente_demo",
    fc_tipo=1,
    fc_km_odo=1,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.fc_id)
setattr(registro, 'fc_fecha', date.today())
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.fc_id)
```

## Gasto

- **Archivo:** `backend/src/models/desarrollo/gasto.py`

- **Módulo:** `models.desarrollo.gasto`

- **Clases:** `GastoCreate` (entrada) y `Gasto` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `gas_hdr_id` | `int` | Sí | foreign_key='hdr.hdr_id' |
| `gas_fecha` | `datetime` | Sí | — |
| `gas_lugar` | `str` | No | None, min_length=3, max_length=100 |
| `gas_ticket` | `int` | No | default=0, ge=0 |
| `gas_cat_id` | `int` | Sí | foreign_key='catnovedad.cn_id' |
| `gas_proveedor` | `str` | No | None, min_length=3, max_length=200 |
| `gas_monto` | `float` | No | default=0, ge=0 |
| `gas_img` | `str` | No | None, min_length=3, max_length=200 |
| `gas_id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `cat_nov` | `Optional['CatNovedad']` | `gastos` | `CatNovedad` |

**Enums**: —


**Ejemplo CRUD**

```python
from datetime import datetime
from models.desarrollo.gasto import GastoCreate, crud

payload = GastoCreate(
    gas_hdr_id=1,
    gas_fecha=datetime.now(),
    gas_cat_id=1,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.gas_id)
setattr(registro, 'gas_lugar', "gas_lugar_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.gas_id)
```

## HDR

- **Archivo:** `backend/src/models/desarrollo/hdr.py`

- **Módulo:** `models.desarrollo.hdr`

- **Clases:** `HDRCreate` (entrada) y `HDR` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `hdr_flota_id` | `int` | Sí | foreign_key='flota.flo_id' |
| `hdr_batea_id` | `Optional[int]` | Sí | foreign_key='batea.bat_id' |
| `hdr_destino_id` | `int` | Sí | foreign_key='destino.des_id' |
| `hdr_comentarios` | `Optional[str]` | No | None, max_length=250 |
| `hdr_tanque_lleno` | `bool` | Sí | — |
| `hdr_tanque_lleno_urea` | `bool` | Sí | — |
| `hdr_id` | `Optional[int]` | No | default=None, primary_key=True |
| `hdr_chofer_id` | `int` | Sí | foreign_key='chofer.chofer_id' |
| `hdr_carga` | `datetime` | No | default=None, sa_column=Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('CURRENT_TIMESTAMP')) |
| `hdr_modif` | `datetime` | No | default=None, sa_column=Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('CURRENT_TIMESTAMP')) |
| `hdr_active` | `bool` | No | — |
| `hdr_rendida` | `bool` | No | — |
| `hdr_fecha_rendida` | `Optional[datetime]` | No | — |
| `hdr_obs_rendida` | `Optional[str]` | No | None, max_length=250 |
| `hdr_user_rendida` | `Optional[str]` | No | — |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `batea` | `Optional['Batea']` | `hdr` | `Batea` |
| `destino` | `Optional['Destino']` | `hdr` | `Destino` |
| `flota` | `Optional['Flota']` | `hdr` | `Flota` |
| `chofer` | `Optional['Chofer']` | `hdr` | `Chofer` |

**Enums**: —


**Ejemplo CRUD**

```python
from models.desarrollo.hdr import HDRCreate, crud

payload = HDRCreate(
    hdr_flota_id=1,
    hdr_batea_id=1,
    hdr_destino_id=1,
    hdr_tanque_lleno=True,
    hdr_tanque_lleno_urea=True,
    hdr_chofer_id=1,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.hdr_id)
setattr(registro, 'hdr_comentarios', "hdr_comentarios_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.hdr_id)
```

## Historico

- **Archivo:** `backend/src/models/desarrollo/historico.py`

- **Módulo:** `models.desarrollo.historico`

- **Clases:** `HistoricoCreate` (entrada) y `Historico` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `his_cub_id` | `int` | Sí | foreign_key='cubiertas.cub_id' |
| `his_fecha` | `datetime` | Sí | — |
| `his_km` | `int` | No | default=0, ge=0 |
| `his_mm` | `int` | No | default=0, ge=0 |
| `his_accion` | `AccionType` | Sí | — |
| `his_valor` | `int | None` | No | — |
| `his_deposito` | `str | None` | No | — |
| `his_tractor` | `str | None` | No | — |
| `his_posicion` | `str | None` | No | — |
| `his_observaciones` | `Optional[str]` | No | None, max_length=255 |
| `id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `cubiertas` | `Optional['Cubiertas']` | `historico` | `Cubiertas` |

**Enums**

- `AccionType`: `RECAPADO` = 'RECAPADO', `REPARACION` = 'REPARACION', `MANTENIMIENTO` = 'MANTENIMIENTO', `DESGASTE` = 'DESGASTE', `ALTA` = 'ALTA', `BAJA` = 'BAJA', `DEFINITIVA` = 'DEFINITIVA', `ROTACION` = 'ROTACION', `UBICACION` = 'UBICACION', `MOVIMIENTO_INTERNO` = 'MOVIMIENTO INTERNO', `REAJUSTE` = 'REAJUSTE'

**Ejemplo CRUD**

```python
from datetime import datetime
from models.desarrollo.historico import HistoricoCreate, AccionType, crud

payload = HistoricoCreate(
    his_cub_id=1,
    his_fecha=datetime.now(),
    his_accion=AccionType.RECAPADO,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.id)
setattr(registro, 'his_km', 42)
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.id)
```

## HistoricoAceite

- **Archivo:** `backend/src/models/desarrollo/historico_aceite.py`

- **Módulo:** `models.desarrollo.historico_aceite`

- **Clases:** `HistoricoAceiteCreate` (entrada) y `HistoricoAceite` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `hist_flota_patente` | `str` | Sí | — |
| `hist_aceite_fecha_cambio` | `datetime` | Sí | — |
| `hist_aceite_fecha_ultimo_cambio` | `Optional[datetime]` | No | — |
| `hist_tipo_aceite` | `Optional[int]` | No | default=None, foreign_key='tipoaceite.id' |
| `hist_ultimo_tipo_aceite` | `Optional[int]` | No | default=None, foreign_key='tipoaceite.id' |
| `hist_taller` | `Optional[int]` | No | default=None, foreign_key='taller.id' |
| `hist_aceite_km` | `str` | Sí | — |
| `hist_user_flota` | `str` | Sí | — |
| `id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `taller` | `Optional['Taller']` | `historico_aceite` | `Taller` |
| `tipo_aceite` | `Optional['TipoAceite']` | `historico_actual` | `TipoAceite` |
| `ultimo_tipo_aceite` | `Optional['TipoAceite']` | `historico_ultimo` | `TipoAceite` |

**Enums**: —


**Ejemplo CRUD**

```python
from datetime import datetime
from models.desarrollo.historico_aceite import HistoricoAceiteCreate, crud

payload = HistoricoAceiteCreate(
    hist_flota_patente="hist_flota_patente_demo",
    hist_aceite_fecha_cambio=datetime.now(),
    hist_aceite_km="hist_aceite_km_demo",
    hist_user_flota="hist_user_flota_demo",
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.id)
setattr(registro, 'hist_aceite_fecha_ultimo_cambio', datetime.now())
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.id)
```

## MarcaModelo

- **Archivo:** `backend/src/models/desarrollo/marcas_modelos.py`

- **Módulo:** `models.desarrollo.marcas_modelos`

- **Clases:** `MarcaModeloCreate` (entrada) y `MarcaModelo` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `marca` | `str` | Sí | min_length=3, max_length=50 |
| `modelo` | `str` | Sí | min_length=3, max_length=100 |
| `id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**: —


**Enums**: —


**Ejemplo CRUD**

```python
from models.desarrollo.marcas_modelos import MarcaModeloCreate, crud

payload = MarcaModeloCreate(
    marca="marca_demo",
    modelo="modelo_demo",
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.id)
setattr(registro, 'marca', "marca_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.id)
```

## Movimiento

- **Archivo:** `backend/src/models/desarrollo/movimiento.py`

- **Módulo:** `models.desarrollo.movimiento`

- **Clases:** `MovimientoCreate` (entrada) y `Movimiento` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `mov_hdr_id` | `int` | Sí | foreign_key='hdr.hdr_id' |
| `mov_inicio` | `datetime` | Sí | — |
| `mov_inicio_real` | `datetime` | Sí | — |
| `mov_fin` | `Optional[datetime]` | No | — |
| `mov_fin_real` | `Optional[datetime]` | No | — |
| `mov_lat_inicio` | `Optional[float]` | No | — |
| `mov_lng_inicio` | `Optional[float]` | No | — |
| `mov_lat_fin` | `Optional[float]` | No | — |
| `mov_lng_fin` | `Optional[float]` | No | — |
| `mov_km_odo_inicio` | `int` | No | default=0, ge=0 |
| `mov_km_odo_fin` | `Optional[int]` | No | default=None, ge=0 |
| `mov_tipo_km_id` | `int` | Sí | foreign_key='tipokilometro.tk_id' |
| `mov_lugar_inicio` | `str` | Sí | min_length=3, max_length=60 |
| `mov_lugar_fin` | `Optional[str]` | No | default=None, max_length=60 |
| `mov_lleva_carga` | `bool` | No | — |
| `mov_permanencia` | `int` | No | default=0, ge=0 |
| `mov_cruce_frontera` | `bool` | No | — |
| `mov_id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `tipokm` | `Optional['TipoKilometro']` | `movimiento` | `TipoKilometro` |

**Enums**: —


**Ejemplo CRUD**

```python
from datetime import datetime
from models.desarrollo.movimiento import MovimientoCreate, crud

payload = MovimientoCreate(
    mov_hdr_id=1,
    mov_inicio=datetime.now(),
    mov_inicio_real=datetime.now(),
    mov_tipo_km_id=1,
    mov_lugar_inicio="mov_lugar_inicio_demo",
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.mov_id)
setattr(registro, 'mov_fin', datetime.now())
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.mov_id)
```

## Novedad

- **Archivo:** `backend/src/models/desarrollo/novedad.py`

- **Módulo:** `models.desarrollo.novedad`

- **Clases:** `NovedadCreate` (entrada) y `Novedad` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `nov_hdr_id` | `int` | Sí | foreign_key='hdr.hdr_id' |
| `nov_fecha` | `datetime` | Sí | — |
| `nov_lugar` | `str` | No | None, min_length=3, max_length=60 |
| `nov_desc` | `Optional[str]` | No | None, max_length=255 |
| `nov_km_odo` | `int` | No | default=0, ge=0 |
| `nov_cat_id` | `int` | Sí | foreign_key='catnovedad.cn_id' |
| `nov_img` | `str` | Sí | — |
| `nov_solucionado` | `bool` | Sí | — |
| `nov_tractor` | `bool` | No | default=True |
| `nov_observaciones` | `Optional[str]` | No | None, max_length=255 |
| `nov_estado` | `EstadoType` | Sí | — |
| `nov_id` | `Optional[int]` | No | default=None, primary_key=True |
| `nov_infraccion` | `bool` | No | default=False |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `ot_nov` | `List['OT_Nov']` | `novedad` | `OT_Nov` |

**Enums**

- `EstadoType`: `PENDIENTE` = 'PENDIENTE', `RESUELTA` = 'RESUELTA', `ASIGNADA` = 'ASIGNADA', `ATENDIDA` = 'ATENDIDA', `CERRADA` = 'CERRADA'

**Ejemplo CRUD**

```python
from datetime import datetime
from models.desarrollo.novedad import NovedadCreate, EstadoType, crud

payload = NovedadCreate(
    nov_hdr_id=1,
    nov_fecha=datetime.now(),
    nov_cat_id=1,
    nov_img="nov_img_demo",
    nov_solucionado=True,
    nov_estado=EstadoType.PENDIENTE,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.nov_id)
setattr(registro, 'nov_lugar', "nov_lugar_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.nov_id)
```

## OT

- **Archivo:** `backend/src/models/desarrollo/orden_trabajo.py`

- **Módulo:** `models.desarrollo.orden_trabajo`

- **Clases:** `OTCreate` (entrada) y `OT` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `ot_fecha` | `datetime` | Sí | — |
| `ot_patente` | `str` | No | None, min_length=3, max_length=100 |
| `ot_taller` | `int` | Sí | foreign_key='taller.id' |
| `ot_programada` | `bool` | Sí | — |
| `ot_fecha_taller` | `datetime` | Sí | — |
| `ot_observaciones` | `str` | No | None, min_length=3, max_length=200 |
| `ot_estado` | `OTEstadoType` | Sí | — |
| `ot_proveedor` | `Optional[int]` | No | default=None, foreign_key='proveedores.id' |
| `ot_monto` | `Optional[float]` | No | default=0, ge=0 |
| `ot_nr_factura` | `Optional[int]` | No | default=None |
| `ot_imgs` | `str | None` | No | — |
| `ot_id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `ot_nov` | `Optional['OT_Nov']` | `ot` | `OT_Nov` |
| `proveedores` | `Optional['Proveedores']` | `ot_p` | `Proveedores` |
| `taller` | `Optional['Taller']` | `ot_t` | `Taller` |

**Enums**

- `OTEstadoType`: `PROGRAMADO` = 'PROGRAMADO', `EN_TALLER` = 'EN TALLER', `DEMORADO` = 'DEMORADO', `CERRADO` = 'CERRADO'

**Ejemplo CRUD**

```python
from datetime import datetime
from models.desarrollo.orden_trabajo import OTCreate, OTEstadoType, crud

payload = OTCreate(
    ot_fecha=datetime.now(),
    ot_taller=1,
    ot_programada=True,
    ot_fecha_taller=datetime.now(),
    ot_estado=OTEstadoType.PROGRAMADO,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.ot_id)
setattr(registro, 'ot_patente', "ot_patente_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.ot_id)
```

## OT_Nov

- **Archivo:** `backend/src/models/desarrollo/ot_nov.py`

- **Módulo:** `models.desarrollo.ot_nov`

- **Clases:** `OT_NovCreate` (entrada) y `OT_Nov` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `ot_id` | `int` | Sí | foreign_key='ot.ot_id' |
| `nov_id` | `int` | Sí | foreign_key='novedad.nov_id' |
| `cumplida` | `bool` | Sí | — |
| `fecha` | `datetime` | Sí | — |
| `observaciones` | `str` | No | None, min_length=3, max_length=200 |
| `id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `ot` | `Optional['OT']` | `ot_nov` | `OT` |
| `novedad` | `Optional['Novedad']` | `ot_nov` | `Novedad` |

**Enums**: —


**Ejemplo CRUD**

```python
from datetime import datetime
from models.desarrollo.ot_nov import OT_NovCreate, crud

payload = OT_NovCreate(
    ot_id=1,
    nov_id=1,
    cumplida=True,
    fecha=datetime.now(),
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.id)
setattr(registro, 'observaciones', "observaciones_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.id)
```

## Otc

- **Archivo:** `backend/src/models/desarrollo/otc.py`

- **Módulo:** `models.desarrollo.otc`

- **Clases:** `OtcCreate` (entrada) y `Otc` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `otc_fecha` | `date` | Sí | — |
| `cub_id` | `int` | Sí | foreign_key='cubiertas.cub_id' |
| `otc_trab_id` | `int` | Sí | foreign_key='trabajo.id' |
| `otc_tipo` | `int` | Sí | foreign_key='tipotratamiento.id' |
| `otc_general_id` | `Optional[int]` | No | default=None, foreign_key='otcgeneral.id' |
| `otc_estado` | `EstadoOtcType` | Sí | — |
| `otc_id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `trabajos` | `Optional['Trabajo']` | `—` | `Trabajo` |
| `tipos` | `Optional['TipoTratamiento']` | `—` | `TipoTratamiento` |
| `cubiertas` | `Optional['Cubiertas']` | `otc_cubs` | `Cubiertas` |
| `otc_general` | `Optional['OtcGeneral']` | `otcs` | `OtcGeneral` |

**Enums**

- `EstadoOtcType`: `SIN_ASIGNAR` = 'SIN ASIGNAR', `PENDIENTE` = 'PENDIENTE', `CERRADA` = 'CERRADA'

**Ejemplo CRUD**

```python
from datetime import date
from models.desarrollo.otc import OtcCreate, EstadoOtcType, crud

payload = OtcCreate(
    otc_fecha=date.today(),
    cub_id=1,
    otc_trab_id=1,
    otc_tipo=1,
    otc_estado=EstadoOtcType.SIN_ASIGNAR,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.otc_id)
setattr(registro, 'otc_general_id', 42)
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.otc_id)
```

## OtcGeneral

- **Archivo:** `backend/src/models/desarrollo/otc_general.py`

- **Módulo:** `models.desarrollo.otc_general`

- **Clases:** `OtcGeneralCreate` (entrada) y `OtcGeneral` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `otc_gen_fecha` | `date` | Sí | — |
| `otc_prov_id` | `int` | Sí | foreign_key='proveedores.id' |
| `otc_estado_id` | `int` | Sí | foreign_key='estado.id' |
| `otc_dep_id` | `int` | Sí | foreign_key='deposito.id' |
| `otc_gen_obs` | `str` | No | None, min_length=3, max_length=200 |
| `id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `proveedores` | `Optional['Proveedores']` | `—` | `Proveedores` |
| `depositos` | `Optional['Deposito']` | `—` | `Deposito` |
| `estados` | `Optional['Estado']` | `—` | `Estado` |
| `otcs` | `List['Otc']` | `otc_general` | `Otc` |

**Enums**: —


**Ejemplo CRUD**

```python
from datetime import date
from models.desarrollo.otc_general import OtcGeneralCreate, crud

payload = OtcGeneralCreate(
    otc_gen_fecha=date.today(),
    otc_prov_id=1,
    otc_estado_id=1,
    otc_dep_id=1,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.id)
setattr(registro, 'otc_gen_obs', "otc_gen_obs_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.id)
```

## Posicion

- **Archivo:** `backend/src/models/desarrollo/posicion.py`

- **Módulo:** `models.desarrollo.posicion`

- **Clases:** `PosicionCreate` (entrada) y `Posicion` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `pos_ubi` | `int` | Sí | — |
| `pos_nombre` | `str` | Sí | min_length=3, max_length=200 |
| `id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**: —


**Enums**: —


**Ejemplo CRUD**

```python
from models.desarrollo.posicion import PosicionCreate, crud

payload = PosicionCreate(
    pos_ubi=1,
    pos_nombre="pos_nombre_demo",
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.id)
setattr(registro, 'pos_ubi', 42)
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.id)
```

## Proveedores

- **Archivo:** `backend/src/models/desarrollo/proveedores.py`

- **Módulo:** `models.desarrollo.proveedores`

- **Clases:** `ProveedoresCreate` (entrada) y `Proveedores` (tabla).


**Campos**

| Campo | Tipo | Requerido | Configuración |
|-------|------|-----------|---------------|
| `prov_des` | `Optional[str]` | Sí | min_length=3, max_length=200 |
| `prov_nombre` | `str` | Sí | min_length=3, max_length=200 |
| `prov_razon_social` | `str` | Sí | min_length=3, max_length=200 |
| `prov_contacto` | `str` | Sí | min_length=3, max_length=200 |
| `prov_ubic` | `Optional[str]` | Sí | min_length=3, max_length=200 |
| `prov_categ` | `int` | Sí | foreign_key='categoriaproveedores.id' |
| `id` | `Optional[int]` | No | default=None, primary_key=True |

**Relaciones**

| Atributo | Tipo | back_populates | Modelo relacionado |
|----------|------|----------------|--------------------|
| `categ_proveedores` | `Optional['CategoriaProveedores']` | `proveedores` | `CategoriaProveedores` |
| `ot_p` | `Optional['OT']` | `proveedores` | `OT` |

**Enums**: —


**Ejemplo CRUD**

```python
from models.desarrollo.proveedores import ProveedoresCreate, crud

payload = ProveedoresCreate(
    prov_des="prov_des_demo",
    prov_nombre="prov_nombre_demo",
    prov_razon_social="prov_razon_social_demo",
    prov_contacto="prov_contacto_demo",
    prov_ubic="prov_ubic_demo",
    prov_categ=1,
)
nuevo_registro = crud.create(payload)
todos = crud.list()
registro = crud.get(nuevo_registro.id)
setattr(registro, 'prov_des', "prov_des_actualizado")
registro_actualizado = crud.update(registro)
crud.delete(registro_actualizado.id)
```
