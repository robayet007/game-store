import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Clock, AlertCircle, CheckCircle, 
  XCircle, User, TrendingUp, Mail, Phone,
  RefreshCw, CreditCard, Plus
} from 'lucide-react';
import './Dashboard.css';

// ✅ Base URL constant - Vercel proxy use korbe
const BASE_URL = ""; // Empty string for relative paths
const API_BASE_URL = "/api"; // Direct API path for Vercel

const Dashboard = ({ onSectionChange, onStatsUpdate }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [users, setUsers] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // ✅ Fetch all data from backend
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching dashboard data...');
      
      // ✅ Parallel API calls for better performance
      const [usersResponse, paymentsResponse] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/admin/users`),  // ✅ Vercel proxy use korbe
        fetch(`${API_BASE_URL}/payments/admin/pending`)  // ✅ Vercel proxy use korbe
      ]);

      let usersData = { users: [] };
      let paymentsData = { payments: [] };

      // ✅ Handle users response
      if (usersResponse.status === 'fulfilled' && usersResponse.value.ok) {
        usersData = await usersResponse.value.json();
        if (usersData.success) {
          setUsers(usersData.users || []);
          console.log('✅ Users loaded:', usersData.users.length);
        }
      } else {
        console.warn('⚠️ Users API failed:', usersResponse.reason);
        setUsers([]);
      }

      // ✅ Handle payments response
      if (paymentsResponse.status === 'fulfilled' && paymentsResponse.value.ok) {
        paymentsData = await paymentsResponse.value.json();
        if (paymentsData.success) {
          setPendingPayments(paymentsData.payments || []);
          console.log('✅ Pending payments loaded:', paymentsData.payments.length);
        }
      } else {
        console.warn('⚠️ Payments API failed:', paymentsResponse.reason);
        setPendingPayments([]);
      }

      // ✅ Stats update
      if (onStatsUpdate) {
        const totalAvailableBalance = (usersData.users || []).reduce((sum, user) => 
          sum + (parseFloat(user.availableBalance) || 0), 0
        );

        const totalPendingBalance = (usersData.users || []).reduce((sum, user) => 
          sum + (parseFloat(user.pendingBalance) || 0), 0
        );

        onStatsUpdate({
          totalUsers: (usersData.users || []).length,
          totalAvailableBalance,
          totalPendingBalance,
          pendingPaymentsCount: (paymentsData.payments || []).length
        });
      }

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      alert('ডেটা লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calculate totals
  const totalAvailableBalance = users.reduce((sum, user) => 
    sum + (parseFloat(user.availableBalance) || 0), 0
  );

  const totalPendingBalance = users.reduce((sum, user) => 
    sum + (parseFloat(user.pendingBalance) || 0), 0
  );

  // ✅ Handle payment approval
  const handleApprovePayment = async (payment) => {
    if (!window.confirm(
      `✅ এই payment request টি approve করতে চান?\n\n` +
      `User: ${payment.user?.email || payment.userId}\n` +
      `Amount: ৳${payment.amount}\n` +
      `Sender: ${payment.senderNumber}\n` +
      `Transaction: ${payment.transactionId}\n\n` +
      `Approve করলে ৳${payment.amount} user এর Available Balance এ যুক্ত হবে।`
    )) {
      return;
    }

    try {
      setActionLoading(payment._id);
      console.log('🔄 Approving payment:', payment._id);
      
      const response = await fetch(`${API_BASE_URL}/admin/approve-payment/${payment._id}`, {  // ✅ Vercel proxy use korbe
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: 'admin_user_id',
          adminName: 'Admin User'
        })
      });

      const result = await response.json();
      console.log('✅ Approval response:', result);

      if (result.success) {
        alert(
          `✅ Payment approved successfully!\n\n` +
          `৳${payment.amount} user এর Available Balance এ transfer হয়েছে।\n` +
          `User: ${payment.user?.email || payment.userId}`
        );
        await fetchDashboardData(); // Wait for refresh
      } else {
        throw new Error(result.message || 'Approval failed');
      }
    } catch (error) {
      console.error('❌ Error approving payment:', error);
      alert(`❌ Payment approve করতে সমস্যা হয়েছে: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Handle payment rejection
  const handleRejectPayment = async (payment) => {
    if (!window.confirm(
      `❌ এই payment request টি reject করতে চান?\n\n` +
      `User: ${payment.user?.email || payment.userId}\n` +
      `Amount: ৳${payment.amount}\n` +
      `Transaction: ${payment.transactionId}\n\n` +
      `Reject করলে এই request সম্পূর্ণ delete হয়ে যাবে!`
    )) {
      return;
    }

    try {
      setActionLoading(payment._id);
      console.log('🔄 Rejecting payment:', payment._id);
      
      const response = await fetch(`${API_BASE_URL}/admin/reject-payment/${payment._id}`, {  // ✅ Vercel proxy use korbe
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: 'admin_user_id',
          adminName: 'Admin User',
          reason: 'Transaction verification failed'
        })
      });

      const result = await response.json();
      console.log('✅ Rejection response:', result);

      if (result.success) {
        alert(`✅ Payment rejected successfully!`);
        await fetchDashboardData(); // Wait for refresh
      } else {
        throw new Error(result.message || 'Rejection failed');
      }
    } catch (error) {
      console.error('❌ Error rejecting payment:', error);
      alert(`❌ Payment reject করতে সমস্যা হয়েছে: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading Dashboard Data...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return (
          <div className="users-overview-section">
            <div className="section-header">
              <div>
                <h2>👥 Users Management</h2>
                <p>সকল users এবং তাদের balance manage করুন</p>
              </div>
              <button 
                className="refresh-btn"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? "spinning" : ""} />
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>

            <div className="users-table-container">
              <div className="users-table">
                <div className="table-header">
                  <div className="header-cell">User Email</div>
                  <div className="header-cell">Available Balance</div>
                  <div className="header-cell">Pending Balance</div>
                  <div className="header-cell">Total Added</div>
                  <div className="header-cell">Total Spent</div>
                  <div className="header-cell">Join Date</div>
                </div>

                <div className="table-body">
                  {users.map(user => (
                    <div key={user._id} className="table-row">
                      <div className="table-cell user-email-cell">
                        <Mail size={16} />
                        <span className="email">{user.email}</span>
                      </div>
                      <div className="table-cell balance-cell available">
                        ৳ {(parseFloat(user.availableBalance) || 0).toFixed(2)}
                      </div>
                      <div className="table-cell balance-cell pending">
                        ৳ {(parseFloat(user.pendingBalance) || 0).toFixed(2)}
                      </div>
                      <div className="table-cell balance-cell total-added">
                        ৳ {(parseFloat(user.totalAdded) || 0).toFixed(2)}
                      </div>
                      <div className="table-cell balance-cell total-spent">
                        ৳ {(parseFloat(user.totalSpent) || 0).toFixed(2)}
                      </div>
                      <div className="table-cell join-date-cell">
                        {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {users.length === 0 && (
              <div className="no-data">
                <User size={48} color="#9ca3af" />
                <p>No users found</p>
              </div>
            )}
          </div>
        );

      case 'payments':
        return (
          <div className="pending-payments-section">
            <div className="section-header">
              <div>
                <h2>⏳ Pending Payment Requests</h2>
                <p>Balance add এর জন্য user দের request গুলো verify করুন</p>
              </div>
              <button 
                className="refresh-btn"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? "spinning" : ""} />
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>

            <div className="payments-grid">
              {pendingPayments.length === 0 ? (
                <div className="no-pending">
                  <CheckCircle size={48} color="#10b981" />
                  <h3>No Pending Payment Requests</h3>
                  <p>কোনো user এখনো TK add এর request দেয়নি</p>
                </div>
              ) : (
                pendingPayments.map(payment => (
                  <div key={payment._id} className="payment-card">
                    <div className="payment-header">
                      <div className="user-info">
                        <h4>
                          <User size={18} />
                          {payment.user?.email || payment.userId || 'Unknown User'}
                        </h4>
                        <p className="user-id">User ID: {payment.userId}</p>
                      </div>
                      <div className="payment-amount-box">
                        <span className="amount">৳ {parseFloat(payment.amount).toLocaleString()}</span>
                        <span className="payment-date">
                          {new Date(payment.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                    </div>

                    <div className="payment-details">
                      <div className="detail-row">
                        <CreditCard size={16} />
                        <span className="label">Transaction ID:</span>
                        <span className="value code">{payment.transactionId}</span>
                      </div>
                      <div className="detail-row">
                        <Phone size={16} />
                        <span className="label">Sender Number:</span>
                        <span className="value">{payment.senderNumber}</span>
                      </div>
                      <div className="detail-row">
                        <Phone size={16} />
                        <span className="label">bKash Number:</span>
                        <span className="value">{payment.userBkashNumber}</span>
                      </div>
                      <div className="detail-row">
                        <DollarSign size={16} />
                        <span className="label">Amount:</span>
                        <span className="value amount-highlight">৳ {parseFloat(payment.amount).toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <Clock size={16} />
                        <span className="label">Request Time:</span>
                        <span className="value">
                          {new Date(payment.createdAt).toLocaleString('bn-BD')}
                        </span>
                      </div>
                    </div>

                    <div className="payment-actions">
                      <button 
                        className="approve-btn"
                        onClick={() => handleApprovePayment(payment)}
                        disabled={actionLoading === payment._id}
                      >
                        {actionLoading === payment._id ? (
                          <>
                            <div className="mini-spinner"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Approve & Add Balance
                          </>
                        )}
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleRejectPayment(payment)}
                        disabled={actionLoading === payment._id}
                      >
                        <XCircle size={16} />
                        Reject & Remove
                      </button>
                    </div>

                    <div className="payment-note">
                      <strong>Note:</strong> Approve করলে ৳{payment.amount} user এর <strong>Available Balance</strong> এ যুক্ত হবে
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'overview':
      default:
        return (
          <div className="overview-section">
            <div className="section-header">
              <div>
                <h2>📊 Dashboard Overview</h2>
                <p>Complete store management & analytics</p>
              </div>
              <button 
                className="refresh-btn"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? "spinning" : ""} />
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card users">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <h3>{users.length}</h3>
                  <p>Total Users</p>
                  <span className="stat-trend">
                    <TrendingUp size={16} />
                    Active users
                  </span>
                </div>
              </div>

              <div className="stat-card balance">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-content">
                  <h3>৳{totalAvailableBalance.toLocaleString()}</h3>
                  <p>Total Available Balance</p>
                  <span className="stat-trend">
                    Across all users
                  </span>
                </div>
              </div>

              <div className="stat-card pending-balance">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-content">
                  <h3>৳{totalPendingBalance.toLocaleString()}</h3>
                  <p>Pending Balance</p>
                  <span className="stat-trend warning">
                    Needs verification
                  </span>
                </div>
              </div>

              <div className="stat-card pending-payments">
                <div className="stat-icon">
                  <AlertCircle size={24} />
                </div>
                <div className="stat-content">
                  <h3>{pendingPayments.length}</h3>
                  <p>Pending Requests</p>
                  <span className="stat-trend warning">
                    Action required
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button 
                  className="action-button primary"
                  onClick={() => setActiveSection('users')}
                >
                  <Users size={20} />
                  Manage Users ({users.length})
                </button>
                <button 
                  className="action-button warning"
                  onClick={() => setActiveSection('payments')}
                >
                  <AlertCircle size={20} />
                  Pending Requests ({pendingPayments.length})
                </button>
                <button 
                  className="action-button secondary"
                  onClick={() => onSectionChange && onSectionChange('add-product')}
                >
                  <Plus size={20} />
                  Add Product
                </button>
              </div>
            </div>

            {/* Recent Pending Payments Preview */}
            {pendingPayments.length > 0 && (
              <div className="recent-payments-preview">
                <h3>Recent Pending Requests</h3>
                <div className="mini-payments-grid">
                  {pendingPayments.slice(0, 5).map(payment => (
                    <div key={payment._id} className="mini-payment-card">
                      <div className="mini-payment-info">
                        <div className="mini-user">
                          <User size={14} />
                          <strong>{payment.user?.email || payment.userId || 'Unknown'}</strong>
                        </div>
                        <span className="mini-amount">৳{parseFloat(payment.amount).toLocaleString()}</span>
                      </div>
                      <div className="mini-details">
                        <small>Trx: {payment.transactionId.slice(0, 10)}...</small>
                        <small>From: {payment.senderNumber}</small>
                      </div>
                      <div className="mini-actions">
                        <button 
                          className="mini-approve-btn"
                          onClick={() => handleApprovePayment(payment)}
                        >
                          Approve
                        </button>
                        <button 
                          className="mini-view-btn"
                          onClick={() => setActiveSection('payments')}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>🎯 Admin Dashboard</h1>
          <p>Complete store management system</p>
        </div>
        <div className="header-actions">
          <button 
            className={`nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            Overview
          </button>
          <button 
            className={`nav-btn ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            Users ({users.length})
          </button>
          <button 
            className={`nav-btn ${activeSection === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveSection('payments')}
          >
            Pending ({pendingPayments.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;