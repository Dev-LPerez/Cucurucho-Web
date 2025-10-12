// Ruta: dev-lperez/cucurucho-web/cucurucho-frontend/src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // La URL de tu backend NestJS
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- NUEVO: Interceptor para añadir el token a las peticiones ---
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    console.log('Token encontrado:', token ? 'Sí (longitud: ' + token.length + ')' : 'No'); // Debug
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- Interceptor para manejar respuestas de error ---
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Error 401: No autorizado. Token inválido o expirado.');
      // Opcional: Redirigir al login
      localStorage.removeItem('user_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
