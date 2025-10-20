import React from 'react';
import './CategoryProduct.css';

const CategoryProduct = ({ category, products, onEditProduct, onDeleteProduct }) => {
  const categoryNames = {
    'subscription': '👑 Subscription Products',
    'special-offers': '⭐ Special Offers', 
    'game-topup': '🎮 Game Shop Products'
  };

  const truncateDescription = (description, maxLength = 120) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  const formatCategory = (cat) => {
    return cat.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // ✅ FIX: Correct image URL function
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product.jpg';
    
    // যদি imagePath already full URL হয়
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // যদি imagePath relative path হয় (/uploads/filename.jpg)
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    // অন্য কোন case-এ default image
    return '/default-product.jpg';
  };

  return (
    <div className="category-view">
      <div className="category-header">
        <h1>{categoryNames[category] || formatCategory(category)}</h1>
        <p>Total {products.length} products found</p>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <h3>No products found in this category</h3>
          <p>Add some products to see them here</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div 
              key={product._id || product.id}
              className="product-card"
            >
              {/* Product Image - FIXED */}
              <div className="product-image">
                <img
                  src={getImageUrl(product.image || product.imageUrl)}
                  alt={product.title || product.name}
                  onError={(e) => {
                    console.log('❌ Image failed to load:', product.image || product.imageUrl);
                    e.target.src = '/default-product.jpg';
                  }}
                />
                <div className="product-badge">
                  {formatCategory(product.category)}
                </div>
              </div>
              
              {/* Product Info */}
              <div className="product-info">
                <div>
                  <h3 className="product-name" title={product.title || product.name}>
                    {product.title || product.name}
                  </h3>
                  <p className="product-description" title={product.description}>
                    {truncateDescription(product.description)}
                  </p>
                </div>

                <div className="product-details">
                  <div className="product-price">৳{product.price}</div>
                  {/* <div className="product-stock">Stock: {product.stock || 100}</div> */}
                </div>
              </div>

              {/* Product Actions */}
              <div className="product-actions">
                <button
                  onClick={() => onEditProduct(product)}
                  className="edit-btn"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${product.title || product.name}"?`)) {
                      onDeleteProduct(product._id || product.id);
                    }
                  }}
                  className="delete-btn"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryProduct;
