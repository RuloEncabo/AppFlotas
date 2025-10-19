import { axiosService } from "../axios";
import authConfig from 'src/configs/auth';
import Router from 'next/router';

let setAlert;

export const setAlertHandler = (handler) => {
  setAlert = handler;
};

// Eliminar las cookies usando JavaScript nativo
const deleteCookie = (name) => {
  document.cookie = name + '=; Max-Age=0; path=/';
};

export const handleSessionExpired = () => {
  // Eliminar la cookie del token
  deleteCookie(authConfig.storageTokenKeyName);
  // Eliminar los datos del usuario del localStorage
  window.localStorage.removeItem(authConfig.data);
  // Mostrar alerta de sesión expirada por 3 segundos
  if (setAlert) setTimeout(() => setAlert(true), 3000);
  // Redirigir al usuario a la página de inicio de sesión
  Router.push('/login');
};

export const login = (params) => {
  return axiosService.post(authConfig.loginEndpoint, params);
};

export const logout = () => {
  return axiosService.delete(authConfig.logoutEndpoint);
};
