# Documentación del Frontend de AppFlotas

## 1. Resumen general
El frontend de AppFlotas está construido con Next.js 13 y React 18 sobre el template Vuexy, integrando Material UI (MUI) como librería de componentes y múltiples módulos de visualización (FullCalendar, ApexCharts, Chart.js) para soportar la operación de choferes, administradores de flota y personal de taller. La aplicación organiza la navegación por roles mediante un control de acceso (ACL) basado en CASL y sincroniza el estado de autenticación con el backend a través de servicios Axios que gestionan sesiones con cookies y almacenamiento en `localStorage`.

## 2. Documentación técnica
### 2.1 Arquitectura y stack tecnológico
- **Framework principal:** Next.js 13 con rutas tradicionales en `src/pages`, scripts de desarrollo y construcción definidos en `package.json` (`next dev`, `next build`, `next start`).【F:frontend/package.json†L1-L43】
- **UI y diseño:** Material UI (`@mui/material`, `@mui/lab`, `@mui/system`) es la base de los componentes visuales, complementada con Emotion para estilos y librerías de gráficos, calendarios y mapas según las necesidades operativas.【F:frontend/package.json†L18-L63】
- **Gestión de formularios y validación:** Formularios complejos utilizan `react-hook-form` y esquemas `yup`, como se observa en la página de login.【F:frontend/src/pages/login/index.js†L21-L98】
- **Control de acceso:** CASL (`@casl/ability`, `@casl/react`) alimenta los guards de navegación definidos en `src/configs/acl` y consumidos en `_app.js` para permitir o bloquear vistas según el rol autenticado.【F:frontend/package.json†L15-L34】【F:frontend/src/pages/_app.js†L17-L135】

### 2.2 Estructura de carpetas relevante
- `src/pages`: define las rutas públicas y privadas (login, registro, módulos de chofer, flota, taller y administración).【F:frontend/src/pages/login/index.js†L1-L172】【F:frontend/src/pages/flota/flota-general/index.js†L1-L15】
- `src/layouts`: layouts globales (`UserLayout`) y componentes de navegación vertical/horizontal con soporte ACL.【F:frontend/src/layouts/UserLayout.js†L1-L134】
- `src/components`: colección de widgets reutilizables (tablas HDR, formularios, diálogos de confirmación) segmentados por dominio funcional.【F:frontend/src/components/flota-components/tabla-hdr-general.js†L1-L196】
- `src/views`: vistas de alto nivel que orquestan componentes, por ejemplo `flota-views/GeneralView` agrega tablas de HDR y novedades.【F:frontend/src/views/pages/flota-views/GeneralView.js†L1-L18】
- `src/services`: clientes Axios y agrupadores de endpoints (`auth`, `flota_endpoints`, `chofer_endpoints`) reutilizados por las vistas.【F:frontend/src/services/auth/index.js†L1-L30】
- `src/context`: proveedores de estado compartido como `AuthContext`, encargado de hidratar la sesión del usuario y propagar alertas de expiración.【F:frontend/src/context/AuthContext.js†L1-L93】

### 2.3 Configuración y despliegue
- **Variables de entorno:** `src/config.js` expone `ELTA_URL` a partir de `NEXT_PUBLIC_ELTA_URL`, que alimenta los endpoints del servicio de autenticación definidos en `src/configs/auth.js`. Para ejecutar en local se debe definir esta variable en un archivo `.env.local`.【F:frontend/src/config.js†L1-L4】【F:frontend/src/configs/auth.js†L1-L11】
- **Theme provider:** `_app.js` monta `UserLayout` y configura el tema a través de `UserThemeOptions`, habilitando personalizaciones (modo claro/oscuro, RTL) desde el contexto de ajustes.【F:frontend/src/pages/_app.js†L44-L131】【F:frontend/src/layouts/UserThemeOptions.js†L1-L148】
- **Comandos de ejecución:** `npm run dev` levanta el servidor de desarrollo, mientras que `npm run build` y `npm run start` generan y sirven la aplicación optimizada.【F:frontend/package.json†L5-L12】

