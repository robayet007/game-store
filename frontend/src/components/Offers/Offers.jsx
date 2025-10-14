import  OfferCard  from "./OfferCard"
import "./Offers.css"

const Offers = () => {
  return (
    <>
      <div>
        <h1 className="text-3xl">Speacial Offers</h1>
        <div className="offer-cards">
        <OfferCard/>
        <OfferCard/>
        <OfferCard/>
        <OfferCard/>
        <OfferCard/>
        <OfferCard/>
        <OfferCard/>
        <OfferCard/>
      </div>
      </div>
    </>
  )
}

export default Offers