import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const productAPI = {
  // Get all products
  getAllProducts: () => API.get('/products'),
  
  // Get products by category
  getProductsByCategory: (category) => API.get(`/products/category/${category}`),
  
  // ✅ NEW - Get game packages for a specific game
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

export default API;