### 2.4 Gestión de autenticación y estado
- **Contexto de autenticación:** `AuthProvider` inicializa el usuario desde `localStorage`, envuelve la app y expone métodos `login` y `logout`. El login guarda datos de usuario y redirige a la raíz; el logout limpia cookies/localStorage y notifica al backend en segundo plano.【F:frontend/src/context/AuthContext.js†L1-L83】
- **Servicios Axios:** `axiosService` centraliza la configuración HTTP con `withCredentials` y un interceptor que captura errores 401 para disparar `handleSessionExpired`, eliminando cookies, datos locales y mostrando una alerta persistente antes de redirigir a `/login`.【F:frontend/src/services/axios.js†L1-L17】【F:frontend/src/services/auth/index.js†L1-L30】
- **Protección de rutas:** `_app.js` aplica `AuthGuard` y `AclGuard` alrededor de cada página, leyendo la configuración ACL declarada en las páginas (`Component.acl`) o usando `defaultACLObj` para rutas públicas. Esto evita renderizar contenido hasta validar el rol y estado de sesión.【F:frontend/src/pages/_app.js†L86-L132】

### 2.5 Navegación y control de acceso
- **Menú lateral:** `src/navigation/vertical/index.js` agrupa enlaces por rol (Chofer, Flota, Taller, Admin) y asocia cada ítem con la acción `usar` y el sujeto correspondiente. CASL evalúa estas reglas en componentes `CanViewNavLink`, `CanViewNavGroup` y `CanViewNavSectionTitle` para ocultar entradas no autorizadas.【F:frontend/src/navigation/vertical/index.js†L1-L109】【F:frontend/src/layouts/components/acl/CanViewNavLink.js†L1-L34】
- **Rutas con ACL explícito:** páginas como `/flota/flota-general` o `/chofer/chofer-general` declaran `Component.acl` indicando la acción y sujeto necesarios para acceder, lo que simplifica la gobernanza de permisos en un solo lugar.【F:frontend/src/pages/flota/flota-general/index.js†L6-L13】【F:frontend/src/pages/chofer/chofer-general/index.js†L37-L42】

### 2.6 Componentes y vistas clave
- **Vistas de flota:** `GeneralView`, `HDRView`, `MantenimientoPreventivoView`, `NovView` y `ParametrosView` combinan encabezados, tablas y formularios especializados. Por ejemplo, `GeneralView` muestra listados de HDR y novedades reutilizando componentes de `src/components/flota-components`.【F:frontend/src/views/pages/flota-views/GeneralView.js†L1-L18】【F:frontend/src/components/flota-components/tabla-nov-general.js†L1-L191】
- **Gestión de cubiertas:** Las vistas bajo `flota-views/cubiertas` coordinan formularios para alta/baja y tratamiento de cubiertas, apoyándose en componentes reutilizables y tablas de historial.【F:frontend/src/views/pages/flota-views/cubiertas/CubiertasGeneralView.js†L1-L105】【F:frontend/src/components/dashboard-components/TablaRotarCubiertas.js†L1-L120】
- **Módulo chofer:** Las páginas en `src/pages/chofer` cargan vistas como `chofer-general`, `chofer-novedades`, `chofer-combustibles`, cada una respaldada por componentes que consumen servicios específicos (`chofer_endpoints`). El formulario de creación de HDR (`crear-hdr`) utiliza validaciones `Yup`, selects dinámicos y servicios centralizados para poblar catálogos.【F:frontend/src/pages/chofer/crear-hdr/index.js†L1-L10】【F:frontend/src/views/pages/chofer-views/FormCrearHDR.js†L1-L132】
- **Dashboards:** `flota-dashboard` encapsula dashboards por flota y por chofer empleando ApexCharts y filtros de fecha, apoyándose en componentes del directorio `dashboard-components` como `AnaliticaGral`, `KmRecorridos` y `CombustibleConsumidoFlota`.【F:frontend/src/pages/flota/flota-dashboard/index.js†L1-L14】【F:frontend/src/views/pages/flota-views/dashboard/general/DashGeneralView.js†L1-L112】
- **Vistas de taller y administración:** `taller-page` y `admin-page` sirven como contenedores para futuras funcionalidades del taller y administración, heredando la misma mecánica de ACL para proteger el acceso.【F:frontend/src/pages/taller-page/index.js†L1-L10】【F:frontend/src/pages/admin-page/index.js†L1-L10】

