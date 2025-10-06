import apiClient from './api';

const createSale = async (saleData) => {
    try {
        // El payload ya no necesita mapeo, asumiendo que llega con el formato correcto
        const response = await apiClient.post('/sales', saleData);
        return response.data;
    } catch (error) {
        console.error('Error al crear la venta:', error.response?.data?.message || error.message);
        throw error;
    }
};

// --- NUEVA FUNCIÓN PARA AÑADIR PAGOS ---
const addPayment = async (saleId, payments) => {
    try {
        const payload = { payments };
        const response = await apiClient.post(`/sales/${saleId}/payments`, payload);
        return response.data;
    } catch (error) {
        console.error('Error al registrar el pago:', error.response?.data?.message || error.message);
        throw error;
    }
};

export const salesService = {
    createSale,
    addPayment, // <-- Exportamos la nueva función
};