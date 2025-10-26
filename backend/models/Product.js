import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true,
    enum: ['subscription', 'special-offers', 'game-topup'] // validation add
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  description: { 
    type: String,
    required: true 
  },
  image: {  // ✅ Change imageUrl to image
    type: String 
  },
  stock: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  // ✅ NEW: For nested products (game packages)
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null // null means it's a main game, not a package
  },
  isGamePackage: {
    type: Boolean,
    default: false // true if this is a package under a game
  }
}, { 
  timestamps: true 
});

const Product = mongoose.model("Product", productSchema);
export default Product;