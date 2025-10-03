import apiClient from './api';

const getTables = async () => {
  try {
    const response = await apiClient.get('/tables');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las mesas:', error.response?.data?.message || error.message);
    throw error;
  }
};

const createTable = async (tableData) => {
  try {
    const response = await apiClient.post('/tables', tableData);
    return response.data;
  } catch (error) {
    console.error('Error al crear la mesa:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const tableService = {
  getTables,
  createTable,
};

