// Checkout.jsx - With Base URL
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Minus, Plus, Wallet } from 'lucide-react';
import styles from './Checkout.module.css';

// ✅ Base URL constant - Vercel proxy use korbe
const BASE_URL = ""; // Empty string for relative paths

const Checkout = ({ user }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [formData, setFormData] = useState({
    playerUID: '',
    username: '',
    whatsapp: '',
    email: ''
  });
  const [quantity, setQuantity] = useState(1);
  const [userBalance, setUserBalance] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // User authentication check
  useEffect(() => {
    if (!user || !user.email) {
      alert('Please login first!');
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Fetch user balance from API using email
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (!user?.email) return;
      
      try {
        setBalanceLoading(true);
        // ✅ Vercel proxy use korbe
        const response = await fetch(`/api/admin/users`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.users) {
            // Find current user by email
            const currentUser = data.users.find(u => u.email === user.email);
            
            if (currentUser) {
              setUserBalance(currentUser.availableBalance || 0);
              // Auto-fill email in form
              setFormData(prev => ({
                ...prev,
                email: user.email
              }));
            } else {
              console.warn('User not found in database');
              setUserBalance(0);
            }
          }
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user balance:', error);
        alert('Error loading your balance. Please try again.');
        setUserBalance(0);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchUserBalance();
  }, [user]);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      
      // Method 1: From location state
      if (location.state?.product) {
        setSelectedItem(location.state.product);
        setLoading(false);
        return;
      }

      // Method 2: From URL parameter and API call
      if (id) {
        try {
          // ✅ Vercel proxy use korbe
          const response = await fetch(`/api/products/${id}`);
          if (response.ok) {
            const productData = await response.json();
            setSelectedItem(productData);
          } else {
            throw new Error('Product not found');
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          alert('Product not found! Redirecting to shop...');
          navigate('/shop');
        }
      } else {
        alert('No product selected! Redirecting to shop...');
        navigate('/shop');
      }
      
      setLoading(false);
    };

    if (user?.email) {
      fetchProductData();
    }
  }, [id, location.state, navigate, user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuantityChange = (type) => {
    if (type === 'increment') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const calculateTotal = () => {
    if (!selectedItem) return 0;
    return selectedItem.price * quantity;
  };

  const handlePurchaseClick = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.whatsapp) {
      alert('Please enter your WhatsApp number');
      return;
    }

    if (selectedItem.category === 'game-topup' && (!formData.playerUID || !formData.username)) {
      alert('Please enter your game UID and username');
      return;
    }

    // Show confirmation popup
    setShowConfirmation(true);
    setConfirmationText('');
  };

  const handleConfirmPurchase = async () => {
    if (confirmationText.toLowerCase() !== 'yes') {
      alert('Please type "yes" to confirm your purchase');
      return;
    }

    setPurchaseLoading(true);
    const totalAmount = calculateTotal();

    try {
      const purchaseData = {
        userEmail: user.email,
        productName: selectedItem.title,
        productId: selectedItem._id || id,
        quantity: quantity,
        unitPrice: selectedItem.price,
        totalAmount: totalAmount,
        playerUID: formData.playerUID,
        gameUsername: formData.username,
        whatsappNumber: formData.whatsapp,
        category: selectedItem.category,
        paymentMethod: 'meta_balance'
      };

      console.log('🛒 Sending purchase request:', purchaseData);

      // ✅ Vercel proxy use korbe
      const response = await fetch(`/api/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setUserBalance(result.newBalance);
        setShowConfirmation(false);
        setConfirmationText('');
        
        alert(`🎉 Purchase Completed Successfully!

📦 Order Details:
────────────────
🆔 Order ID: ${result.orderId}
🎮 Product: ${selectedItem.title}
🔢 Quantity: ${quantity}
💰 Total Paid: ৳ ${totalAmount}
📞 Contact: ${formData.whatsapp}
💳 New Balance: ৳ ${result.newBalance}

Thank you for your purchase! 🎮`);

        navigate('/profile/dashboard');
      } else {
        throw new Error(result.message || 'Failed to process purchase');
      }

    } catch (error) {
      console.error('❌ Error completing purchase:', error);
      
      if (error.message.includes('Insufficient balance')) {
        alert('❌ Insufficient Meta Balance! Please add more balance to your account.');
      } else if (error.message.includes('User balance not found')) {
        alert('❌ User account not found! Please contact support.');
      } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        alert('❌ Network error! Please check your internet connection and try again.');
      } else {
        alert(`❌ Error: ${error.message}`);
      }
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleCancelPurchase = () => {
    setShowConfirmation(false);
    setConfirmationText('');
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return 'https://via.placeholder.com/300x200/667eea/ffffff?text=Product+Image';
    if (imgPath.startsWith('http')) return imgPath;
    if (imgPath.startsWith('/uploads/')) return imgPath; // ✅ Vercel proxy use korbe
    return 'https://via.placeholder.com/300x200/667eea/ffffff?text=Product+Image';
  };

  const getCategoryConfig = (category) => {
    switch(category) {
      case 'subscription':
        return {
          formTitle: 'Subscription Information',
          buttonText: 'Subscribe Now',
          showGameFields: false,
          showEmail: true,
          description: 'Subscribe to premium service'
        };
      case 'game-topup':
        return {
          formTitle: 'Game Top-up Information', 
          buttonText: 'Purchase Now',
          showGameFields: true,
          showEmail: false,
          description: 'Game currency top-up'
        };
      case 'special-offers':
        return {
          formTitle: 'Special Offer Purchase',
          buttonText: 'Get This Deal',
          showGameFields: false,
          showEmail: true,
          description: 'Special limited time offer'
        };
      default:
        return {
          formTitle: 'Purchase Information',
          buttonText: 'Buy Now',
          showGameFields: false,
          showEmail: true,
          description: 'Product purchase'
        };
    }
  };

  if (!user) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.errorMessage}>
          <h2>Authentication Required</h2>
          <p>Please login to continue with your purchase.</p>
          <button 
            onClick={() => navigate('/login')}
            className={styles.backToShopBtn}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.loading}>
          <p>Loading product information...</p>
        </div>
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.errorMessage}>
          <h2>Product Not Found</h2>
          <p>The product you're looking for is not available.</p>
          <button 
            onClick={() => navigate('/shop')}
            className={styles.backToShopBtn}
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const categoryConfig = getCategoryConfig(selectedItem.category);
  const totalAmount = calculateTotal();
  const hasSufficientBalance = userBalance >= totalAmount;

  return (
    <div className={styles.checkoutContainer}>
      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className={styles.confirmationOverlay}>
          <div className={styles.confirmationPopup}>
            <div className={styles.popupHeader}>
              <h3>Confirm Your Purchase</h3>
              <p>Please review your order details</p>
            </div>
            
            <div className={styles.popupContent}>
              <div className={styles.orderDetails} style={{
                display: "grid",
                background: "#1a1a2e",
                color: "#fff",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <div className={styles.detailItem}>
                  <span>Product:</span>
                  <span>{selectedItem.title}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Unit Price:</span>
                  <span>৳ {selectedItem.price}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Total Amount:</span>
                  <span className={styles.totalAmount}>৳ {totalAmount}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Current Balance:</span>
                  <span>৳ {userBalance.toFixed(2)}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Balance After Purchase:</span>
                  <span className={styles.newBalance}>৳ {(userBalance - totalAmount).toFixed(2)}</span>
                </div>
              </div>

              {selectedItem.category === 'game-topup' && (
                <div className={styles.gameDetails}>
                  <h4>Game Information:</h4>
                  <p><strong>UID:</strong> {formData.playerUID}</p>
                  <p><strong>Username:</strong> {formData.username}</p>
                </div>
              )}

              <div className={styles.confirmationInput}>
                <label>
                  Type <strong>"yes"</strong> to confirm your purchase:
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Type yes here..."
                  className={styles.confirmationTextInput}
                />
              </div>
            </div>

            <div className={styles.popupActions}>
              <button 
                onClick={handleCancelPurchase}
                className={styles.cancelBtn}
                disabled={purchaseLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmPurchase}
                className={styles.confirmBtn}
                disabled={purchaseLoading || confirmationText.toLowerCase() !== 'yes'}
              >
                {purchaseLoading ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.checkoutHeader}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ← Back
        </button>
        <h1 className={styles.checkoutTitle}>Checkout</h1>
        <p className={styles.checkoutSubtitle}>Complete your purchase</p>
        
        {/* User Info and Balance */}
        <div className={styles.userBalanceHeader}>
          <div className={styles.userInfo}>
            <span>Logged in as: {user.email}</span>
          </div>
          <div className={styles.headerBalance}>
            <Wallet size={16} />
            <span>
              {balanceLoading ? 'Loading...' : `Meta Balance: ৳ ${userBalance.toFixed(2)}`}
            </span>
          </div>
        </div>
        
        <div className={`${styles.categoryBadge} ${styles[selectedItem.category]}`}>
          {selectedItem.category === 'subscription' && '👑 Subscription'}
          {selectedItem.category === 'game-topup' && '🎮 Game Top-up'}
          {selectedItem.category === 'special-offers' && '⭐ Special Offer'}
        </div>
      </div>

      <div className={styles.checkoutContent}>
        {/* Left Side - Product Details */}
        <div className={styles.productDetailsSection}>
          <h2 className={styles.sectionTitle}>Product Details</h2>
          <div className={styles.selectedProductCard}>
            <div className={styles.quantityControlsTop}>
              <button 
                className={styles.quantityBtn}
                onClick={() => handleQuantityChange('decrement')}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className={styles.quantityDisplay}>{quantity}</span>
              <button 
                className={styles.quantityBtn}
                onClick={() => handleQuantityChange('increment')}
              >
                <Plus size={16} />
              </button>
            </div>

            <div className={styles.productImageLarge}>
              <img 
                src={getImageUrl(selectedItem.image)} 
                alt={selectedItem.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200/667eea/ffffff?text=Product+Image';
                }}
              />
              {selectedItem.category === 'special-offers' && (
                <div className={styles.specialOfferBadge}>
                  ⭐ Special Offer
                </div>
              )}
            </div>
            
            <div className={styles.productInfoDetailed}>
              <h3 className={styles.productTitle}>{selectedItem.title}</h3>
              
              <div className={styles.priceSection}>
                <span className={styles.currentPrice}>৳ {selectedItem.price}</span>
                {selectedItem.category === 'special-offers' && selectedItem.originalPrice && (
                  <span className={styles.originalPrice}>৳ {selectedItem.originalPrice}</span>
                )}
              </div>
              
              <div className={styles.productDescription}>
                <h4>Description</h4>
                <p>{selectedItem.description || categoryConfig.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Order Form */}
        <div className={styles.orderSection}>
          <div className={styles.orderCard}>
            <h2 className={styles.sectionTitle}>{categoryConfig.formTitle}</h2>
            
            <form className={styles.purchaseForm} onSubmit={handlePurchaseClick}>
              {categoryConfig.showGameFields && (
                <>
                  <div className={styles.formGroup}>
                    <label htmlFor="playerUID">Player UID / ID *</label>
                    <input
                      type="text"
                      id="playerUID"
                      name="playerUID"
                      value={formData.playerUID}
                      onChange={handleInputChange}
                      placeholder="Enter your game UID/ID"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="username">Username *</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter your in-game username"
                      required
                    />
                  </div>
                </>
              )}

              {categoryConfig.showEmail && (
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    disabled
                  />
                  <small>This is your registered email</small>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="whatsapp">WhatsApp Number *</label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="Enter your WhatsApp number"
                  required
                />
                <small>We'll contact you for confirmation</small>
              </div>

              <div className={styles.orderSummary}>
                <h3 className={styles.summaryTitle}>Order Summary</h3>
                <div className={styles.summaryItem}>
                  <span>Product:</span>
                  <span>{selectedItem.title}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Unit Price:</span>
                  <span>৳ {selectedItem.price}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Type:</span>
                  <span>
                    {selectedItem.category === 'subscription' && 'Subscription'}
                    {selectedItem.category === 'game-topup' && 'Game Top-up'}
                    {selectedItem.category === 'special-offers' && 'Special Offer'}
                  </span>
                </div>
                
                {selectedItem.category === 'special-offers' && selectedItem.originalPrice && (
                  <div className={`${styles.summaryItem} ${styles.discount}`}>
                    <span>Discount:</span>
                    <span className={styles.discountAmount}>
                      -৳ {selectedItem.originalPrice - selectedItem.price}
                    </span>
                  </div>
                )}
                
                <div className={`${styles.summaryItem} ${styles.total}`}>
                  <span>Total Amount:</span>
                  <span>৳ {totalAmount}</span>
                </div>

                {/* User Balance from Database */}
                <div className={`${styles.summaryItem} ${styles.balanceInfo}`}>
                  <span>Your Meta Balance:</span>
                  <span className={`${styles.balanceAmount} ${hasSufficientBalance ? styles.sufficient : styles.insufficient}`}>
                    {balanceLoading ? 'Loading...' : `৳ ${userBalance.toFixed(2)}`}
                  </span>
                </div>

                {hasSufficientBalance && !balanceLoading && (
                  <div className={`${styles.summaryItem} ${styles.remainingBalance}`}>
                    <span>Remaining Balance:</span>
                    <span>৳ {(userBalance - totalAmount).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className={styles.paymentButtonsSection}>
                <button 
                  type="submit"
                  className={`${styles.paymentBtn} ${styles.meta} ${hasSufficientBalance && !balanceLoading ? '' : styles.disabled}`}
                  disabled={!hasSufficientBalance || balanceLoading}
                >
                  <Wallet size={18} />
                  <div className={styles.metaPayContent}>
                    <span>Pay with Meta - ৳ {totalAmount}</span>
                    <span className={styles.metaBalance}>
                      {balanceLoading ? 'Loading balance...' : `Available: ৳ ${userBalance.toFixed(2)}`}
                    </span>
                  </div>
                </button>

                {!hasSufficientBalance && !balanceLoading && (
                  <div className={styles.insufficientBalanceMessage}>
                    <p>❌ Insufficient Meta Balance</p>
                    <button 
                      type="button"
                      className={styles.addBalanceBtn}
                      onClick={() => navigate('/profile/dashboard')}
                    >
                      Add Balance to Your Account
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.securityNotice}>
                <p>🔒 Your payment is secure and encrypted</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 