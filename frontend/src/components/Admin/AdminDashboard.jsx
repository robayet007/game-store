// components/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { isAdminUser } from '../../Utils/Admin';
import Sidebar from './Sidebar/Sidebar';
import Dashboard from './Dashboard/Dashboard'; // ✅ Import Dashboard
import AddProduct from './AddProduct/AddProduct';
import CategoryView from './CatagoryProduct/CategoryProduct';
import GameDetails from './GameDetails/GameDetails';
import AddGameProduct from './AddGameProduct/AddGameProduct';
import { useProducts } from '../../hooks/useProducts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard'); // ✅ Default to dashboard
  const [selectedCategory, setSelectedCategory] = useState('subscription');
  const [editingProduct, setEditingProduct] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAvailableBalance: 0,
    totalPendingBalance: 0,
    pendingPaymentsCount: 0
  });

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
  const location = useLocation();
  const user = auth.currentUser;

  // Check if current route is a game details route
  const isGameDetailsRoute = location.pathname.includes('/admin/dashboard/game/');

  // ✅ Check admin access
  useEffect(() => {
    if (!isAdminUser(user)) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!isAdminUser(user)) {
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

  // ✅ Handle section change
  const handleSectionChange = (section) => {
    console.log('🔄 Changing section to:', section);
    setActiveSection(section);
  };

  // ✅ Handle category change
  const handleCategoryChange = (category) => {
    console.log('🔄 Changing category to:', category);
    setSelectedCategory(category);
    setActiveSection('category');
  };

  // ✅ Stats update handler
  const handleStatsUpdate = (newStats) => {
    setStats(newStats);
  };

  // Add Product Function
  const addNewProduct = async (productData) => {
    const result = await addProduct(productData);
    
    if (result.success) {
      alert(result.message);
    } else {
      alert('Error: ' + result.error);
    }
  };

  // Edit Product Function
  const editProduct = async (productId, updatedData) => {
    const result = await updateProduct(productId, updatedData);
    
    if (result.success) {
      alert(result.message);
      setEditingProduct(null);
    } else {
      alert('Error: ' + result.error);
    }
  };

  // Delete Product Function
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

  // ✅ Render main admin content
  const renderAdminContent = () => {
    console.log('🎯 Rendering section:', activeSection);
    
    switch (activeSection) {
      case 'dashboard':
      case 'overview':
      case 'users':
      case 'payments':
        return (
          <Dashboard 
            onSectionChange={handleSectionChange}
            onStatsUpdate={handleStatsUpdate}
          />
        );

      case 'add-product':
        return (
          <AddProduct 
            onAddProduct={addNewProduct}
            onEditProduct={editProduct}
            editingProduct={editingProduct}
            onCancelEdit={() => setEditingProduct(null)}
          />
        );

      case 'category':
        return (
          <CategoryView 
            category={selectedCategory}
            products={products.filter(p => p.category === selectedCategory)}
            onEditProduct={startEditing}
            onDeleteProduct={deleteProductHandler}
          />
        );

      default:
        return (
          <Dashboard 
            onSectionChange={handleSectionChange}
            onStatsUpdate={handleStatsUpdate}
          />
        );
    }
  };

  // Show loading or error states
  if (loading && activeSection !== 'add-product' && activeSection !== 'dashboard' && !isGameDetailsRoute) {
    return (
      <div className="admin-dashboard">
        <Sidebar 
          activeSection={activeSection}
          selectedCategory={selectedCategory}
          onSectionChange={handleSectionChange}
          onCategoryChange={handleCategoryChange}
          stats={stats}
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

  if (error && activeSection !== 'add-product' && activeSection !== 'dashboard' && !isGameDetailsRoute) {
    return (
      <div className="admin-dashboard">
        <Sidebar 
          activeSection={activeSection}
          selectedCategory={selectedCategory}
          onSectionChange={handleSectionChange}
          onCategoryChange={handleCategoryChange}
          stats={stats}
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
      {/* Show sidebar only if not in game details route */}
      {!isGameDetailsRoute && (
        <Sidebar 
          activeSection={activeSection}
          selectedCategory={selectedCategory}
          onSectionChange={handleSectionChange}
          onCategoryChange={handleCategoryChange}
          stats={stats}
        />
      )}

      {/* Main Content */}
      <div className={`admin-main ${isGameDetailsRoute ? 'full-width' : ''}`}>
        {/* Header - show only if not in game details route */}
        {!isGameDetailsRoute && (
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
        )}

        {/* Content Area with Nested Routes */}
        <main className="content-area">
          <Routes>
            {/* Main admin routes */}
            <Route path="/" element={renderAdminContent()} />
            
            {/* Game details routes */}
            <Route path="/game/:id" element={<GameDetails />} />
            <Route path="/game/:id/add-product" element={<AddGameProduct />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;