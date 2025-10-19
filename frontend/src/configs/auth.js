import {ELTA_URL} from 'src/config'


export default {
  meEndpoint: '/auth/me',
  loginEndpoint: `${ELTA_URL}/seguridad/login`,
  logoutEndpoint: `${ELTA_URL}/seguridad/logout`,
  data:'userData',
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
