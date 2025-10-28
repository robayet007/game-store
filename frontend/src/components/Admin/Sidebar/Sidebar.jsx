import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeSection, selectedCategory, onSectionChange, onCategoryChange, stats }) => {
  const categories = [
    { id: 'subscription', name: '👑 Subscription', icon: '👑' },
    { id: 'special-offers', name: '⭐ Special Offers', icon: '⭐' },
    { id: 'game-topup', name: '🎮 Game Shop', icon: '🎮' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
        <p>Complete Store Management</p>
      </div>

      <nav className="sidebar-nav">
        {/* Dashboard Button */}
        <button 
          className={`nav-item ${activeSection === 'dashboard' || activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => onSectionChange('dashboard')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Dashboard</span>
        </button>

        {/* Users Management */}
        {/* <button 
          className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
          onClick={() => onSectionChange('users')}
        >
          <span className="nav-icon">👥</span>
          <span className="nav-text">Users Management</span>
          {stats?.totalUsers > 0 && (
            <span className="notification-badge">{stats.totalUsers}</span>
          )}
        </button> */}

        {/* Pending Requests - NEW */}
        {/* <button 
          className={`nav-item ${activeSection === 'payments' ? 'active' : ''}`}
          onClick={() => onSectionChange('payments')}
        >
          <span className="nav-icon">⏳</span>
          <span className="nav-text">Pending Requests</span>
          {stats?.pendingPaymentsCount > 0 && (
            <span className="notification-badge warning">{stats.pendingPaymentsCount}</span>
          )}
        </button> */}

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
        <div className="footer-stats">
          <div className="stat-item">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{stats?.totalUsers || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending Req</span>
            <span className="stat-value warning">{stats?.pendingPaymentsCount || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Available</span>
            <span className="stat-value success">৳{(stats?.totalAvailableBalance || 0).toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending Bal</span>
            <span className="stat-value pending">৳{(stats?.totalPendingBalance || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;