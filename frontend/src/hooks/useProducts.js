import { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../services/api';

export const useProducts = (category = null) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading products...', category);
      
      const response = category 
        ? await productAPI.getProductsByCategory(category)
        : await productAPI.getAllProducts();
      
      console.log('✅ Products loaded:', response.data);
      
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (err) {
      console.error('❌ Error loading products:', err);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Backend server is not running. Please start the backend server on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Error loading products from server');
      }
      
      // Fallback to empty array
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = async (formData) => {
    try {
      console.log('📤 Adding product with form data...');
      
      // FormData directly pass করুন - no need to create new FormData
      const response = await productAPI.createProduct(formData);
      
      console.log('✅ Product added response:', response.data);
      
      if (response.data.success) {
        await loadProducts();
        return { 
          success: true, 
          product: response.data.product,
          message: 'Product added successfully!' 
        };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Failed to add product' 
        };
      }
    } catch (err) {
      console.error('❌ Error adding product:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error adding product to database' 
      };
    }
  };

  const updateProduct = async (id, formData) => {
    try {
      console.log('📤 Updating product with form data...');
      
      const response = await productAPI.updateProduct(id, formData);
      
      console.log('✅ Product updated response:', response.data);
      
      if (response.data.success) {
        await loadProducts();
        return { 
          success: true, 
          product: response.data.product,
          message: 'Product updated successfully!' 
        };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Failed to update product' 
        };
      }
    } catch (err) {
      console.error('❌ Error updating product:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error updating product' 
      };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await productAPI.deleteProduct(id);
      
      if (response.data.success) {
        await loadProducts();
        return { 
          success: true, 
          message: 'Product deleted successfully!' 
        };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Failed to delete product' 
        };
      }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error deleting product' 
      };
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: loadProducts
  };
};