import { useNavigate } from 'react-router-dom';
import "./Offers.css"

const OfferCard = ({ product }) => {
  const navigate = useNavigate();
  
  // Product data destructure
  const { 
    title, 
    name, 
    price, 
    description, 
    image, 
    imageUrl 
  } = product;

  const productName = title || name;
  const productImage = image || imageUrl;
  const productDescription = description || 'Special offer product';

  // Calculate discount price (10% less)
  const discountPrice = Math.round(price * 0.9);

  // ✅ Handle image URL - Fixed
  const getImageUrl = (imgPath) => {
    if (!imgPath) {
      return 'https://i.pinimg.com/736x/53/12/73/5312738a7102a3edb2728eea63f636de.jpg';
    }
    
    // Already full URL
    if (imgPath.startsWith('http')) {
      return imgPath;
    }
    
    // ✅ FIXED: Just return the path, vercel.json will proxy it
    if (imgPath.startsWith('/uploads/')) {
      return imgPath; // Remove /api prefix
    }
    
    // If only filename
    if (imgPath.includes('.') && !imgPath.startsWith('/')) {
      return `/uploads/${imgPath}`;
    }
    
    // Fallback
    return 'https://i.pinimg.com/736x/53/12/73/5312738a7102a3edb2728eea63f636de.jpg';
  };

  // Handle card click - navigate to checkout
  const handleCardClick = () => {
    navigate(`/checkout/${product._id || product.id}`, {
      state: {
        product: {
          id: product._id || product.id,
          title: productName,
          image: getImageUrl(productImage),
          category: 'special-offers',
          price: price,
          description: productDescription,
          originalPrice: Math.round(price * 1.1) // Show 10% discount
        }
      }
    });
  };

  // ✅ Better error handling for images
  const handleImageError = (e) => {
    console.error(`Image failed to load for: ${productName}`, e.target.src);
    e.target.src = 'https://i.pinimg.com/736x/53/12/73/5312738a7102a3edb2728eea63f636de.jpg';
    e.target.style.opacity = '0.8';
  };

  return (
    <div className="deal-card" onClick={handleCardClick}>
      <div className="deal-card-info">
        <img
          src={getImageUrl(productImage)}
          alt={productName}
          onError={handleImageError}
          loading="lazy"
          style={{ transition: 'opacity 0.3s ease' }}
        />
        <div>
          <p className="deal-card-title">{productName}</p>
          <p className="deal-card-des">{productDescription}</p>
        </div>
      </div>
      <hr />
      <div className="deal-card-price">
        {/* <div className="discount-price">৳ {discountPrice}</div> */}
        <div className="card-price">৳ {price}</div>
      </div>
    </div>
  );
};

export default OfferCard;