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
            <div key={product.id} className="product-card">

              {/* Product Image */}
              <div className="product-image">
                <img
                  src={product.image || '/default-product.jpg'}
                  alt={product.name}
                  onError={(e) => (e.target.src = '/default-product.jpg')}
                />
                <div className="product-badge">
                  {formatCategory(product.category)}
                </div>
              </div>

              {/* Product Info */}
              <div className="product-info">
                <div>
                  <h3 className="product-name" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="product-description" title={product.description}>
                    {truncateDescription(product.description)}
                  </p>
                </div>

                <div className="product-details">
                  <div className="product-price">৳{product.price}</div>
                  <div className="product-stock">Stock: {product.stock}</div>
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
                    if (window.confirm(`Delete "${product.name}"?`)) {
                      onDeleteProduct(product.id);
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
