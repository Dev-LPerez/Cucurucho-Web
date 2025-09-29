// Ruta: dev-lperez/cucurucho-web/cucurucho-frontend/src/services/productService.js
import apiClient from './api';

// Obtiene todas las categorías.
const getCategories = async () => {
  try {
    const response = await apiClient.get('/products/categories');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las categorías:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Obtiene todos los productos.
const getProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los productos:', error.response?.data?.message || error.message);
      throw error;
    }
  };

// --- NUEVO: Crea un nuevo producto ---
const createProduct = async (productData) => {
  try {
    const response = await apiClient.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error al crear el producto:', error.response?.data?.message || error.message);
    throw error;
  }
};


export const productService = {
  getCategories,
  getProducts,
  createProduct, // <-- Exporta la nueva función
};

