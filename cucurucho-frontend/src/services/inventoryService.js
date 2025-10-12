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

const updateStock = async (ingredientId, change) => {
    try {
        const response = await apiClient.patch(`/inventory/ingredients/${ingredientId}/stock`, { change });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el stock:', error.response?.data?.message || error.message);
        throw error;
    }
};

const updateIngredient = async (ingredientId, ingredientData) => {
    try {
        const response = await apiClient.patch(`/inventory/ingredients/${ingredientId}`, ingredientData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el ingrediente:', error.response?.data?.message || error.message);
        throw error;
    }
};

// --- NUEVA FUNCIÓN PARA ELIMINAR UN INGREDIENTE ---
const deleteIngredient = async (ingredientId) => {
    try {
        await apiClient.delete(`/inventory/ingredients/${ingredientId}`);
    } catch (error) {
        console.error('Error al eliminar el ingrediente:', error.response?.data?.message || error.message);
        throw error;
    }
};

export const inventoryService = {
    getIngredients,
    createIngredient,
    updateStock,
    updateIngredient, // Exportar la nueva función
    deleteIngredient, // Exportar la nueva función
};