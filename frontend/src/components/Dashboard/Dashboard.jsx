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
  Calendar
} from 'lucide-react';
import { 
  onAuthStateChanged, 
  updatePassword, 
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut 
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import './Dashboard.css';

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

  // Mock order data
  const orders = [
    { 
      id: 1, 
      game: 'PUBG UC - 600', 
      price: '৳ 499', 
      status: 'delivered', 
      date: '2024-01-15',
      gameIcon: '🎮',
      orderId: 'MG001'
    },
    { 
      id: 2, 
      game: 'Free Fire Diamonds - 1000', 
      price: '৳ 899', 
      status: 'pending', 
      date: '2024-01-16',
      gameIcon: '💎',
      orderId: 'MG002'
    },
    { 
      id: 3, 
      game: 'Call of Duty CP - 2400', 
      price: '৳ 1,999', 
      status: 'cancelled', 
      date: '2024-01-14',
      gameIcon: '🔫',
      orderId: 'MG003'
    },
    { 
      id: 4, 
      game: 'Valorant Points - 1000', 
      price: '৳ 799', 
      status: 'delivered', 
      date: '2024-01-13',
      gameIcon: '⚡',
      orderId: 'MG004'
    }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <Truck size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'status-delivered';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
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
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email, 
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Update password
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
      await signOut(auth);
      navigate('/'); // ✅ Home route e redirect
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

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    switch (activeTab) {
      case 'orders':
        return (
          <div className="orders-section">
            <h3>Your Order History</h3>
            <div className="orders-stats">
              <div className="stat-card">
                <div className="stat-number">{orders.length}</div>
                <div className="stat-label">Total Orders</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {orders.filter(order => order.status === 'delivered').length}
                </div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {orders.filter(order => order.status === 'pending').length}
                </div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
            
            <div className="orders-grid">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="game-icon">{order.gameIcon}</span>
                    <div className="order-game-info">
                      <span className="order-game">{order.game}</span>
                      <span className="order-id">Order: {order.orderId}</span>
                    </div>
                  </div>
                  <div className="order-details">
                    <span className="order-price">{order.price}</span>
                    <span className={`order-status ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                  <div className="order-date">
                    <Calendar size={14} />
                    {order.date}
                  </div>
                </div>
              ))}
            </div>
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
                  <Package size={18} />
                  <div className="detail-content">
                    <label>Total Orders</label>
                    <span>{orders.length}</span>
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