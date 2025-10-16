import React, { useState } from 'react';
import './Checkout.css';

const Checkout = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    playerUID: '',
    username: '',
    whatsapp: ''
  });

  // Sample product data
  const products = [
    {
      id: 1,
      title: "Diamond Package",
      category: "Currency",
      price: 9.99,
      originalPrice: 12.99,
      discount: 23,
      image: "https://via.placeholder.com/80",
      stock: "in-stock",
      description: "Get 1000 diamonds for your in-game purchases. Instant delivery after purchase.",
      features: ["Instant Delivery", "Safe & Secure", "24/7 Support"]
    },
    {
      id: 2,
      title: "Premium Battle Pass",
      category: "Season Pass",
      price: 14.99,
      originalPrice: 19.99,
      discount: 25,
      image: "https://via.placeholder.com/80",
      stock: "in-stock",
      description: "Unlock exclusive skins, emotes, and rewards with this season's battle pass.",
      features: ["Exclusive Skins", "Premium Rewards", "Season Access"]
    },
    {
      id: 3,
      title: "Legendary Skin Bundle",
      category: "Cosmetic",
      price: 24.99,
      originalPrice: 34.99,
      discount: 29,
      image: "https://via.placeholder.com/80",
      stock: "low-stock",
      description: "Complete set of legendary skins for your favorite characters.",
      features: ["5 Legendary Skins", "Unique Effects", "Limited Time"]
    },
    {
      id: 4,
      title: "Starter Pack",
      category: "Bundle",
      price: 4.99,
      originalPrice: 7.99,
      discount: 38,
      image: "https://via.placeholder.com/80",
      stock: "in-stock",
      description: "Perfect for new players. Includes various items to get you started.",
      features: ["Beginner Friendly", "Great Value", "Multiple Items"]
    },
    {
      id: 5,
      title: "Weapon Package",
      category: "Equipment",
      price: 19.99,
      originalPrice: 29.99,
      discount: 33,
      image: "https://via.placeholder.com/80",
      stock: "out-of-stock",
      description: "Powerful weapons and equipment to dominate the battlefield.",
      features: ["Rare Weapons", "Power Boost", "Competitive Edge"]
    }
  ];

  const handleItemSelect = (product) => {
    setSelectedItem(product);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) {
      alert('Please select a product first!');
      return;
    }
    // Handle purchase logic here
    console.log('Purchase data:', { selectedItem, formData });
    alert('Purchase completed successfully!');
  };

  const getStockText = (stockStatus) => {
    switch (stockStatus) {
      case 'in-stock': return 'In Stock';
      case 'low-stock': return 'Low Stock';
      case 'out-of-stock': return 'Out of Stock';
      default: return 'Available';
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">Select your product and complete purchase</p>
      </div>

      <div className="checkout-content">
        {/* Left Side - Products List */}
        <div className="products-section">
          <h2 className="section-title">Available Products</h2>
          <div className="products-grid">
            {products.map((product) => (
              <div
                key={product.id}
                className={`product-card ${selectedItem?.id === product.id ? 'selected' : ''} ${product.stock === 'out-of-stock' ? 'out-of-stock' : ''}`}
                onClick={() => product.stock !== 'out-of-stock' && handleItemSelect(product)}
              >
                <div className="product-image">
                  <img src={product.image} alt={product.title} />
                  {product.discount > 0 && (
                    <span className="discount-badge">-{product.discount}%</span>
                  )}
                </div>
                
                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  <span className="product-category">{product.category}</span>
                  
                  <div className="price-section">
                    <span className="current-price">${product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="original-price">${product.originalPrice}</span>
                    )}
                  </div>
                  
                  <div className={`stock-status ${product.stock}`}>
                    {getStockText(product.stock)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Order Summary */}
        <div className="order-section">
          <div className="order-card">
            <h2 className="section-title">Order Summary</h2>
            
            {selectedItem ? (
              <div className="selected-product">
                <div className="selected-product-header">
                  <img src={selectedItem.image} alt={selectedItem.title} />
                  <div className="selected-product-info">
                    <h3>{selectedItem.title}</h3>
                    <div className="selected-price">${selectedItem.price}</div>
                  </div>
                </div>

                <div className="product-description">
                  <h4>Description</h4>
                  <p>{selectedItem.description}</p>
                  <div className="features">
                    {selectedItem.features.map((feature, index) => (
                      <span key={index}>{feature}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-product-selected">
                <p>Please select a product from the list</p>
              </div>
            )}

            <form className="purchase-form" onSubmit={handleSubmit}>
              <h3 className="form-title">Purchase Information</h3>
              
              <div className="form-group">
                <label htmlFor="playerUID">Player UID / ID</label>
                <input
                  type="text"
                  id="playerUID"
                  name="playerUID"
                  value={formData.playerUID}
                  onChange={handleInputChange}
                  placeholder="Enter your game UID"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your game username"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="whatsapp">WhatsApp Number</label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="Enter your WhatsApp number"
                  required
                />
                <small>We'll contact you for delivery confirmation</small>
              </div>

              {selectedItem && (
                <div className="order-total">
                  <div className="total-line">
                    <span>Product Price:</span>
                    <span>${selectedItem.price}</span>
                  </div>
                  <div className="total-line">
                    <span>Discount:</span>
                    <span className="discount">-${(selectedItem.originalPrice - selectedItem.price).toFixed(2)}</span>
                  </div>
                  <div className="total-line final">
                    <span>Total Amount:</span>
                    <span>${selectedItem.price}</span>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className={`buy-now-btn ${!selectedItem ? 'disabled' : ''}`}
                disabled={!selectedItem}
              >
                {selectedItem ? `Buy Now - $${selectedItem.price}` : 'Select a Product'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;