import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('titelli_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Upload
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API}/upload/image`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadBase64: (imageData, filename) => axios.post(`${API}/upload/image-base64`, { image: imageData, filename }, { headers: getAuthHeaders() }),
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
  getById: (id) => axios.get(`${API}/enterprises/${id}`),
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
  getByEnterprise: (enterpriseId) => axios.get(`${API}/reviews/${enterpriseId}`),
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

// ============ ENTERPRISE MANAGEMENT APIs ============

// Offers/Promotions
export const offersAPI = {
  list: () => axios.get(`${API}/enterprise/offers`, { headers: getAuthHeaders() }),
  create: (data) => axios.post(`${API}/enterprise/offers`, data, { headers: getAuthHeaders() }),
  update: (id, data) => axios.put(`${API}/enterprise/offers/${id}`, data, { headers: getAuthHeaders() }),
  delete: (id) => axios.delete(`${API}/enterprise/offers/${id}`, { headers: getAuthHeaders() }),
};

// Trainings/Formations
export const trainingsAPI = {
  list: () => axios.get(`${API}/enterprise/trainings`, { headers: getAuthHeaders() }),
  listAll: (params) => axios.get(`${API}/trainings`, { params }),
  create: (data) => axios.post(`${API}/enterprise/trainings`, data, { headers: getAuthHeaders() }),
  delete: (id) => axios.delete(`${API}/enterprise/trainings/${id}`, { headers: getAuthHeaders() }),
};

// Jobs/Emplois
export const jobsAPI = {
  list: () => axios.get(`${API}/enterprise/jobs`, { headers: getAuthHeaders() }),
  listAll: (params) => axios.get(`${API}/jobs`, { params }),
  create: (data) => axios.post(`${API}/enterprise/jobs`, data, { headers: getAuthHeaders() }),
  delete: (id) => axios.delete(`${API}/enterprise/jobs/${id}`, { headers: getAuthHeaders() }),
};

// Real Estate/Immobilier
export const realEstateAPI = {
  list: () => axios.get(`${API}/enterprise/real-estate`, { headers: getAuthHeaders() }),
  listAll: (params) => axios.get(`${API}/real-estate`, { params }),
  create: (data) => axios.post(`${API}/enterprise/real-estate`, data, { headers: getAuthHeaders() }),
  delete: (id) => axios.delete(`${API}/enterprise/real-estate/${id}`, { headers: getAuthHeaders() }),
};

// Investments
export const investmentsAPI = {
  list: () => axios.get(`${API}/enterprise/investments`, { headers: getAuthHeaders() }),
  listAll: (params) => axios.get(`${API}/investments`, { params }),
  create: (data) => axios.post(`${API}/enterprise/investments`, data, { headers: getAuthHeaders() }),
  delete: (id) => axios.delete(`${API}/enterprise/investments/${id}`, { headers: getAuthHeaders() }),
};

// Stock Management
export const stockAPI = {
  list: () => axios.get(`${API}/enterprise/stock`, { headers: getAuthHeaders() }),
  add: (data) => axios.post(`${API}/enterprise/stock`, data, { headers: getAuthHeaders() }),
  movement: (data) => axios.post(`${API}/enterprise/stock/movement`, data, { headers: getAuthHeaders() }),
  history: () => axios.get(`${API}/enterprise/stock/history`, { headers: getAuthHeaders() }),
};

// Agenda/Calendar
export const agendaAPI = {
  list: (params) => axios.get(`${API}/enterprise/agenda`, { params, headers: getAuthHeaders() }),
  create: (data) => axios.post(`${API}/enterprise/agenda`, data, { headers: getAuthHeaders() }),
  update: (id, data) => axios.put(`${API}/enterprise/agenda/${id}`, data, { headers: getAuthHeaders() }),
  delete: (id) => axios.delete(`${API}/enterprise/agenda/${id}`, { headers: getAuthHeaders() }),
};

// Team/Personnel
export const teamAPI = {
  list: () => axios.get(`${API}/enterprise/team`, { headers: getAuthHeaders() }),
  add: (data) => axios.post(`${API}/enterprise/team`, data, { headers: getAuthHeaders() }),
  update: (id, data) => axios.put(`${API}/enterprise/team/${id}`, data, { headers: getAuthHeaders() }),
  delete: (id) => axios.delete(`${API}/enterprise/team/${id}`, { headers: getAuthHeaders() }),
  // Team Orders
  listOrders: () => axios.get(`${API}/enterprise/team/orders`, { headers: getAuthHeaders() }),
  createOrder: (data) => axios.post(`${API}/enterprise/team/orders`, data, { headers: getAuthHeaders() }),
  updateOrderStatus: (id, status) => axios.put(`${API}/enterprise/team/orders/${id}/status`, null, { params: { status }, headers: getAuthHeaders() }),
};

// Permanent Orders
export const permanentOrdersAPI = {
  list: () => axios.get(`${API}/enterprise/permanent-orders`, { headers: getAuthHeaders() }),
  create: (data) => axios.post(`${API}/enterprise/permanent-orders`, data, { headers: getAuthHeaders() }),
  toggle: (id) => axios.put(`${API}/enterprise/permanent-orders/${id}/toggle`, null, { headers: getAuthHeaders() }),
  delete: (id) => axios.delete(`${API}/enterprise/permanent-orders/${id}`, { headers: getAuthHeaders() }),
};

// Documents
export const documentsAPI = {
  list: (category) => axios.get(`${API}/enterprise/documents`, { params: { category }, headers: getAuthHeaders() }),
  add: (data) => axios.post(`${API}/enterprise/documents`, data, { headers: getAuthHeaders() }),
  delete: (id) => axios.delete(`${API}/enterprise/documents/${id}`, { headers: getAuthHeaders() }),
};

// Development/Formation
export const developmentAPI = {
  list: () => axios.get(`${API}/enterprise/development`, { headers: getAuthHeaders() }),
  updateProgress: (resourceId, isCompleted) => axios.post(`${API}/enterprise/development/progress`, null, { 
    params: { resource_id: resourceId, is_completed: isCompleted }, 
    headers: getAuthHeaders() 
  }),
};

// Finances
export const financesAPI = {
  get: (params) => axios.get(`${API}/enterprise/finances`, { params, headers: getAuthHeaders() }),
  addTransaction: (data) => axios.post(`${API}/enterprise/finances/transactions`, data, { headers: getAuthHeaders() }),
  deleteTransaction: (id) => axios.delete(`${API}/enterprise/finances/transactions/${id}`, { headers: getAuthHeaders() }),
};

// Advertising
export const advertisingAPI = {
  list: () => axios.get(`${API}/enterprise/advertising`, { headers: getAuthHeaders() }),
  create: (data) => axios.post(`${API}/enterprise/advertising`, data, { headers: getAuthHeaders() }),
  pay: (id) => axios.post(`${API}/enterprise/advertising/${id}/pay`, null, { headers: getAuthHeaders() }),
  activate: (id, sessionId) => axios.post(`${API}/enterprise/advertising/${id}/activate`, null, { params: { session_id: sessionId }, headers: getAuthHeaders() }),
  toggle: (id) => axios.put(`${API}/enterprise/advertising/${id}/toggle`, null, { headers: getAuthHeaders() }),
  delete: (id) => axios.delete(`${API}/enterprise/advertising/${id}`, { headers: getAuthHeaders() }),
};

// Notifications
export const notificationsAPI = {
  list: (unreadOnly = false) => axios.get(`${API}/notifications`, { params: { unread_only: unreadOnly }, headers: getAuthHeaders() }),
  markRead: (id) => axios.put(`${API}/notifications/${id}/read`, null, { headers: getAuthHeaders() }),
  markAllRead: () => axios.put(`${API}/notifications/read-all`, null, { headers: getAuthHeaders() }),
  delete: (id) => axios.delete(`${API}/notifications/${id}`, { headers: getAuthHeaders() }),
};

// Subscriptions / Abonnements
export const subscriptionsAPI = {
  getPlans: () => axios.get(`${API}/subscriptions/plans`),
  getCurrent: () => axios.get(`${API}/subscriptions/current`, { headers: getAuthHeaders() }),
  createCheckout: (planId, addons = []) => axios.post(`${API}/subscriptions/checkout`, null, {
    params: { plan_id: planId, addons: addons.join(',') || undefined },
    headers: getAuthHeaders()
  }),
  activate: (sessionId) => axios.post(`${API}/subscriptions/activate`, null, {
    params: { session_id: sessionId },
    headers: getAuthHeaders()
  }),
  createAddonCheckout: (addonId) => axios.post(`${API}/subscriptions/addon/checkout`, null, {
    params: { addon_id: addonId },
    headers: getAuthHeaders()
  }),
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
  offers: offersAPI,
  trainings: trainingsAPI,
  jobs: jobsAPI,
  realEstate: realEstateAPI,
  investments: investmentsAPI,
  stock: stockAPI,
  agenda: agendaAPI,
  team: teamAPI,
  permanentOrders: permanentOrdersAPI,
  documents: documentsAPI,
  development: developmentAPI,
  finances: financesAPI,
  advertising: advertisingAPI,
  notifications: notificationsAPI,
};
