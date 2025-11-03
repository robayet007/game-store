import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Clock, 
  XCircle, 
  Truck, 
  Shield, 
  LogOut,
  Home,
  Mail,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Image
} from 'lucide-react';
import { 
  onAuthStateChanged, 
  updatePassword, 
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut 
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { usePayment } from '../../hooks/usePayment';
import AddFund from './AddFund/AddFund';
import './Dashboard.css';

// ✅ FIXED: Remove unnecessary BASE_URL
const API_BASE_URL = "/api"; // Direct API path for Vercel proxy

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Order history states
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0,
    pendingOrders: 0
  });

  // ✅ usePayment hook
  const {
    userBalance,
    paymentHistory,
    loading: paymentLoading,
    error: paymentError,
    refreshAllData,
    createPayment
  } = usePayment();

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔥 Auth State Changed:', currentUser?.email);
      setUser(currentUser);
      setLoading(false);
      
      if (!currentUser) {
        navigate('/');
      } else {
        // Load order history when user is available
        fetchOrderHistory(currentUser.uid);
        fetchOrderStats(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch order history from API
  const fetchOrderHistory = async (userId) => {
    if (!userId) return;
    
    try {
      setOrdersLoading(true);
      setOrdersError('');
      
      const response = await fetch(
        `${API_BASE_URL}/orders/user/${userId}?page=1&limit=20`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setOrdersError(err.message);
      console.error('Error fetching order history:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch order statistics
  const fetchOrderStats = async (userId) => {
    if (!userId) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/user/${userId}/stats`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch order stats');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrderStats(data.stats || {
          totalOrders: 0,
          totalSpent: 0,
          completedOrders: 0,
          pendingOrders: 0
        });
      }
    } catch (err) {
      console.error('Error fetching order stats:', err);
    }
  };

  // Refresh order data
  const refreshOrderData = () => {
    if (user?.uid) {
      fetchOrderHistory(user.uid);
      fetchOrderStats(user.uid);
    }
  };

  // ✅ যখন payment successful হয়, তখন balance refresh করো
  const handleAddPendingBalance = (paymentData) => {
    console.log('✅ Payment added to pending:', paymentData);
    refreshAllData();
  };

  // ✅ FIXED: Get product image - proper URL handling
  const getProductImage = (productName, category) => {
    const gameImages = {
      'free fire': `/images/free-fire.jpg`,
      'pubg': `/images/pubg.jpg`,
      'mobile legends': `/images/mlbb.jpg`,
      'cod': `/images/cod.jpg`,
      'netflix': `/images/netflix.jpg`,
      'spotify': `/images/spotify.jpg`,
      'youtube': `/images/youtube.jpg`
    };

    const productKey = productName.toLowerCase();
    for (const [key, image] of Object.entries(gameImages)) {
      if (productKey.includes(key)) {
        return image;
      }
    }

    // Default images based on category
    const categoryImages = {
      'game-topup': `/images/game-default.jpg`,
      'subscription': `/images/subscription-default.jpg`,
      'special-offers': `/images/special-offer.jpg`,
      'default': `/images/product-default.jpg`
    };

    return categoryImages[category] || categoryImages.default;
  };

  // ✅ FIXED: Image error handler
  const handleImageError = (e, productName) => {
    console.error(`Image failed to load for: ${productName}`, e.target.src);
    e.target.src = '/images/product-default.jpg';
    e.target.style.opacity = '0.8';
  };

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      'completed': { 
        icon: <Truck size={16} />, 
        color: 'status-delivered',
        text: 'Delivered'
      },
      'pending': { 
        icon: <Clock size={16} />, 
        color: 'status-pending',
        text: 'Processing' 
      },
      'failed': { 
        icon: <XCircle size={16} />, 
        color: 'status-cancelled',
        text: 'Failed' 
      },
      'default': { 
        icon: <Package size={16} />, 
        color: 'status-default',
        text: 'Processing' 
      }
    };

    return configs[status] || configs.default;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match!");
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long!");
      setPasswordLoading(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email, 
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);
      
      setPasswordSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password update error:', error);
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect!');
      } else if (error.code === 'auth/weak-password') {
        setPasswordError('New password is too weak!');
      } else {
        setPasswordError('Failed to update password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logout button clicked');
      await signOut(auth);
      console.log('SignOut completed');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const formatJoinDate = () => {
    if (!user?.metadata?.creationTime) return 'Recently';
    const date = new Date(user.metadata.creationTime);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Render order history section
  const renderOrderHistory = () => {
    if (ordersLoading) {
      return <div className="loading">Loading order history...</div>;
    }

    if (ordersError) {
      return <div className="error-message">Error loading orders: {ordersError}</div>;
    }

    if (!orders || orders.length === 0) {
      return (
        <div className="empty-orders">
          <Package size={48} className="empty-icon" />
          <h3>No Orders Yet</h3>
          <p>Your order history will appear here once you make your first purchase.</p>
          <button 
            className="shop-now-btn"
            onClick={() => navigate('/shop')}
          >
            Start Shopping
          </button>
        </div>
      );
    }

    return (
      <div className="orders-section">
        <div className="section-header">
          <h3>Your Order History</h3>
          <div className="orders-summary">
            <span>Total: {orderStats.totalOrders} orders</span>
            <span>Spent: ৳ {orderStats.totalSpent?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {/* Order Statistics */}
        <div className="orders-stats">
          <div className="stat-card">
            <div className="stat-number">{orderStats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{orderStats.completedOrders}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{orderStats.pendingOrders}</div>
            <div className="stat-label">Processing</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">৳ {orderStats.totalSpent?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">Total Spent</div>
          </div>
        </div>
        
        {/* Orders Grid */}
        <div className="orders-grid">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            
            return (
              <div key={order._id || order.orderId} className="order-card">
                <div className="order-header">
                  <div className="product-image">
                    <img 
                      src={getProductImage(order.productName, order.category)}
                      alt={order.productName}
                      onError={(e) => handleImageError(e, order.productName)}
                      loading="lazy"
                      style={{ transition: 'opacity 0.3s ease' }}
                    />
                  </div>
                  <div className="order-game-info">
                    <span className="order-game">{order.productName}</span>
                    <span className="order-id">Order: {order.orderId}</span>
                  </div>
                </div>
                
                <div className="order-details">
                  <div className="order-meta">
                    <span className="order-quantity">Qty: {order.quantity}</span>
                    <span className="order-price">৳ {order.totalAmount}</span>
                  </div>
                  <span className={`order-status ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {statusConfig.text}
                  </span>
                </div>

                {/* Game Information (if available) */}
                {(order.playerUID || order.gameUsername) && (
                  <div className="game-info">
                    {order.playerUID && (
                      <div className="game-detail">
                        <span className="label">Game UID:</span>
                        <span className="value">{order.playerUID}</span>
                      </div>
                    )}
                    {order.gameUsername && (
                      <div className="game-detail">
                        <span className="label">Username:</span>
                        <span className="value">{order.gameUsername}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="order-footer">
                  <div className="order-date">
                    <Calendar size={14} />
                    {formatDate(order.purchaseDate)}
                  </div>
                  <div className="order-category">
                    {order.category === 'game-topup' && '🎮 Game'}
                    {order.category === 'subscription' && '👑 Subscription'}
                    {order.category === 'special-offers' && '⭐ Special Offer'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Refresh Button */}
        <div className="refresh-section">
          <button 
            className="refresh-btn"
            onClick={refreshOrderData}
            disabled={ordersLoading}
          >
            {ordersLoading ? 'Refreshing...' : 'Refresh Orders'}
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    switch (activeTab) {
      case 'orders':
        return renderOrderHistory();

      case 'balance':
        return (
          <div className="balance-section">
            <AddFund 
              currentBalance={userBalance.availableBalance}
              pendingBalance={userBalance.pendingBalance}
              userBkashNumber="01766325020"
              onAddPendingBalance={handleAddPendingBalance}
            />
          </div>
        );

      case 'security':
        return (
          <div className="security-section">
            <h3>Security Settings</h3>
            
            {user?.providerData?.[0]?.providerId === 'password' ? (
              <div className="change-password">
                <h4>Change Password</h4>
                {passwordError && <div className="error-message">{passwordError}</div>}
                {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
                
                <form onSubmit={handlePasswordChange} className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value
                      })}
                      required
                      disabled={passwordLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter new password (min 6 characters)"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value
                      })}
                      required
                      disabled={passwordLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value
                      })}
                      required
                      disabled={passwordLoading}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="update-btn"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="social-login-info">
                <div className="info-card">
                  <Shield size={24} />
                  <div className="info-content">
                    <h4>Social Login Account</h4>
                    <p>You are logged in with {user?.providerData?.[0]?.providerId || 'social account'}. 
                    Password change is not available for social login accounts.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'profile':
      default:
        return (
          <div className="profile-section">
            <h3>Profile Information</h3>
            <div className="profile-card">
              <div className="profile-header">
                <div className="user-avatar-large">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="profile-image"
                    />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <div className="profile-info-main">
                  <h2 className="user-display-name">
                    {user?.displayName || user?.email?.split('@')[0] || 'Gamer'}
                  </h2>
                  <p className="user-role">PRO GAMER</p>
                </div>
              </div>
              
              <div className="profile-details">
                <div className="detail-item">
                  <Mail size={18} />
                  <div className="detail-content">
                    <label>Email Address</label>
                    <span>{user?.email || 'Not available'}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <User size={18} />
                  <div className="detail-content">
                    <label>Account Type</label>
                    <span className="account-type">
                      {user?.providerData?.[0]?.providerId === 'password' ? 'Email/Password' : 'Social Login'}
                    </span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <Calendar size={18} />
                  <div className="detail-content">
                    <label>Member Since</label>
                    <span>{formatJoinDate()}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <DollarSign size={18} />
                  <div className="detail-content">
                    <label>Available Balance</label>
                    <span className="balance-amount-small">৳ {userBalance.availableBalance?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <Clock size={18} />
                  <div className="detail-content">
                    <label>Pending Balance</label>
                    <span className="balance-amount-small pending">৳ {userBalance.pendingBalance?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <Package size={18} />
                  <div className="detail-content">
                    <label>Total Orders</label>
                    <span>{orderStats.totalOrders || 0}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <DollarSign size={18} />
                  <div className="detail-content">
                    <label>Total Spent</label>
                    <span className="balance-amount-small">
                      ৳ {orderStats.totalSpent?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading Dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <button onClick={handleGoHome} className="home-btn">
            <Home size={24} />
          </button>
          <div className="user-profile">
            <div className="user-avatar">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="profile-avatar-img"
                />
              ) : (
                <User size={24} />
              )}
            </div>
            <div className="user-info">
              <h1 className="user-name">
                {user?.displayName || user?.email?.split('@')[0] || 'Gamer'}
              </h1>
              <p className="user-gamer">GAMER DASHBOARD</p>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} />
              <span>Profile</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={20} />
              <span>Orders</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'balance' ? 'active' : ''}`}
              onClick={() => setActiveTab('balance')}
            >
              <DollarSign size={20} />
              <span>Balance</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield size={20} />
              <span>Security</span>
            </button>

            <button className="nav-item logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;