### 2.7 Manejo de formularios, tablas y notificaciones
- **Formularios reutilizables:** `src/components/formComponents` concentra inputs personalizados, selectores dependientes y validaciones compartidas entre módulos (por ejemplo, filtros, combos y campos numéricos reutilizados en dashboards y formularios operativos).【F:frontend/src/components/formComponents/Filtros.js†L1-L120】【F:frontend/src/components/formComponents/ControladorCargaCombo.js†L1-L96】
- **Tablas y grillas:** `@mui/x-data-grid` se utiliza en tablas de HDR, novedades y métricas para ofrecer paginación, filtrado y acciones inline. Las configuraciones se encapsulan en componentes como `TablaHDR` y `TablaNov`.【F:frontend/src/components/flota-components/tabla-hdr-general.js†L1-L196】
- **Notificaciones:** Componentes como `ToastError`, `ConfirmDialog` y `ErrorDialog` proveen retroalimentación visual consistente, integrándose con servicios para mostrar confirmaciones en operaciones críticas (cierres de HDR, bajas de cubiertas).【F:frontend/src/components/ToastError.js†L1-L59】【F:frontend/src/components/ConfirmDialog.js†L1-L76】

## 3. Documentación funcional
### 3.1 Flujos de autenticación
1. **Inicio de sesión:** La página `/login` valida credenciales con `react-hook-form`/`yup`, llama a `auth.login` y, ante éxito, persiste los datos del usuario para reconstruir la sesión tras recargas. Errores muestran mensajes contextualizados bajo los campos del formulario.【F:frontend/src/pages/login/index.js†L21-L172】【F:frontend/src/context/AuthContext.js†L37-L63】
2. **Cierre de sesión y expiración:** Desde cualquier vista, el usuario puede disparar `logout`, que limpia localmente la sesión y notifica al backend. Las respuestas 401 capturadas por Axios provocan la alerta “Sesión caducada” renderizada por `AuthProvider` antes de redirigir al login.【F:frontend/src/context/AuthContext.js†L64-L92】【F:frontend/src/services/axios.js†L1-L17】
3. **Registro y recuperación:** Existen páginas base para registro (`/register`) y recuperación de contraseña (`/forgot-password`) que reutilizan los mismos componentes de formulario, listas para integrarse con endpoints del backend.【F:frontend/src/pages/register/index.js†L1-L173】【F:frontend/src/pages/forgot-password/index.js†L1-L160】

### 3.2 Operación del chofer
1. **Gestión de HDR:** `chofer-general` muestra la hoja activa, permite crear nuevas HDR (`crear-hdr`) y cerrar una existente (`cerrar-hdr`) mediante diálogos de confirmación y validaciones de kilometraje. Las operaciones se apoyan en servicios `chofer_endpoints` y actualizan el estado global con `setHDRInfo` si se habilita Redux.【F:frontend/src/pages/chofer/chofer-general/index.js†L1-L44】【F:frontend/src/pages/chofer/crear-hdr/index.js†L1-L58】【F:frontend/src/features/hdr/hdrSlice.js†L1-L19】
2. **Registros operativos:** Vistas de combustibles, novedades, viáticos y gastos permiten cargar transacciones asociadas a la HDR vigente, reutilizando componentes de formularios y tarjetas en `chofer-components`. Cada vista declara su ACL (`subject: 'chofer'`) para restringir el acceso.【F:frontend/src/pages/chofer/chofer-combustibles/index.js†L1-L46】【F:frontend/src/views/pages/chofer-views/Combustibles.js†L1-L87】

