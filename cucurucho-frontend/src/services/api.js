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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
