import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // La URL de tu backend NestJS
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;