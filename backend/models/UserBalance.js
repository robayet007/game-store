import mongoose from 'mongoose';

const userBalanceSchema = new mongoose.Schema({
  // Firebase User ID - Main identifier
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // User Information
  email: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  
  // Balance Information
  availableBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Transaction History
  totalAdded: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true // ✅ createdAt and updatedAt automatically
});

// Update the updatedAt field before saving
userBalanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Ensure non-negative balances
  if (this.availableBalance < 0) this.availableBalance = 0;
  if (this.pendingBalance < 0) this.pendingBalance = 0;
  if (this.totalAdded < 0) this.totalAdded = 0;
  if (this.totalSpent < 0) this.totalSpent = 0;
  
  next();
});

// Static method to get or create balance
userBalanceSchema.statics.getOrCreate = async function(userId, userData = {}) {
  let balance = await this.findOne({ userId });
  
  if (!balance) {
    balance = new this({
      userId: userId,
      email: userData.email || 'unknown@email.com',
      displayName: userData.displayName || '',
      availableBalance: 0,
      pendingBalance: 0,
      totalAdded: 0,
      totalSpent: 0
    });
    await balance.save();
  }
  
  return balance;
};

const UserBalance = mongoose.model('UserBalance', userBalanceSchema);
export default UserBalance;