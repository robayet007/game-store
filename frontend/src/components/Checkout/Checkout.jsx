import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Minus, Plus, Wallet } from 'lucide-react';
import './Checkout.css';

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
        const response = await fetch('http://localhost:5000/api/admin/users');
        
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
          const response = await fetch(`http://localhost:5000/api/products/${id}`);
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
      // Step 1: Create purchase via API - This will automatically update balance
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

      const response = await fetch('http://localhost:5000/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData)
      });

      // Check response status
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // ✅ Update local state with new balance from server
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

        // Redirect to dashboard
        navigate('/profile/dashboard');
      } else {
        throw new Error(result.message || 'Failed to process purchase');
      }

    } catch (error) {
      console.error('❌ Error completing purchase:', error);
      
      // Specific error messages
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
    if (imgPath.startsWith('/uploads/')) return `http://localhost:5000${imgPath}`;
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
      <div className="checkout-container">
        <div className="error-message">
          <h2>Authentication Required</h2>
          <p>Please login to continue with your purchase.</p>
          <button 
            onClick={() => navigate('/login')}
            className="back-to-shop-btn"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading">
          <p>Loading product information...</p>
        </div>
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <div className="checkout-container">
        <div className="error-message">
          <h2>Product Not Found</h2>
          <p>The product you're looking for is not available.</p>
          <button 
            onClick={() => navigate('/shop')}
            className="back-to-shop-btn"
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
    <div className="checkout-container">
      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-popup">
            <div className="popup-header">
              <h3>Confirm Your Purchase</h3>
              <p>Please review your order details</p>
            </div>
            
            <div className="popup-content">
              <div className="order-details">
                <div className="detail-item">
                  <span>Product:</span>
                  <span>{selectedItem.title}</span>
                </div>
                <div className="detail-item">
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="detail-item">
                  <span>Unit Price:</span>
                  <span>৳ {selectedItem.price}</span>
                </div>
                <div className="detail-item">
                  <span>Total Amount:</span>
                  <span className="total-amount">৳ {totalAmount}</span>
                </div>
                <div className="detail-item">
                  <span>Current Balance:</span>
                  <span>৳ {userBalance.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span>Balance After Purchase:</span>
                  <span className="new-balance">৳ {(userBalance - totalAmount).toFixed(2)}</span>
                </div>
              </div>

              {selectedItem.category === 'game-topup' && (
                <div className="game-details">
                  <h4>Game Information:</h4>
                  <p><strong>UID:</strong> {formData.playerUID}</p>
                  <p><strong>Username:</strong> {formData.username}</p>
                </div>
              )}

              <div className="confirmation-input">
                <label>
                  Type <strong>"yes"</strong> to confirm your purchase:
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Type yes here..."
                  className="confirmation-text-input"
                />
              </div>
            </div>

            <div className="popup-actions">
              <button 
                onClick={handleCancelPurchase}
                className="cancel-btn"
                disabled={purchaseLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmPurchase}
                className="confirm-btn"
                disabled={purchaseLoading || confirmationText.toLowerCase() !== 'yes'}
              >
                {purchaseLoading ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="checkout-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">Complete your purchase</p>
        
        {/* User Info and Balance */}
        <div className="user-balance-header">
          <div className="user-info">
            <span>Logged in as: {user.email}</span>
          </div>
          <div className="header-balance">
            <Wallet size={16} />
            <span>
              {balanceLoading ? 'Loading...' : `Meta Balance: ৳ ${userBalance.toFixed(2)}`}
            </span>
          </div>
        </div>
        
        <div className={`category-badge ${selectedItem.category}`}>
          {selectedItem.category === 'subscription' && '👑 Subscription'}
          {selectedItem.category === 'game-topup' && '🎮 Game Top-up'}
          {selectedItem.category === 'special-offers' && '⭐ Special Offer'}
        </div>
      </div>

      <div className="checkout-content">
        {/* Left Side - Product Details */}
        <div className="product-details-section">
          <h2 className="section-title">Product Details</h2>
          <div className="selected-product-card">
            <div className="quantity-controls-top">
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange('decrement')}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="quantity-display">{quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange('increment')}
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="product-image-large">
              <img 
                src={getImageUrl(selectedItem.image)} 
                alt={selectedItem.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200/667eea/ffffff?text=Product+Image';
                }}
              />
              {selectedItem.category === 'special-offers' && (
                <div className="special-offer-badge">
                  ⭐ Special Offer
                </div>
              )}
            </div>
            
            <div className="product-info-detailed">
              <h3 className="product-title">{selectedItem.title}</h3>
              
              <div className="price-section">
                <span className="current-price">৳ {selectedItem.price}</span>
                {selectedItem.category === 'special-offers' && selectedItem.originalPrice && (
                  <span className="original-price">৳ {selectedItem.originalPrice}</span>
                )}
              </div>
              
              <div className="product-description">
                <h4>Description</h4>
                <p>{selectedItem.description || categoryConfig.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Order Form */}
        <div className="order-section">
          <div className="order-card">
            <h2 className="section-title">{categoryConfig.formTitle}</h2>
            
            <form className="purchase-form" onSubmit={handlePurchaseClick}>
              {categoryConfig.showGameFields && (
                <>
                  <div className="form-group">
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

                  <div className="form-group">
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
                <div className="form-group">
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

              <div className="form-group">
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

              <div className="order-summary">
                <h3 className="summary-title">Order Summary</h3>
                <div className="summary-item">
                  <span>Product:</span>
                  <span>{selectedItem.title}</span>
                </div>
                <div className="summary-item">
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="summary-item">
                  <span>Unit Price:</span>
                  <span>৳ {selectedItem.price}</span>
                </div>
                <div className="summary-item">
                  <span>Type:</span>
                  <span>
                    {selectedItem.category === 'subscription' && 'Subscription'}
                    {selectedItem.category === 'game-topup' && 'Game Top-up'}
                    {selectedItem.category === 'special-offers' && 'Special Offer'}
                  </span>
                </div>
                
                {selectedItem.category === 'special-offers' && selectedItem.originalPrice && (
                  <div className="summary-item discount">
                    <span>Discount:</span>
                    <span className="discount-amount">
                      -৳ {selectedItem.originalPrice - selectedItem.price}
                    </span>
                  </div>
                )}
                
                <div className="summary-item total">
                  <span>Total Amount:</span>
                  <span>৳ {totalAmount}</span>
                </div>

                {/* User Balance from Database */}
                <div className="summary-item balance-info">
                  <span>Your Meta Balance:</span>
                  <span className={`balance-amount ${hasSufficientBalance ? 'sufficient' : 'insufficient'}`}>
                    {balanceLoading ? 'Loading...' : `৳ ${userBalance.toFixed(2)}`}
                  </span>
                </div>

                {hasSufficientBalance && !balanceLoading && (
                  <div className="summary-item remaining-balance">
                    <span>Remaining Balance:</span>
                    <span>৳ {(userBalance - totalAmount).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="payment-buttons-section">
                <button 
                  type="submit"
                  className={`payment-btn meta ${hasSufficientBalance && !balanceLoading ? '' : 'disabled'}`}
                  disabled={!hasSufficientBalance || balanceLoading}
                >
                  <Wallet size={18} />
                  <div className="meta-pay-content">
                    <span>Pay with Meta - ৳ {totalAmount}</span>
                    <span className="meta-balance">
                      {balanceLoading ? 'Loading balance...' : `Available: ৳ ${userBalance.toFixed(2)}`}
                    </span>
                  </div>
                </button>

                {!hasSufficientBalance && !balanceLoading && (
                  <div className="insufficient-balance-message">
                    <p>❌ Insufficient Meta Balance</p>
                    <button 
                      type="button"
                      className="add-balance-btn"
                      onClick={() => navigate('/profile/dashboard')}
                    >
                      Add Balance to Your Account
                    </button>
                  </div>
                )}
              </div>

              <div className="security-notice">
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