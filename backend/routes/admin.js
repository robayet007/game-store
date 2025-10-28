import express from 'express';
import Payment from '../models/Payment.js';
import UserBalance from '../models/UserBalance.js';

const router = express.Router();

// ✅ APPROVE PAYMENT - WORKING FIXED
router.put('/approve-payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { adminId, adminName } = req.body;

    console.log('🔄 APPROVING PAYMENT:', paymentId);

    // 1. Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found!'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed!'
      });
    }

    // 2. Find user balance
    const userBalance = await UserBalance.findOne({ userId: payment.userId });
    if (!userBalance) {
      return res.status(404).json({
        success: false,
        message: 'User balance not found!'
      });
    }

    console.log('📊 BEFORE APPROVAL:', {
      available: userBalance.availableBalance,
      pending: userBalance.pendingBalance,
      amount: payment.amount
    });

    // 3. UPDATE BALANCES - CORRECT CALCULATION
    const amount = parseFloat(payment.amount);
    
    // Decrease pending balance
    userBalance.pendingBalance = parseFloat(userBalance.pendingBalance) - amount;
    // Increase available balance  
    userBalance.availableBalance = parseFloat(userBalance.availableBalance) + amount;
    // Increase total added
    userBalance.totalAdded = parseFloat(userBalance.totalAdded) + amount;
    
    await userBalance.save();

    // 4. Update payment status
    payment.status = 'approved';
    payment.approvedBy = adminId;
    payment.adminName = adminName;
    payment.approvedAt = new Date();
    await payment.save();

    console.log('✅ AFTER APPROVAL:', {
      available: userBalance.availableBalance,
      pending: userBalance.pendingBalance
    });

    res.json({
      success: true,
      message: 'Payment approved successfully!',
      payment: payment,
      balance: {
        availableBalance: userBalance.availableBalance,
        pendingBalance: userBalance.pendingBalance
      }
    });

  } catch (error) {
    console.error('❌ APPROVAL ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Approval failed: ' + error.message
    });
  }
});

// ✅ REJECT PAYMENT - WORKING FIXED
router.put('/reject-payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { adminId, adminName, reason } = req.body;

    console.log('🔄 REJECTING PAYMENT:', paymentId);

    // 1. Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found!'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed!'
      });
    }

    // 2. Find user balance
    const userBalance = await UserBalance.findOne({ userId: payment.userId });
    if (userBalance) {
      console.log('📊 BEFORE REJECTION:', {
        pending: userBalance.pendingBalance,
        amount: payment.amount
      });

      // Decrease pending balance only
      const amount = parseFloat(payment.amount);
      userBalance.pendingBalance = Math.max(0, parseFloat(userBalance.pendingBalance) - amount);
      
      await userBalance.save();

      console.log('✅ AFTER REJECTION:', {
        pending: userBalance.pendingBalance
      });
    }

    // 3. Update payment status
    payment.status = 'rejected';
    payment.rejectedBy = adminId;
    payment.adminName = adminName;
    payment.rejectionReason = reason || 'Transaction verification failed';
    payment.rejectedAt = new Date();
    await payment.save();

    res.json({
      success: true,
      message: 'Payment rejected successfully!',
      payment: payment
    });

  } catch (error) {
    console.error('❌ REJECTION ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Rejection failed: ' + error.message
    });
  }
});

// ✅ GET ALL USERS
router.get('/users', async (req, res) => {
  try {
    const users = await UserBalance.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      users: users
    });

  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Users load failed!'
    });
  }
});

export default router;