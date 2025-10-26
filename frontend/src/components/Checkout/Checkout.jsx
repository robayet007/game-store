import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Minus, Plus, Wallet } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    playerUID: '',
    username: '',
    whatsapp: '',
    email: ''
  });
  const [quantity, setQuantity] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('bkash'); // 'bkash' or 'meta'
  const [userBalance, setUserBalance] = useState(1500); // Mock user balance

  // Location state থেকে product data নিন
  useEffect(() => {
    if (location.state?.product) {
      setSelectedItem(location.state.product);
    }
  }, [location.state]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) {
      alert('Please select a product first!');
      return;
    }

    // Handle purchase logic based on payment method
    const purchaseData = { 
      selectedItem, 
      formData,
      quantity,
      totalAmount: calculateTotal(),
      paymentMethod: selectedPayment,
      category: selectedItem.category
    };

    console.log('Purchase data:', purchaseData);
    
    if (selectedPayment === 'meta' && userBalance < calculateTotal()) {
      alert('Insufficient Meta Balance!');
      return;
    }

    alert(`Purchase completed successfully using ${selectedPayment === 'bkash' ? 'bKash' : 'Meta Pay'}!`);
    navigate('/profile/dashboard');
  };

  // Image URL handler function
  const getImageUrl = (imgPath) => {
    if (!imgPath) return 'https://via.placeholder.com/300x200/667eea/ffffff?text=Product+Image';
    if (imgPath.startsWith('http')) return imgPath;
    if (imgPath.startsWith('/uploads/')) return `http://localhost:5000${imgPath}`;
    return 'https://via.placeholder.com/300x200/667eea/ffffff?text=Product+Image';
  };

  if (!selectedItem) {
    return (
      <div className="checkout-container">
        <div className="loading">
          <p>Loading product information...</p>
        </div>
      </div>
    );
  }

  // Category based configurations
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

  const categoryConfig = getCategoryConfig(selectedItem.category);
  const totalAmount = calculateTotal();

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">Complete your purchase</p>
        
        {/* Category Badge */}
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
            {/* Quantity Controls - Top Left */}
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
              {/* Special Offer Badge */}
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
                {/* Discount for special offers */}
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
            
            <form className="purchase-form" onSubmit={handleSubmit}>
              {/* Game specific fields - only for game-topup */}
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

                  <div className="form-group">
                    {/* <label htmlFor="server">Server Region (Optional)</label>
                    <select 
                      id="server" 
                      name="server"
                      className="form-select"
                    >
                      <option value="">Select your server</option>
                      <option value="asia">Asia</option>
                      <option value="europe">Europe</option>
                      <option value="america">America</option>
                      <option value="middle-east">Middle East</option>
                    </select> */}
                  </div>
                </>
              )}

              {/* Email field - only show if category needs it */}
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
                  />
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
                
                {/* Discount display for special offers */}
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
              </div>

              {/* Payment Buttons - bKash first, then Meta Pay */}
              <div className="payment-buttons-section">
                {/* bKash Pay Button */}
                <button 
                  type="submit"
                  className={`payment-btn bkash ${selectedPayment === 'bkash' ? 'selected' : ''}`}
                  onClick={() => setSelectedPayment('bkash')}
                >
                  <span className="btn-icon">📱</span>
                  bKash Pay - ৳ {totalAmount}
                </button>

                {/* Meta Pay Button */}
                <button 
                  type="submit"
                  className={`payment-btn meta ${selectedPayment === 'meta' ? 'selected' : ''}`}
                  onClick={() => setSelectedPayment('meta')}
                  disabled={userBalance < totalAmount}
                >
                  <Wallet size={18} />
                  <div className="meta-pay-content">
                    <span>Pay with Meta - ৳ {totalAmount}</span>
                    <span className="meta-balance">Available: ৳ {userBalance.toFixed(2)}</span>
                  </div>
                </button>

                {/* Insufficient Balance Message */}
                {selectedPayment === 'meta' && userBalance < totalAmount && (
                  <div className="insufficient-balance-message">
                    ❌ Insufficient Meta Balance
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