/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = role => {
  if (role === 'chofer') return '/chofer/chofer-general'
  else if (role === 'flota') return '/flota/flota-general'
  else if (role === 'taller') return '/taller-page'
  else return '/admin-page'
}

export default getHomeRoute