### 3.3 Operación de flota
1. **Monitoreo general:** `flota-general` lista HDR y novedades, permitiendo a los analistas revisar estados y abrir formularios de edición desde las tablas interactivas.【F:frontend/src/views/pages/flota-views/GeneralView.js†L1-L18】
2. **Validación y mantenimiento:** `flota-validacion-hdr` y `flota-mantenimiento-preventivo` ofrecen vistas para aprobar HDR cerradas y programar mantenimientos, integrando componentes con calendarios y formularios dinámicos.【F:frontend/src/pages/flota/flota-validacion-hdr/index.js†L1-L13】【F:frontend/src/views/pages/flota-views/MantenimientoPreventivoView.js†L1-L150】
3. **Gestión de cubiertas:** Rutas bajo `flota-cubiertas` centralizan altas, bajas, rotaciones y tratamientos, reutilizando componentes de `cubiertas-components` como `FormAltaCubierta`, `FormBajaCubierta` y `TablaCubiertasCargadas` para asegurar consistencia de UI y validaciones de negocio.【F:frontend/src/pages/flota/flota-cubiertas/index.js†L1-L15】【F:frontend/src/components/cubiertas-components/FormAltaCubierta.js†L1-L160】【F:frontend/src/components/cubiertas-components/TablaCubiertasCargadas.js†L1-L140】
4. **Analítica:** `flota-dashboard` (general, por flota y por chofer) renderiza indicadores, gráficos y tablas cruzadas combinando componentes como `AnaliticaGral`, `DisponibilidadFlotas` y `MovimientosPorChofer`, alimentados por los servicios de métricas de flota.【F:frontend/src/pages/flota/flota-dashboard/index.js†L1-L14】【F:frontend/src/views/pages/flota-views/dashboard/general/DashGeneralView.js†L1-L115】

### 3.4 Taller y administración
- **Taller:** `taller-page` sirve como punto de entrada para gestionar órdenes de trabajo y mantenimientos desde el rol de taller. Se sugiere conectar los formularios existentes en `mantenimiento-components` para completar el flujo de aprobación y cierre.【F:frontend/src/pages/taller-page/index.js†L1-L10】【F:frontend/src/components/mantenimiento-components/FormRealizarMantenimiento.js†L1-L159】
- **Administración:** `admin-page` reserva espacio para tableros de configuración general, vinculando ACL con el sujeto `admin`. Puede expandirse con componentes de parámetros y reportes globales reutilizando la infraestructura existente de navegación y guards.【F:frontend/src/pages/admin-page/index.js†L1-L10】【F:frontend/src/components/parametros-components/CRUDProveedores.js†L1-L174】

### 3.5 Consideraciones operativas
- **Internacionalización:** El template trae configurado `i18next`, lo que permite habilitar traducciones si se cargan namespaces en `src/configs/i18n`. Mantener esta estructura facilita ampliar la app a otros idiomas.【F:frontend/package.json†L33-L62】
- **Gestión de iconos:** Se utiliza Iconify con un bundle generado vía `npm run build:icons`; al agregar iconos personalizados se debe actualizar `src/iconify-bundle` y ejecutar el script antes del build.【F:frontend/package.json†L12-L13】【F:frontend/src/iconify-bundle/bundle-icons-react.js†L1-L120】
- **Optimización y accesibilidad:** Al extender componentes existentes, respetar los patrones de MUI para estados de carga, uso de `Typography` y `Box`, así como los atajos definidos en `useSettings` (modos de layout). Esto asegura consistencia visual y soporte responsive.【F:frontend/src/pages/login/index.js†L99-L172】【F:frontend/src/@core/hooks/useSettings.js†L1-L60】

---
Esta documentación resume la arquitectura técnica y los flujos funcionales del frontend de AppFlotas, sirviendo como guía para mantenimiento, evolución y onboarding de nuevos desarrolladores.
