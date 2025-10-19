const navigation = () => {
  return [
    // PAGINAS CHOFERES -----------------------------
    {
      //combustible
      sectionTitle: 'HOJA DE RUTA',
      action: 'usar', // acciones
      subject: 'chofer' // tag
    },
    {
      //general
      title: 'GENERAL',
      path: '/chofer/chofer-general',
      icon: 'tabler:home',
      action: 'usar', // acciones
      subject: 'chofer' // tag
    },

    {
      //combustible
      title: 'COMBUSTIBLE',
      path: '/chofer/chofer-combustibles',
      icon: 'tabler:gas-station',
      action: 'usar', // acciones
      subject: 'chofer' // tag
    },

    {
      //movimientos
      title: 'MOVIMIENTOS',
      path: '/chofer/chofer-viajes',
      icon: 'tabler:road',
      action: 'usar',
      subject: 'chofer'
    },
    {
      //novedades
      title: 'NOVEDADES',
      path: '/chofer/chofer-novedades',
      icon: 'tabler:bell',
      action: 'usar',
      subject: 'chofer'
    },
    {
      //gastos
      title: 'GASTOS',

      path: '/chofer/chofer-gastos',
      icon: 'tabler:pig-money',
      action: 'usar',
      subject: 'chofer'
    },
    {
      //viaticos
      title: 'ADELANTOS',

      path: '/chofer/chofer-viaticos',
      icon: 'tabler:cash',
      action: 'usar',
      subject: 'chofer'
    },

    // PAGINAS ADMINISTRADORES ----------------------------------------
    {
      title: 'Administracion',
      path: '/admin-page',
      icon: 'tabler:clipboard',
      action: 'usar', // acciones
      subject: 'admin' // tag
    },

    // PAGINAS TALLER -------------------------
    {
      title: 'Taller',
      path: '/taller-page',
      icon: 'tabler:clipboard',
      action: 'usar', // acciones
      subject: 'taller' // tag
    },

    // PAGINAS FLOTA -------------------------
    {
      title: 'General',
      path: '/flota/flota-general',
      icon: 'tabler:home',
      action: 'usar', // acciones
      subject: 'flota' // tag
    },
    {
      title: 'HDR',
      path: '/flota/flota-hdr',
      icon: 'tabler:clipboard',
      action: 'usar', // acciones
      subject: 'flota' // tag
    },
    {
      title: 'Novedades',
      path: '/flota/flota-nov',
      icon: 'tabler:bell',
      action: 'usar', // acciones
      subject: 'flota' // tag
    },
    {
      title: 'Cubiertas',
      path: '/flota/flota-cubiertas',
      icon: 'tabler:wheel',
      action: 'usar', // acciones
      subject: 'flota' // tag
    },
    {
      title: 'Analitica',
      path: '/flota/flota-dashboard',
      icon: 'tabler:chart-pie',
      action: 'usar', // acciones
      subject: 'flota' // tag
    },
    {
      title: 'Rotacion de Cubiertas',
      path: '/flota/flota-rotar-cubiertas',
      icon: 'tabler:rotate-360',
      action: 'usar', // acciones
      subject: 'flota' // tag
    },
    {
      title: 'Historico Cubiertas',
      path: '/flota/flota-historico-cubierta',
      icon: 'tabler:database',
      action: 'usar', // acciones
      subject: 'flota' // tag
    },
    {
      title: 'Validacion HDR',
      path: '/flota/flota-validacion-hdr',
      icon: 'tabler:check',
      action: 'usar', // acciones
      subject: 'flota' // tag
    },
    {
      title: 'Mantenimiento Preventivo',
      path: '/flota/flota-mantenimiento-preventivo',
      icon: 'tabler:car-crash',
      action: 'usar', // acciones
      subject: 'flota' // tag
    },
    {
      title: 'Proveedores',
      path: '/flota/flota-parametros',
      icon: 'tabler:settings',
      action: 'usar', // acciones
      subject: 'flota' // tag
    }
  ]
}

export default navigation
