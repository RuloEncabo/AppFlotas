# Documentación del Backend FastAPI de AppFlotas

## 1. Resumen general
El backend de AppFlotas está construido con FastAPI y SQLModel para exponer servicios REST que gestionan la operación de una flota de transporte, desde la autenticación de usuarios hasta la administración de hojas de ruta, cargas de combustible, órdenes de trabajo y métricas de desempeño. La aplicación centraliza la configuración de CORS, el montaje de archivos estáticos y la carga inicial de datos desde `main.py`, donde se registran los diferentes módulos de rutas y se ejecutan los hooks de arranque del sistema.【F:backend/src/main.py†L1-L43】

## 2. Documentación técnica
### 2.1 Arquitectura y stack tecnológico
- **Framework principal:** FastAPI, configurado con `FastAPI()` y organizado mediante routers temáticos por dominio funcional (seguridad, conductor, flota, parámetros).【F:backend/src/main.py†L13-L42】【F:backend/src/routes/routes.py†L1-L112】
- **ORM y modelado:** SQLModel y SQLAlchemy se usan para mapear las entidades de negocio y gestionar el ORM sobre PostgreSQL (controlado vía `create_engine`).【F:backend/src/database.py†L1-L27】【F:backend/src/models/seguridad/user.py†L1-L27】
- **Dependencias clave:** autenticación JWT (`fastapi-jwt`), validación de correo electrónico (`email-validator`), gestión de contraseñas (`passlib`/`bcrypt`), manejo de archivos (`python-multipart`), pandas para reportes y soporte para Excel/CSV (`openpyxl`). Todas se declaran en `requirements.txt` para facilitar la instalación reproducible.【F:backend/requirements.txt†L1-L38】

### 2.2 Configuración y despliegue
- **Variables de entorno:** `config/prod.py` utiliza `BaseSettings` de Pydantic para cargar `DB_URL`, dominios CORS permitidos, dominio de cookies y la clave secreta desde un archivo `.env.dev`. Esta clase se cachea con `lru_cache` para evitar recargas en cada petición.【F:backend/src/config/prod.py†L1-L19】
- **Montaje de recursos estáticos:** `main.py` expone carpetas físicas bajo `/files` y `/archivos`, permitiendo servir evidencias y documentos asociados a operaciones de flota.【F:backend/src/main.py†L25-L33】
- **Inicialización de datos:** En el evento `startup` se invoca `carga_inicial_datos()`, que revisa la tabla de roles y, si está vacía, trunca las tablas y ejecuta un script SQL inicial (`data/sql/bd_init.sql`). Esto garantiza que la aplicación tenga configuraciones mínimas para operar.【F:backend/src/main.py†L35-L41】【F:backend/src/database.py†L18-L33】

### 2.3 Gestión de la base de datos
- El módulo `database.py` centraliza la creación del motor SQLAlchemy y la dependencia `get_db()` que provee sesiones con `commit` y `close` automáticos en cada petición.【F:backend/src/database.py†L1-L17】
- Se utiliza un enfoque “unit of work” por endpoint: cada operación obtiene una sesión `Session(engine)` mediante `Depends`, asegurando integridad transaccional.
- Las entidades están separadas por dominio (`models/seguridad`, `models/desarrollo`), facilitando la cohesión de datos. Ejemplos: `Usuario`/`Rol` para seguridad, `HDR`, `Movimiento`, `Carga`, `OT` para la operación diaria.【F:backend/src/models/seguridad/user.py†L1-L27】【F:backend/src/models/desarrollo/hdr.py†L1-L36】

