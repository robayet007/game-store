import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Image,
} from "lucide-react";
import {
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { usePayment } from "../../hooks/usePayment";
import AddFund from "./AddFund/AddFund";
import styles from "./Dashboard.module.css"; // ✅ CSS Module import

// ✅ BASE_URL change করুন - Vercel proxy use করুন
const BASE_URL = ""; // Empty string for relative paths
const API_BASE_URL = "/api"; // Direct API path for Vercel proxy

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Order history states
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0,
    pendingOrders: 0,
  });

  // ✅ usePayment hook
  const {
    userBalance,
    paymentHistory,
    loading: paymentLoading,
    error: paymentError,
    refreshAllData,
    createPayment,
  } = usePayment();

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("🔥 Auth State Changed:", currentUser?.email);
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        navigate("/");
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
      setOrdersError("");

      const response = await fetch(
        `${API_BASE_URL}/orders/user/${userId}?page=1&limit=20`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order history");
      }

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setOrdersError(err.message);
      console.error("Error fetching order history:", err);
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
        throw new Error("Failed to fetch order stats");
      }

      const data = await response.json();

      if (data.success) {
        setOrderStats(
          data.stats || {
            totalOrders: 0,
            totalSpent: 0,
            completedOrders: 0,
            pendingOrders: 0,
          }
        );
      }
    } catch (err) {
      console.error("Error fetching order stats:", err);
    }
  };

  // Refresh order data
  const refreshOrderData = () => {
    if (user?.uid) {
      fetchOrderHistory(user.uid);
      fetchOrderStats(user.uid);
    }
  };

  // ✅ যখন payment successful হয়, তখন balance refresh করো
  const handleAddPendingBalance = (paymentData) => {
    console.log("✅ Payment added to pending:", paymentData);
    refreshAllData();
  };

  // Get product image based on product name and category
  // ✅ FIXED: Get product image - proper URL handling
  const getProductImage = (productName, category) => {
    const gameImages = {
      "free fire": `/images/free-fire.jpg`,
      pubg: `/images/pubg.jpg`,
      "mobile legends": `/images/mlbb.jpg`,
      cod: `/images/cod.jpg`,
      netflix: `/images/netflix.jpg`,
      spotify: `/images/spotify.jpg`,
      youtube: `/images/youtube.jpg`,
    };

    const productKey = productName.toLowerCase();
    for (const [key, image] of Object.entries(gameImages)) {
      if (productKey.includes(key)) {
        return image;
      }
    }

    // Default images based on category
    const categoryImages = {
      "game-topup": `/images/game-default.jpg`,
      subscription: `/images/subscription-default.jpg`,
      "special-offers": `/images/special-offer.jpg`,
      default: `/images/product-default.jpg`,
    };

    return categoryImages[category] || categoryImages.default;
  };

  // ✅ FIXED: Image error handler
  const handleImageError = (e, productName) => {
    console.error(`Image failed to load for: ${productName}`, e.target.src);
    e.target.src = "/images/product-default.jpg";
    e.target.style.opacity = "0.8";
  };

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        icon: <Truck size={16} />,
        color: styles.statusDelivered,
        text: "Delivered",
      },
      pending: {
        icon: <Clock size={16} />,
        color: styles.statusPending,
        text: "Processing",
      },
      failed: {
        icon: <XCircle size={16} />,
        color: styles.statusCancelled,
        text: "Failed",
      },
      default: {
        icon: <Package size={16} />,
        color: styles.statusDefault,
        text: "Processing",
      },
    };

    return configs[status] || configs.default;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

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

      setPasswordSuccess("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password update error:", error);
      if (error.code === "auth/wrong-password") {
        setPasswordError("Current password is incorrect!");
      } else if (error.code === "auth/weak-password") {
        setPasswordError("New password is too weak!");
      } else {
        setPasswordError("Failed to update password. Please try again.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logout button clicked");
      await signOut(auth);
      console.log("SignOut completed");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const formatJoinDate = () => {
    if (!user?.metadata?.creationTime) return "Recently";
    const date = new Date(user.metadata.creationTime);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Render order history section
  const renderOrderHistory = () => {
    if (ordersLoading) {
      return <div className={styles.loading}>Loading order history...</div>;
    }

    if (ordersError) {
      return (
        <div className={styles.errorMessage}>
          Error loading orders: {ordersError}
        </div>
      );
    }

    if (!orders || orders.length === 0) {
      return (
        <div className={styles.emptyOrders}>
          <Package size={48} className={styles.emptyIcon} />
          <h3>No Orders Yet</h3>
          <p>
            Your order history will appear here once you make your first
            purchase.
          </p>
          <button
            className={styles.shopNowBtn}
            onClick={() => navigate("/shop")}
          >
            Start Shopping
          </button>
        </div>
      );
    }

    return (
      <div className={styles.ordersSection}>
        <div className={styles.sectionHeader}>
          <h3>Your Order History</h3>
          <div className={styles.ordersSummary}>
            <span>Total: {orderStats.totalOrders} orders</span>
            <span>Spent: ৳ {orderStats.totalSpent?.toFixed(2) || "0.00"}</span>
          </div>
        </div>

        {/* Order Statistics */}
        <div className={styles.ordersStats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{orderStats.totalOrders}</div>
            <div className={styles.statLabel}>Total Orders</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              {orderStats.completedOrders}
            </div>
            <div className={styles.statLabel}>Completed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{orderStats.pendingOrders}</div>
            <div className={styles.statLabel}>Processing</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              ৳ {orderStats.totalSpent?.toFixed(2) || "0.00"}
            </div>
            <div className={styles.statLabel}>Total Spent</div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className={styles.ordersGrid}>
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);

            return (
              <div
                key={order._id || order.orderId}
                className={styles.orderCard}
              >
                <div className={styles.orderHeader}>
                  <div className={styles.productImage}>
                    <img
                      src={getProductImage(order.productName, order.category)}
                      alt={order.productName}
                      onError={(e) => handleImageError(e, order.productName)}
                      loading="lazy"
                      style={{ transition: "opacity 0.3s ease" }}
                    />
                  </div>
                  <div className={styles.orderGameInfo}>
                    <span className={styles.orderGame}>
                      {order.productName}
                    </span>
                    <span className={styles.orderId}>
                      Order: {order.orderId}
                    </span>
                  </div>
                </div>

                <div className={styles.orderDetails}>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderQuantity}>
                      Qty: {order.quantity}
                    </span>
                    <span className={styles.orderPrice}>
                      ৳ {order.totalAmount}
                    </span>
                  </div>
                  <span
                    className={`${styles.orderStatus} ${statusConfig.color}`}
                  >
                    {statusConfig.icon}
                    {statusConfig.text}
                  </span>
                </div>

                {/* Game Information (if available) */}
                {(order.playerUID || order.gameUsername) && (
                  <div className={styles.gameInfo}>
                    {order.playerUID && (
                      <div className={styles.gameDetail}>
                        <span className={styles.label}>Game UID:</span>
                        <span className={styles.value}>{order.playerUID}</span>
                      </div>
                    )}
                    {order.gameUsername && (
                      <div className={styles.gameDetail}>
                        <span className={styles.label}>Username:</span>
                        <span className={styles.value}>
                          {order.gameUsername}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.orderFooter}>
                  <div className={styles.orderDate}>
                    <Calendar size={14} />
                    {formatDate(order.purchaseDate)}
                  </div>
                  <div className={styles.orderCategory}>
                    {order.category === "game-topup" && "🎮 Game"}
                    {order.category === "subscription" && "👑 Subscription"}
                    {order.category === "special-offers" && "⭐ Special Offer"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Refresh Button */}
        <div className={styles.refreshSection}>
          <button
            className={styles.refreshBtn}
            onClick={refreshOrderData}
            disabled={ordersLoading}
          >
            {ordersLoading ? "Refreshing..." : "Refresh Orders"}
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <div className={styles.loading}>Loading...</div>;
    }

    switch (activeTab) {
      case "orders":
        return renderOrderHistory();

      case "balance":
        return (
          <div className={styles.balanceSection}>
            <AddFund
              currentBalance={userBalance.availableBalance}
              pendingBalance={userBalance.pendingBalance}
              userBkashNumber="01766325020"
              onAddPendingBalance={handleAddPendingBalance}
            />
          </div>
        );

      case "security":
        return (
          <div className={styles.securitySection}>
            <h3>Security Settings</h3>

            {user?.providerData?.[0]?.providerId === "password" ? (
              <div className={styles.changePassword}>
                <h4>Change Password</h4>
                {passwordError && (
                  <div className={styles.errorMessage}>{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div className={styles.successMessage}>{passwordSuccess}</div>
                )}

                <form
                  onSubmit={handlePasswordChange}
                  className={styles.passwordForm}
                >
                  <div className={styles.formGroup}>
                    <label>Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                      disabled={passwordLoading}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password (min 6 characters)"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      required
                      disabled={passwordLoading}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      disabled={passwordLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    className={styles.updateBtn}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            ) : (
              <div className={styles.socialLoginInfo}>
                <div className={styles.infoCard}>
                  <Shield size={24} />
                  <div className={styles.infoContent}>
                    <h4>Social Login Account</h4>
                    <p>
                      You are logged in with{" "}
                      {user?.providerData?.[0]?.providerId || "social account"}.
                      Password change is not available for social login
                      accounts.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "profile":
      default:
        return (
          <div className={styles.profileSection}>
            <h3>Profile Information</h3>
            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <div className={styles.userAvatarLarge}>
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className={styles.profileImage}
                    />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <div className={styles.profileInfoMain}>
                  <h2 className={styles.userDisplayName}>
                    {user?.displayName || user?.email?.split("@")[0] || "Gamer"}
                  </h2>
                  <p className={styles.userRole}>PRO GAMER</p>
                </div>
              </div>

              <div className={styles.profileDetails}>
                <div className={styles.detailItem}>
                  <Mail size={18} />
                  <div className={styles.detailContent}>
                    <label>Email Address</label>
                    <span>{user?.email || "Not available"}</span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <User size={18} />
                  <div className={styles.detailContent}>
                    <label>Account Type</label>
                    <span className={styles.accountType}>
                      {user?.providerData?.[0]?.providerId === "password"
                        ? "Email/Password"
                        : "Social Login"}
                    </span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <Calendar size={18} />
                  <div className={styles.detailContent}>
                    <label>Member Since</label>
                    <span>{formatJoinDate()}</span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <DollarSign size={18} />
                  <div className={styles.detailContent}>
                    <label>Available Balance</label>
                    <span className={styles.balanceAmountSmall}>
                      ৳ {userBalance.availableBalance?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <Clock size={18} />
                  <div className={styles.detailContent}>
                    <label>Pending Balance</label>
                    <span
                      className={`${styles.balanceAmountSmall} ${styles.balanceAmountSmallPending}`}
                    >
                      ৳ {userBalance.pendingBalance?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <Package size={18} />
                  <div className={styles.detailContent}>
                    <label>Total Orders</label>
                    <span>{orderStats.totalOrders || 0}</span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <DollarSign size={18} />
                  <div className={styles.detailContent}>
                    <label>Total Spent</label>
                    <span className={styles.balanceAmountSmall}>
                      ৳ {orderStats.totalSpent?.toFixed(2) || "0.00"}
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
    return <div className={styles.dashboardLoading}>Loading Dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={handleGoHome} className={styles.homeBtn}>
            <Home size={24} />
          </button>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className={styles.profileAvatarImg}
                />
              ) : (
                <User size={24} />
              )}
            </div>
            <div className={styles.userInfo}>
              <h1 className={styles.userName}>
                {user?.displayName || user?.email?.split("@")[0] || "Gamer"}
              </h1>
              <p className={styles.userGamer}>GAMER DASHBOARD</p>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <button
              className={`${styles.navItem} ${
                activeTab === "profile" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={20} />
              <span>Profile</span>
            </button>

            <button
              className={`${styles.navItem} ${
                activeTab === "orders" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveTab("orders")}
            >
              <Package size={20} />
              <span>Orders</span>
            </button>

            <button
              className={`${styles.navItem} ${
                activeTab === "balance" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveTab("balance")}
            >
              <DollarSign size={20} />
              <span>Balance</span>
            </button>

            <button
              className={`${styles.navItem} ${
                activeTab === "security" ? styles.navItemActive : ""
              }`}
              onClick={() => setActiveTab("security")}
            >
              <Shield size={20} />
              <span>Security</span>
            </button>

            <button
              className={`${styles.navItem} ${styles.logoutBtn}`}
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;
