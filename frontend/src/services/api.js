import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

export const dashboardService = {
  getDashboardData: async () => {
    const { data } = await api.get('/dashboard');
    return data;
  },
  getRecentPayments: async () => {
    const { data } = await api.get('/payments/recent');
    return data;
  },
  verifyPayment: async (paymentId) => {
    const { data } = await api.post(`/payments/${paymentId}/verify`);
    return data;
  }
};