### 2.4 Enrutamiento y módulos
- `routes/routes.py` define los routers principales con prefijos y etiquetas, además de las dependencias de permisos (`permisoChofer`, `permisoFlota`, `permisoChoferFlota`). Esto actúa como puerta de entrada para aplicar políticas de autorización por dominio funcional.【F:backend/src/routes/routes.py†L41-L88】
- **Seguridad:** `routes/seguridad/auth.py` implementa login/logout mediante JWT almacenados en cookies HTTPOnly, además de utilidades para alta de usuarios y actualización masiva de contraseñas.【F:backend/src/routes/seguridad/auth.py†L1-L60】
- **Parámetros maestros:** módulos bajo `routes/parametros` exponen CRUD sobre catálogos como choferes, tipos de combustible, destinos, talleres y archivos multimedia. Ejemplo: `chofer.py` vincula entidades `Chofer` con `Usuario` y valida duplicados por sesión.【F:backend/src/routes/parametros/chofer.py†L1-L58】
- **Operación de conductores:** rutas en `routes/conductor` gestionan hojas de ruta (HDR), movimientos, cargas de combustible, gastos y viáticos, con lógica de validación de kilometrajes y cierres de HDR.【F:backend/src/routes/conductor/hdr.py†L1-L123】【F:backend/src/routes/conductor/movimiento.py†L1-L89】
- **Gestión de flota:** routers bajo `routes/flota` administran órdenes de trabajo, novedades, métricas, historial de cubiertas y consumos. `orden_trabajo.py` coordina OT y su relación con novedades; `metricas.py` calcula indicadores agregados (consumo, kilómetros, disponibilidad).【F:backend/src/routes/flota/orden_trabajo.py†L1-L95】【F:backend/src/routes/flota/metricas.py†L1-L118】
- **Servicios auxiliares:** `cargar_foto.py` y `cargar_archivo.py` permiten almacenar y listar evidencias en el sistema de archivos del servidor, controlando extensiones permitidas y estructura de carpetas.【F:backend/src/routes/parametros/cargar_foto.py†L1-L62】【F:backend/src/routes/parametros/cargar_archivo.py†L1-L40】

### 2.5 Seguridad y permisos
- La autenticación se basa en `fastapi-jwt`, creando tokens de acceso y refresco con claims mínimos (correo y rol). Las credenciales se inyectan en endpoints críticos mediante `Security(access_security)`, permitiendo obtener información del chofer o usuario de flota autenticado.【F:backend/src/routes/seguridad/auth.py†L16-L37】【F:backend/src/routes/conductor/hdr.py†L27-L38】
- Existen dependencias de autorización externas en `data.functions` (no incluidas en el repositorio) que probablemente validan los roles y permisos para choferes, administradores de flota y combinaciones de ambos. Es necesario desplegar estos módulos junto al backend para asegurar el control de acceso esperado.【F:backend/src/routes/routes.py†L47-L73】
- Las contraseñas se almacenan con hashing (`get_hashed_password`) y se evita exponer tokens directamente en la respuesta al usar cookies HTTPOnly.【F:backend/src/routes/seguridad/auth.py†L16-L37】

### 2.6 Manejo de archivos estáticos y evidencias
- Las rutas `/files` y `/archivos` montadas en `main.py` exponen contenido generado por `cargar_foto.py` y `cargar_archivo.py`, respectivamente. Las evidencias se organizan por tipo (novedades, facturas, cubiertas) y entidades (HDR, cubiertas).【F:backend/src/main.py†L25-L33】【F:backend/src/routes/parametros/cargar_foto.py†L1-L62】
- Se recomienda asegurar permisos del sistema de archivos y almacenamiento persistente en despliegues productivos.

## 3. Documentación funcional
### 3.1 Roles y perfiles
- **Chofer:** accede a `/conductor` para gestionar su hoja de ruta activa, registrar movimientos, cargas de combustible, gastos y viáticos. Los endpoints verifican que sólo interactúe con su HDR vigente y que los kilometrajes sean consistentes.【F:backend/src/routes/conductor/hdr.py†L23-L122】【F:backend/src/routes/conductor/movimiento.py†L26-L74】
- **Usuario de flota / administración:** opera bajo `/userflota` y `/admin`, gestionando métricas, historial, órdenes de trabajo y fotos asociadas a las unidades. Se apoya en utilidades como `obtener_user_flota` para registrar el responsable de cambios como reemplazos de aceite.【F:backend/src/routes/flota/orden_trabajo.py†L1-L42】【F:backend/src/routes/flota/metricas.py†L1-L118】
- **Seguridad / desarrolladores:** disponen de `/seguridad` y `/desarrollo` para el mantenimiento de usuarios, catálogos y scripts auxiliares. El endpoint `POST /seguridad/` crea usuarios con rol `chofer` por defecto, permitiendo expandir la base de operadores.【F:backend/src/routes/seguridad/auth.py†L1-L60】

