import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import './Subscriptions.css';

const Subscriptions = () => {
  const navigate = useNavigate();
  const { products, loading, error } = useProducts('subscription');

  // ✅ FIXED: Improved image URL handling for Vercel
  const getImageUrl = (imgPath) => {
    console.log('Image Path:', imgPath); // Debugging
    
    if (!imgPath) {
      return 'https://via.placeholder.com/200x200/667eea/ffffff?text=GAME+SUB';
    }
    
    // যদি image URL ইতিমধ্যে full URL হয়
    if (imgPath.startsWith('http')) {
      return imgPath;
    }
    
    // ✅ Vercel proxy through image load - FIXED PATH
    if (imgPath.startsWith('/uploads/')) {
      // এটি কাজ করবে: /api/uploads/filename.jpg → http://13.236.52.33:5000/uploads/filename.jpg
      return `/api${imgPath}`;
    }
    
    // ✅ যদি image path /images/ দিয়ে শুরু হয়
    if (imgPath.startsWith('/images/')) {
      return imgPath;
    }
    
    // ✅ যদি শুধু filename থাকে (without path)
    if (imgPath.includes('.')) {
      return `/api/uploads/${imgPath}`;
    }
    
    return 'https://via.placeholder.com/200x200/667eea/ffffff?text=GAME+SUB';
  };

  // ✅ Debugging: products load হলে check করুন
  React.useEffect(() => {
    if (products && products.length > 0) {
      console.log('Products with image URLs:', 
        products.map(p => ({
          title: p.title,
          originalImage: p.image,
          resolvedUrl: getImageUrl(p.image)
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
                      console.error('Image failed to load:', e.target.src);
                      e.target.src = 'https://via.placeholder.com/200x200/667eea/ffffff?text=IMAGE+ERROR';
                      e.target.style.opacity = '0.7';
                    }}
                    onLoad={(e) => {
                      console.log('Image loaded successfully:', product.title);
                    }}
                    loading="lazy"
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