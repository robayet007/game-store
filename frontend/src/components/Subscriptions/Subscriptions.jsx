import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import './Subscriptions.css';

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
      return `http://localhost:5000${imgPath}`;
    }
    
    return 'https://via.placeholder.com/100x100/667eea/ffffff?text=SUB';
  };

  const handleItemClick = (product) => {
    navigate(`/subscription/${product._id || product.id}`);
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
                <div className="card-badge">
                  <span>Gaming</span>
                </div>
              </div>
              <div className="card-overlay-horizontal">
                <span>Click to Explore</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Subscriptions;