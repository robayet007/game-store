import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  playerUID: {
    type: String,
    default: ''
  },
  gameUsername: {
    type: String,
    default: ''
  },
  whatsappNumber: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  },
  category: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'meta_balance'
  }
}, {
  timestamps: true
});

// ✅ CORRECT: Export as default
export default mongoose.model('Purchase', purchaseSchema);