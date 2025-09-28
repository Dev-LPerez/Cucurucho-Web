import apiClient from './api';

const login = async (username, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
    });
    // Si el login es exitoso, el backend nos devuelve un token.
    if (response.data.access_token) {
      // Guardamos el token en el localStorage del navegador.
      localStorage.setItem('user_token', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Error en el inicio de sesión:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Aquí podríamos añadir funciones para logout, etc.
const logout = () => {
    localStorage.removeItem('user_token');
};

export const authService = {
  login,
  logout,
};