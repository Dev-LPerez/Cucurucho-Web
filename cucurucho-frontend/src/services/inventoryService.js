// Ruta: dev-lperez/cucurucho-web/cucurucho-frontend/src/services/inventoryService.js
import apiClient from './api';

const getIngredients = async () => {
  try {
    const response = await apiClient.get('/inventory/ingredients');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los ingredientes:', error.response?.data?.message || error.message);
    throw error;
  }
};

const createIngredient = async (ingredientData) => {
    try {
      const response = await apiClient.post('/inventory/ingredients', ingredientData);
      return response.data;
    } catch (error) {
      console.error('Error al crear el ingrediente:', error.response?.data?.message || error.message);
      throw error;
    }
  };

export const inventoryService = {
  getIngredients,
  createIngredient,
};
