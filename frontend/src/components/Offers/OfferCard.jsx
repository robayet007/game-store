import "./Offers.css"
const OfferCard = () => {
  return (
    <>
      <div className="deal-card">
        <div className="deal-card-info">
          <img
            src="https://i.pinimg.com/736x/53/12/73/5312738a7102a3edb2728eea63f636de.jpg"
            alt="iTune"
          />
          <div>
            <p className="deal-card-title">iTunes Gift Card 5 USD</p>
            <p className="deal-card-des">iTunes Card (usa)</p>
          </div>
        </div>
        <hr />
        <div className="deal-card-price">
          <div className="discount-price">10 tk</div>
          <div className="card-price">৳ 650</div>
        </div>
      </div>
    </>
  );
};

export default OfferCard;
