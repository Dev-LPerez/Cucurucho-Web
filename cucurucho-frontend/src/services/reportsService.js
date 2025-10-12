import apiClient from './api';

const getSummary = async () => {
    try {
        const response = await apiClient.get('/reports/summary');
        return response.data;
    } catch (error) {
        console.error('Error al obtener el resumen de reportes:', error.response?.data?.message || error.message);
        throw error;
    }
};

export const reportsService = {
    getSummary,
};

