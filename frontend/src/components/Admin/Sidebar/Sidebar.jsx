import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeSection, selectedCategory, onSectionChange, onCategoryChange }) => {
  const categories = [
    { id: 'subscription', name: '👑 Subscription', icon: '👑' },
    { id: 'special-offers', name: '⭐ Special Offers', icon: '⭐' },
    { id: 'game-topup', name: '🎮 Game Shop', icon: '🎮' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>

      <nav className="sidebar-nav">
        {/* Add Product Button */}
        <button 
          className={`nav-item ${activeSection === 'add-product' ? 'active' : ''}`}
          onClick={() => onSectionChange('add-product')}
        >
          <span className="nav-icon">➕</span>
          <span className="nav-text">Add Product</span>
        </button>

        <div className="nav-divider">Categories</div>

        {/* Category Dropdown/Buttons */}
        {categories.map(category => (
          <button
            key={category.id}
            className={`nav-item ${activeSection === 'category' && selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => {
              onSectionChange('category');
              onCategoryChange(category.id);
            }}
          >
            <span className="nav-icon">{category.icon}</span>
            <span className="nav-text">{category.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Total Products: 156</p>
      </div>
    </aside>
  );
};

export default Sidebar;