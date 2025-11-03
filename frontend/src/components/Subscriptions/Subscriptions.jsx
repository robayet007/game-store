import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import './Subscriptions.css';

// ✅ Base URL constant
const BASE_URL = "http://13.236.52.33:5000";

const Subscriptions = () => {
  const navigate = useNavigate();
  const { products, loading, error } = useProducts('subscription');

  // Image URL handle করার function
  const getImageUrl = (imgPath) => {
    if (!imgPath) return 'https://via.placeholder.com/100x100/667eea/ffffff?text=SUB';
    
    if (imgPath.startsWith('http')) {
      return imgPath;
    }
    
    if (imgPath.startsWith('/uploads/')) {
      return `${BASE_URL}${imgPath}`;  // ✅ BASE_URL use করা হয়েছে
    }
    
    return 'https://via.placeholder.com/100x100/667eea/ffffff?text=SUB';
  };

  // ✅ UPDATE: Handle item click - navigate to checkout page
  const handleItemClick = (product) => {
    navigate(`/checkout/${product._id || product.id}`, {
      state: {
        product: {
          id: product._id || product.id,
          title: product.title || product.name,
          image: getImageUrl(product.image || product.imageUrl),
          category: product.category || "Subscription",
          price: product.price || 0,
          description: product.description || 'Subscription service'
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="subscriptions-container">
        <div className="subscriptions-header">
          <h2 className="subscriptions-title">Gaming Subscriptions</h2>
          <p className="subscriptions-subtitle">Level up your entertainment experience</p>
        </div>
        <div className="loading">
          <p>Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscriptions-container">
        <div className="subscriptions-header">
          <h2 className="subscriptions-title">Gaming Subscriptions</h2>
          <p className="subscriptions-subtitle">Level up your entertainment experience</p>
        </div>
        <div className="error">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subscriptions-container">
      <div className="subscriptions-header">
        <h2 className="subscriptions-title">Gaming Subscriptions</h2>
        <p className="subscriptions-subtitle">Level up your entertainment experience</p>
      </div>
      
      <div className="subscriptions-grid-horizontal">
        {products.length === 0 ? (
          <div className="no-subscriptions">
            <p>No subscriptions available</p>
          </div>
        ) : (
          products.map((product) => (
            <div 
              key={product._id || product.id}
              className="subscription-card-horizontal"
              onClick={() => handleItemClick(product)}
              style={{ 
                '--card-gradient': product.gradient || 'linear-gradient(135deg, #667eea, #764ba2)' 
              }}
            >
              <div className="card-glow"></div>
              <div className="card-content-horizontal">
                <div className="card-logo-horizontal">
                  <img 
                    src={getImageUrl(product.image || product.imageUrl)} 
                    alt={product.title || product.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100/667eea/ffffff?text=SUB';
                    }}
                  />
                </div>
                <div className="card-info-horizontal">
                  <h3 className="card-title-horizontal">{product.title || product.name}</h3>
                  <p className="card-description-horizontal">
                    {product.description || 'Subscription service'}
                  </p>
                  <div className="card-price-horizontal">
                    {product.price ? `৳ ${product.price}` : '৳ 199 - ৳ 999'}
                  </div>
                </div>
                
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Subscriptions;