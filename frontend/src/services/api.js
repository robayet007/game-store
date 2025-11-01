import axios from 'axios';

const API = axios.create({
  baseURL: 'http://3.24.182.94:5000/api',  // ✅ Changed to your live server
});

// ✅ Add request interceptor for better error handling
API.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} Request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Add response interceptor for better error handling
API.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error: Backend server is not running');
    }
    return Promise.reject(error);
  }
);

// Product APIs
export const productAPI = {
  // Get all products
  getAllProducts: () => API.get('/products'),
  
  // Get products by category
  getProductsByCategory: (category) => API.get(`/products/category/${category}`),
  
  // Get game packages for a specific game
  getGamePackages: (gameId) => API.get(`/products/game/${gameId}/packages`),
  
  // Get single product
  getProductById: (id) => API.get(`/products/${id}`),
  
  // Create new product (with image upload)
  createProduct: (formData) => API.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Update product (with image upload)
  updateProduct: (id, formData) => API.put(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Delete product
  deleteProduct: (id) => API.delete(`/products/${id}`)
};

// ✅ Payment APIs - Complete set
export const paymentAPI = {
  // ✅ Balance Management
  getUserBalance: (userId) => API.get(`/payments/balance/${userId}`),
  
  // ✅ Payment Creation
  createPayment: (paymentData) => API.post('/payments/create', paymentData),
  
  // ✅ Payment History
  getUserPayments: (userId) => API.get(`/payments/user/${userId}`),
  
  // ✅ Admin Functions
  getPendingPayments: () => API.get('/payments/admin/pending'),
  approvePayment: (paymentId, adminData) => API.put(`/admin/approve-payment/${paymentId}`, adminData),
  rejectPayment: (paymentId, adminData) => API.put(`/admin/reject-payment/${paymentId}`, adminData),
  
  // ✅ Payment Status
  getPaymentById: (paymentId) => API.get(`/payments/${paymentId}`),
  updatePaymentStatus: (paymentId, statusData) => API.put(`/payments/${paymentId}/status`, statusData)
};

// ✅ Admin APIs (if needed separately)
export const adminAPI = {
  getDashboardStats: () => API.get('/admin/dashboard/stats'),
  getAllUsers: () => API.get('/admin/users'),
  getUserDetails: (userId) => API.get(`/admin/users/${userId}`)
};

export default API;