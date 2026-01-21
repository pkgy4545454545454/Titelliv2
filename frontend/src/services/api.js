import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('titelli_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth
export const authAPI = {
  login: (data) => axios.post(`${API}/auth/login`, data),
  register: (data) => axios.post(`${API}/auth/register`, data),
  getMe: () => axios.get(`${API}/auth/me`, { headers: getAuthHeaders() }),
};

// Enterprises
export const enterpriseAPI = {
  list: (params) => axios.get(`${API}/enterprises`, { params }),
  get: (id) => axios.get(`${API}/enterprises/${id}`),
  create: (data) => axios.post(`${API}/enterprises`, data, { headers: getAuthHeaders() }),
  update: (id, data) => axios.put(`${API}/enterprises/${id}`, data, { headers: getAuthHeaders() }),
};

// Services & Products
export const servicesProductsAPI = {
  list: (params) => axios.get(`${API}/services-products`, { params }),
  get: (id) => axios.get(`${API}/services-products/${id}`),
  create: (data) => axios.post(`${API}/services-products`, data, { headers: getAuthHeaders() }),
  update: (id, data) => axios.put(`${API}/services-products/${id}`, data, { headers: getAuthHeaders() }),
  delete: (id) => axios.delete(`${API}/services-products/${id}`, { headers: getAuthHeaders() }),
};

// Reviews
export const reviewAPI = {
  list: (enterpriseId) => axios.get(`${API}/reviews/${enterpriseId}`),
  create: (data) => axios.post(`${API}/reviews`, data, { headers: getAuthHeaders() }),
};

// Orders
export const orderAPI = {
  list: () => axios.get(`${API}/orders`, { headers: getAuthHeaders() }),
  create: (data) => axios.post(`${API}/orders`, data, { headers: getAuthHeaders() }),
  updateStatus: (id, status) => axios.put(`${API}/orders/${id}/status`, null, { 
    params: { status }, 
    headers: getAuthHeaders() 
  }),
};

// Categories
export const categoryAPI = {
  products: () => axios.get(`${API}/categories/products`),
  services: () => axios.get(`${API}/categories/services`),
};

// Featured
export const featuredAPI = {
  tendances: () => axios.get(`${API}/featured/tendances`),
  guests: () => axios.get(`${API}/featured/guests`),
  offres: () => axios.get(`${API}/featured/offres`),
  premium: () => axios.get(`${API}/featured/premium`),
};

// Payments
export const paymentAPI = {
  createCheckout: (packageType, amount) => {
    const params = { package_type: packageType };
    if (amount) params.amount = amount;
    return axios.post(`${API}/payments/checkout`, null, { 
      params, 
      headers: getAuthHeaders() 
    });
  },
  getStatus: (sessionId) => axios.get(`${API}/payments/status/${sessionId}`),
};

// Admin
export const adminAPI = {
  stats: () => axios.get(`${API}/admin/stats`, { headers: getAuthHeaders() }),
  users: (params) => axios.get(`${API}/admin/users`, { params, headers: getAuthHeaders() }),
  verifyUser: (userId, isCertified, isLabeled) => axios.put(
    `${API}/admin/users/${userId}/verify`, 
    null,
    { params: { is_certified: isCertified, is_labeled: isLabeled }, headers: getAuthHeaders() }
  ),
};

// Cashback
export const cashbackAPI = {
  balance: () => axios.get(`${API}/cashback/balance`, { headers: getAuthHeaders() }),
};

export default {
  auth: authAPI,
  enterprise: enterpriseAPI,
  servicesProducts: servicesProductsAPI,
  review: reviewAPI,
  order: orderAPI,
  category: categoryAPI,
  featured: featuredAPI,
  payment: paymentAPI,
  admin: adminAPI,
  cashback: cashbackAPI,
};
