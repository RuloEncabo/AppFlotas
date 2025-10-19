import axios from 'axios'
import { handleSessionExpired} from './auth'

export const axiosService = axios.create({
    withCredentials: true
})

// Interceptor para manejar errores 401
axiosService.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      handleSessionExpired();
    }
    return Promise.reject(error);
  }
);
