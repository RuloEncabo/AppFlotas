import { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { login, logout, handleSessionExpired, setAlertHandler } from 'src/services/auth';
import authConfig from 'src/configs/auth';

const defaultProvider = {
  user: null,
  loading: true,
  alert: false,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
};

const AuthContext = createContext(defaultProvider);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(defaultProvider.user);
  const [loading, setLoading] = useState(defaultProvider.loading);
  const [alert, setAlert] = useState(defaultProvider.alert);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const data = window.localStorage.getItem(authConfig.data);
      setLoading(true);
      if (data) {
        const userData = JSON.parse(data);
        setUser(userData);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    const handleAlert = (alertHandler) => {
      setAlertHandler(alertHandler);
    };

    initAuth();
    handleAlert(setAlert);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (params, errorCallback) => {
    login({ usr_email: params.email, usr_password: params.password })
      .then(async response => {
        setUser(response.data);
        window.localStorage.setItem(authConfig.data, JSON.stringify(response.data));
        setAlert(false); // Ocultar la alerta en caso de un inicio de sesión exitoso
        router.replace('/');
      })
      .catch(err => {
        if (errorCallback) errorCallback(err);
      });
  };

  const handleLogout = async () => {
    setUser(null);
    window.localStorage.removeItem(authConfig.data);

    // Redirigir primero
    router.replace('/login');

    // Ejecutar logout en segundo plano
    try {
      await logout();
    } catch (err) {
      console.error("Error en logout:", err);
    }
  };


  const values = {
    user,
    loading,
    alert,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={values}>
      {alert && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "#f44336",
          color: "#fff",
          textAlign: "center",
          padding: "1rem",
          zIndex: 1000,
        }}>
          Sesión caducada. Por favor, inicie sesión nuevamente.
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
