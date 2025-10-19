import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { isAdminUser } from '../../utils/admin';
import Sidebar from './Sidebar/Sidebar';
import AddProduct from './AddProduct/AddProduct';
import CategoryView from './CatagoryProduct/CategoryProduct';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('add-product');
  const [selectedCategory, setSelectedCategory] = useState('subscription');
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Premium Monthly',
      category: 'subscription',
      price: 299,
      image: '/images/premium.jpg',
      description: 'Monthly premium subscription with exclusive benefits',
      stock: 100
    },
    {
      id: 2,
      name: 'VIP Annual Pass',
      category: 'subscription', 
      price: 2499,
      image: '/images/vip.jpg',
      description: 'Annual VIP pass with all premium features',
      stock: 50
    },
    {
      id: 3,
      name: 'Special Weekend Bundle',
      category: 'special-offers',
      price: 199,
      image: '/images/weekend.jpg',
      description: 'Limited time weekend special offer',
      stock: 25
    },
    {
      id: 4,
      name: 'PUBG UC 600',
      category: 'game-topup',
      price: 499,
      image: '/images/pubg.jpg',
      description: '600 UC for PUBG Mobile',
      stock: 100
    }
  ]);

  const [editingProduct, setEditingProduct] = useState(null);

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

  // Add Product Function
  const addNewProduct = (productData) => {
    const newProduct = {
      id: Date.now(),
      ...productData,
      stock: 100
    };
    setProducts([...products, newProduct]);
  };

  // Edit Product Function
  const editProduct = (productId, updatedData) => {
    setProducts(products.map(product => 
      product.id === productId ? { ...product, ...updatedData } : product
    ));
    setEditingProduct(null);
  };

  // Delete Product Function
  const deleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(product => product.id !== productId));
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
          onDeleteProduct={deleteProduct}
        />
      );
    }
  };

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