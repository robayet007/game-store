import OfferCard from "./OfferCard";
import "./Offers.css"
import { useProducts } from "../../hooks/useProducts";

const Offers = () => {
  const { products, loading, error } = useProducts('special-offers');

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1 className="text-3xl">Special Offers</h1>
        <div className="loading">
          <p>Loading special offers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h1 className="text-3xl">Special Offers</h1>
        <div className="error">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 className="text-3xl">Special Offers</h1>
      {products.length === 0 ? (
        <div className="no-offers">
          <p>No special offers available</p>
        </div>
      ) : (
        <div className="offer-cards">
          {products.map(product => (
            <OfferCard 
              key={product._id || product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Offers;