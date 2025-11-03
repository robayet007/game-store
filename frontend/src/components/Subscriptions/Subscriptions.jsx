import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import './Subscriptions.css';

const Subscriptions = () => {
  const navigate = useNavigate();
  const { products, loading, error } = useProducts('subscription');

  // ✅ FIXED: Better image URL handling with working fallbacks
 const getImageUrl = (imgPath) => {
  console.log('Original Image Path:', imgPath);
  
  if (!imgPath) {
    return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop';
  }
  
  // যদি already full URL হয়
  if (imgPath.startsWith('http')) {
    return imgPath;
  }
  
  // ✅ যদি /uploads/ দিয়ে শুরু হয় (Vercel এখন proxy করবে)
  if (imgPath.startsWith('/uploads/')) {
    return imgPath; // Just return as is
  }
  
  // ✅ যদি শুধু filename থাকে
  if (imgPath.includes('.') && !imgPath.startsWith('/')) {
    return `/uploads/${imgPath}`;
  }
  
  // Fallback
  return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop';
};

  // ✅ Improved error handling for images
  const handleImageError = (e, productTitle) => {
    console.error(`Image failed to load for: ${productTitle}`, e.target.src);
    
    // ✅ Use data URL as final fallback (always works)
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY3ZWVhIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkdBTUUgU1VCPC90ZXh0Pgo8L3N2Zz4=';
    e.target.style.opacity = '0.8';
    e.target.style.backgroundColor = '#667eea';
  };

  const handleImageLoad = (e, productTitle) => {
    console.log(`Image loaded successfully: ${productTitle}`);
    e.target.style.opacity = '1';
  };

  // ✅ Debugging
  React.useEffect(() => {
    if (products && products.length > 0) {
      console.log('All products with image info:', 
        products.map(p => ({
          title: p.title,
          originalImage: p.image,
          finalUrl: getImageUrl(p.image),
          hasImage: !!p.image
        }))
      );
    }
  }, [products]);

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
        <p>hi</p>
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
                    onError={(e) => handleImageError(e, product.title || product.name)}
                    onLoad={(e) => handleImageLoad(e, product.title || product.name)}
                    loading="lazy"
                    style={{
                      transition: 'opacity 0.3s ease',
                      borderRadius: '8px'
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