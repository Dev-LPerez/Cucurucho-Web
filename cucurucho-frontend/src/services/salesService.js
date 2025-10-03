import apiClient from './api';

const createSale = async (orderItems) => {
  try {
    const payload = {
      items: orderItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };
    const response = await apiClient.post('/sales', payload);
    return response.data;
  } catch (error) {
    console.error('Error al crear la venta:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const salesService = {
  createSale,
};

