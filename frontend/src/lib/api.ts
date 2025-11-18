import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Products API
export const productsApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Cart API
export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (data: any) => api.post('/cart/items', data),
  updateItem: (id: string, data: any) => api.put(`/cart/items/${id}`, data),
  removeItem: (id: string) => api.delete(`/cart/items/${id}`),
  clear: () => api.delete('/cart'),
};

// Orders API
export const ordersApi = {
  getAll: (params?: any) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, data: any) => api.patch(`/orders/${id}/status`, data),
};

// Payment API
export const paymentApi = {
  createStripeIntent: (data: any) => api.post('/payments/stripe/create-payment-intent', data),
  confirmStripe: (data: any) => api.post('/payments/stripe/confirm', data),
  createPayPalOrder: (data: any) => api.post('/payments/paypal/create-order', data),
  capturePayPal: (data: any) => api.post('/payments/paypal/capture', data),
  createKlarnaSession: (data: any) => api.post('/payments/klarna/create-session', data),
  confirmKlarna: (data: any) => api.post('/payments/klarna/confirm', data),
};

// Marketing API
export const marketingApi = {
  subscribeNewsletter: (email: string) => api.post('/marketing/newsletter/subscribe', { email }),
  validateDiscount: (code: string) => api.get(`/marketing/discounts/${code}`),
};

// CMS API
export const cmsApi = {
  getPages: () => api.get('/cms/pages'),
  getPage: (slug: string) => api.get(`/cms/pages/${slug}`),
};

// Carriers API
export const carriersApi = {
  getAll: () => api.get('/carriers'),
};

export default api;