### 3.2 Flujos principales
1. **Autenticación y gestión de sesiones**
   - El usuario envía credenciales a `POST /seguridad/login`; al validar, se generan cookies de acceso y refresco. El cierre de sesión (`DELETE /seguridad/logout`) invalida ambas cookies para evitar reutilización de sesiones.【F:backend/src/routes/seguridad/auth.py†L16-L37】
2. **Administración de catálogos**
   - Los administradores de parámetros utilizan endpoints como `GET/POST /params/chofer` para consultar y registrar choferes, vinculándolos con usuarios existentes. Al crear un chofer se verifica que el usuario autenticado no tenga un chofer duplicado.【F:backend/src/routes/parametros/chofer.py†L1-L51】
3. **Operación diaria del chofer**
   - Los choferes consultan su HDR activa (`GET /conductor/hdr/chofer`), registran movimientos (`POST /conductor/movimientos`) y cierran la hoja cuando todos los registros son consistentes en fechas y odómetros (`PUT /conductor/hdr/desactivar`). El backend calcula totales de combustible, kilómetros, gastos y viáticos para mostrar indicadores en la app móvil/web.【F:backend/src/routes/conductor/hdr.py†L23-L123】
4. **Gestión de órdenes de trabajo y mantenimiento**
   - Los usuarios de flota generan OT mediante `POST /userflota/ot`, asocian novedades y programan visitas a taller. El módulo controla estados (Programado, En taller, Demorado, Cerrado) y actualiza automáticamente la situación de las novedades asignadas.【F:backend/src/routes/flota/orden_trabajo.py†L37-L95】
   - El flujo de mantenimiento de aceite (`PUT /userflota/ot/cambio_aceite`) registra fecha, kilometraje, tipo de aceite y taller responsable, quedando trazabilidad en `HistoricoAceite`.【F:backend/src/routes/flota/orden_trabajo.py†L19-L42】
5. **Indicadores y analítica**
   - `GET /userflota/metricas/analitica` agrega información de HDR para obtener consumo promedio, segmentación por kilometraje y disponibilidad de flotas. Otros endpoints calculan kilómetros por flota o chofer, generando insumos para tableros de control.【F:backend/src/routes/flota/metricas.py†L32-L117】
6. **Gestión documental**
   - Las cargas de fotos y documentos (`POST /params/cargar_foto/cargar_foto`, `POST /params/cargar_archivo/cargar_archivo`) permiten adjuntar evidencias a HDR, novedades, cubiertas y documentación corporativa. Los listados (`GET /params/cargar_foto/listado_fotos`, `GET /params/cargar_archivo/leer_documentos`) facilitan su consumo desde el frontend.【F:backend/src/routes/parametros/cargar_foto.py†L11-L62】【F:backend/src/routes/parametros/cargar_archivo.py†L11-L33】

### 3.3 Consideraciones operativas
- La lógica de negocio complementaria (validación de permisos, cálculos de consumo, rotación de cubiertas) se encuentra en el paquete `data.functions` y debe estar disponible en el entorno de ejecución para que los endpoints funcionen correctamente.【F:backend/src/routes/routes.py†L47-L88】
- Algunos procesos dependen de la zona horaria de Argentina (`America/Argentina/Buenos_Aires`) para normalizar fechas de movimientos, por lo que el servidor debe tener soporte para `zoneinfo` actualizado.【F:backend/src/routes/conductor/movimiento.py†L32-L72】
- Las rutas que manipulan archivos asumen que existen las carpetas `data/files` y `data/archivos`; es recomendable aprovisionarlas y configurar backups en despliegues productivos.【F:backend/src/routes/parametros/cargar_foto.py†L23-L62】【F:backend/src/routes/parametros/cargar_archivo.py†L14-L33】

---
Esta documentación resume la estructura técnica y el comportamiento funcional del backend de AppFlotas para facilitar su mantenimiento, despliegue y evolución.
