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
  }
}, { 
  timestamps: true 
});

const Product = mongoose.model("Product", productSchema);
export default Product;