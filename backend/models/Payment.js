import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Payment Information
  amount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    unique: true
  },
  senderNumber: {
    type: String,
    required: true,
    trim: true
  },
  userBkashNumber: {
    type: String,
    default: '01766325020'
  },
  
  // ✅ CRITICAL: User ID Field
  userId: {
    type: String,
    required: true
  },
  
  // User Information
  user: {
    uid: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    displayName: String,
    phoneNumber: String
  },
  
  // Math Challenge
  mathQuestion: String,
  mathAnswer: String,
  userMathAnswer: String,
  
  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Admin Actions
  approvedBy: String,
  approvedAt: Date,
  rejectedBy: String,
  rejectedAt: Date,
  rejectionReason: String,
  adminName: String
  
}, {
  timestamps: true // createdAt, updatedAt
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;