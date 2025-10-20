import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { isAdminUser } from '../../utils/admin';
import Sidebar from './Sidebar/Sidebar';
import AddProduct from './AddProduct/AddProduct';
import CategoryView from './CatagoryProduct/CategoryProduct';
import { useProducts } from '../../hooks/useProducts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('add-product');
  const [selectedCategory, setSelectedCategory] = useState('subscription');
  const [editingProduct, setEditingProduct] = useState(null);

  // Use the custom hook for products
  const { 
    products, 
    loading, 
    error, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    refreshProducts 
  } = useProducts(selectedCategory);

  const navigate = useNavigate();
  const user = auth.currentUser;

  if (!isAdminUser(user)) {
    navigate('/');
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Add Product Function - Now connects to backend
  const addNewProduct = async (productData) => {
    const result = await addProduct(productData);
    
    if (result.success) {
      alert(result.message);
    } else {
      alert('Error: ' + result.error);
    }
  };

  // Edit Product Function - Now connects to backend
  const editProduct = async (productId, updatedData) => {
    const result = await updateProduct(productId, updatedData);
    
    if (result.success) {
      alert(result.message);
      setEditingProduct(null);
    } else {
      alert('Error: ' + result.error);
    }
  };

  // Delete Product Function - Now connects to backend
  const deleteProductHandler = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await deleteProduct(productId);
      
      if (result.success) {
        alert(result.message);
      } else {
        alert('Error: ' + result.error);
      }
    }
  };

  // Start Editing Product
  const startEditing = (product) => {
    setEditingProduct(product);
    setActiveSection('add-product');
  };

  const renderContent = () => {
    if (activeSection === 'add-product') {
      return (
        <AddProduct 
          onAddProduct={addNewProduct}
          onEditProduct={editProduct}
          editingProduct={editingProduct}
          onCancelEdit={() => setEditingProduct(null)}
        />
      );
    } else {
      return (
        <CategoryView 
          category={selectedCategory}
          products={products.filter(p => p.category === selectedCategory)}
          onEditProduct={startEditing}
          onDeleteProduct={deleteProductHandler}
        />
      );
    }
  };

  // Show loading or error states
  if (loading && activeSection !== 'add-product') {
    return (
      <div className="admin-dashboard">
        <Sidebar 
          activeSection={activeSection}
          selectedCategory={selectedCategory}
          onSectionChange={setActiveSection}
          onCategoryChange={setSelectedCategory}
        />
        <div className="admin-main">
          <header className="admin-header">
            <div className="header-content">
              <h1>🎮 MetaGameShop Admin</h1>
            </div>
          </header>
          <main className="content-area">
            <div className="loading-state">🔄 Loading products...</div>
          </main>
        </div>
      </div>
    );
  }

  if (error && activeSection !== 'add-product') {
    return (
      <div className="admin-dashboard">
        <Sidebar 
          activeSection={activeSection}
          selectedCategory={selectedCategory}
          onSectionChange={setActiveSection}
          onCategoryChange={setSelectedCategory}
        />
        <div className="admin-main">
          <header className="admin-header">
            <div className="header-content">
              <h1>🎮 MetaGameShop Admin</h1>
            </div>
          </header>
          <main className="content-area">
            <div className="error-state">
              ❌ Error: {error}
              <button onClick={refreshProducts} className="retry-btn">
                🔄 Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection}
        selectedCategory={selectedCategory}
        onSectionChange={setActiveSection}
        onCategoryChange={setSelectedCategory}
      />

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-content">
            <h1>🎮 MetaGameShop Admin</h1>
            <div className="header-actions">
              <span>Welcome, {user?.email}</span>
              <button onClick={handleLogout} className="logout-btn">
                🚪 Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;