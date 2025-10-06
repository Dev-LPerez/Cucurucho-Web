// Ruta: cucurucho-web/cucurucho-frontend/src/services/productService.js
import apiClient from './api';

// --- CATEGORÍAS ---
const getCategories = async () => {
    try {
        const response = await apiClient.get('/products/categories');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las categorías:', error.response?.data?.message || error.message);
        throw error;
    }
};

// --- NUEVO: Crea una nueva categoría ---
const createCategory = async (categoryData) => {
    try {
        const response = await apiClient.post('/products/categories', categoryData);
        return response.data;
    } catch (error) {
        console.error('Error al crear la categoría:', error.response?.data?.message || error.message);
        throw error;
    }
};

// --- PRODUCTOS ---
const getProducts = async () => {
    try {
        const response = await apiClient.get('/products');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los productos:', error.response?.data?.message || error.message);
        throw error;
    }
};

const createProduct = async (productData) => {
    try {
        const response = await apiClient.post('/products', productData);
        return response.data;
    } catch (error) {
        console.error('Error al crear el producto:', error.response?.data?.message || error.message);
        throw error;
    }
};

const updateProduct = async (id, productData) => {
    try {
        const response = await apiClient.patch(`/products/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el producto ${id}:`, error.response?.data?.message || error.message);
        throw error;
    }
};

const deleteProduct = async (id) => {
    try {
        await apiClient.delete(`/products/${id}`);
    } catch (error) {
        console.error(`Error al eliminar el producto ${id}:`, error.response?.data?.message || error.message);
        throw error;
    }
};


export const productService = {
    getCategories,
    createCategory, // <-- Exporta la nueva función
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
};

