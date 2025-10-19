import React, { useState } from 'react';
import { Gamepad2, Crown, Star, TrendingUp, Package, ShoppingCart, DollarSign, Calendar, Plus } from 'lucide-react';

const Dashboard = ({ stats, purchaseHistory, products, onCategorySelect }) => {
  const [dateRange, setDateRange] = useState('today');

  const categories = [
    { 
      id: 'game-topup', 
      name: 'Game Top Up', 
      icon: Gamepad2, 
      color: '#00ffff',
      productCount: products.filter(p => p.category === 'game-topup').length,
      description: 'Game currencies and top-ups'
    },
    { 
      id: 'subscription', 
      name: 'Subscription', 
      icon: Crown, 
      color: '#ffaa00',
      productCount: products.filter(p => p.category === 'subscription').length,
      description: 'Premium memberships'
    },
    { 
      id: 'special-offers', 
      name: 'Special Offers', 
      icon: Star, 
      color: '#ff0080',
      productCount: products.filter(p => p.category === 'special-offers').length,
      description: 'Limited time deals'
    }
  ];

  const filteredHistory = purchaseHistory.filter(order => {
    const orderDate = new Date(order.date);
    const today = new Date();
    
    switch (dateRange) {
      case 'today':
        return orderDate.toDateString() === today.toDateString();
      case 'week':
        const weekAgo = new Date(today.setDate(today.getDate() - 7));
        return orderDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
        return orderDate >= monthAgo;
      default:
        return true;
    }
  });

  const totalRevenue = filteredHistory
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.amount, 0);

  const completedOrders = filteredHistory.filter(order => order.status === 'completed').length;
  const pendingOrders = filteredHistory.filter(order => order.status === 'pending').length;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>🎯 Command Dashboard</h1>
          <p>Real-time gaming store analytics</p>
        </div>
        <div className="date-filter">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-select"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>৳{totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
            <span className="stat-trend">
              <TrendingUp size={16} />
              +12% from yesterday
            </span>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <h3>{completedOrders}</h3>
            <p>Completed Orders</p>
            <span className="stat-trend">
              <TrendingUp size={16} />
              +5% from yesterday
            </span>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <h3>{products.length}</h3>
            <p>Total Products</p>
            <span className="stat-trend">
              Active: {products.filter(p => p.status === 'active').length}
            </span>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{pendingOrders}</h3>
            <p>Pending Orders</p>
            <span className="stat-trend warning">
              Needs attention
            </span>
          </div>
        </div>
      </div>

      {/* Category Overview */}
      <div className="category-overview">
        <div className="section-header">
          <h2>🎮 Product Categories</h2>
          <p>Manage products by category</p>
        </div>

        <div className="categories-grid">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <div 
                key={category.id} 
                className="category-card"
                onClick={() => onCategorySelect(category.id)}
              >
                <div className="category-header">
                  <div className="category-icon" style={{ color: category.color }}>
                    <Icon size={32} />
                  </div>
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                </div>
                <div className="category-stats">
                  <span className="product-count">{category.productCount} Products</span>
                  <button className="view-products-btn">
                    View Products →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Purchase History */}
      <div className="purchase-history">
        <div className="section-header">
          <h2>📈 Recent Purchase History</h2>
          <span className="total-orders">{filteredHistory.length} orders</span>
        </div>

        <div className="history-table">
          <div className="table-header">
            <div>Product</div>
            <div>Customer</div>
            <div>Amount</div>
            <div>Date</div>
            <div>Status</div>
          </div>

          <div className="table-body">
            {filteredHistory.slice(0, 8).map(order => (
              <div key={order.id} className="table-row">
                <div className="product-cell">
                  <span className="product-name">{order.product}</span>
                </div>
                <div className="customer-cell">
                  <span className="customer-email">{order.user}</span>
                </div>
                <div className="amount-cell">
                  <span className="amount">৳{order.amount}</span>
                </div>
                <div className="date-cell">
                  <span className="date">{new Date(order.date).toLocaleDateString()}</span>
                  <span className="time">{new Date(order.date).toLocaleTimeString()}</span>
                </div>
                <div className="status-cell">
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 && (
          <div className="no-data">
            <p>No orders found for the selected period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;