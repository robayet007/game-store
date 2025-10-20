import "./Offers.css"

const OfferCard = ({ product }) => {
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

  // Handle image URL
  const getImageUrl = (imgPath) => {
    if (!imgPath) return 'https://i.pinimg.com/736x/53/12/73/5312738a7102a3edb2728eea63f636de.jpg';
    
    if (imgPath.startsWith('http')) {
      return imgPath;
    }
    
    if (imgPath.startsWith('/uploads/')) {
      return `http://localhost:5000${imgPath}`;
    }
    
    return 'https://i.pinimg.com/736x/53/12/73/5312738a7102a3edb2728eea63f636de.jpg';
  };

  return (
    <>
      <div className="deal-card">
        <div className="deal-card-info">
          <img
            src={getImageUrl(productImage)}
            alt={productName}
            onError={(e) => {
              e.target.src = 'https://i.pinimg.com/736x/53/12/73/5312738a7102a3edb2728eea63f636de.jpg';
            }}
          />
          <div>
            <p className="deal-card-title">{productName}</p>
            <p className="deal-card-des">{productDescription}</p>
          </div>
        </div>
        <hr />
        <div className="deal-card-price">
          <div className="discount-price">৳ {discountPrice}</div>
          <div className="card-price">৳ {price}</div>
        </div>
      </div>
    </>
  );
};

export default OfferCard;
