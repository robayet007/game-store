import express from 'express';
import Payment from '../models/Payment.js';
import UserBalance from '../models/UserBalance.js';

const router = express.Router();

// ✅ Create new payment request
router.post('/create', async (req, res) => {
  try {
    const {
      amount,
      transactionId,
      senderNumber,
      userBkashNumber,
      user,
      mathQuestion,
      mathAnswer,
      userMathAnswer
    } = req.body;

    console.log('📥 Received payment request:', {
      amount,
      transactionId,
      senderNumber,
      userEmail: user.email,
      userId: user.uid
    });

    // Check if transaction ID already exists
    const existingPayment = await Payment.findOne({ transactionId: transactionId.toUpperCase() });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'এই ট্রানজেকশন আইডি আগেই ব্যবহার করা হয়েছে!'
      });
    }

    // Create new payment
    const newPayment = new Payment({
      amount: parseFloat(amount),
      transactionId: transactionId.toUpperCase().trim(),
      senderNumber: senderNumber.trim(),
      userBkashNumber: userBkashNumber || '01766325020',
      userId: user.uid,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber
      },
      mathQuestion,
      mathAnswer,
      userMathAnswer,
      status: 'pending'
    });

    await newPayment.save();
    console.log('✅ Payment saved to database:', newPayment._id);

    // Update user balance - PENDING BALANCE INCREASE
    const updatedBalance = await UserBalance.findOneAndUpdate(
      { userId: user.uid },
      { 
        $inc: { 
          pendingBalance: parseFloat(amount)
        },
        $set: {
          email: user.email,
          displayName: user.displayName || 'User'
        },
        $setOnInsert: {
          availableBalance: 0,
          totalAdded: 0,
          totalSpent: 0
        }
      },
      { 
        upsert: true, 
        new: true
      }
    );

    console.log('✅ Balance updated successfully:', {
      userId: user.uid,
      pendingBalance: updatedBalance.pendingBalance,
      availableBalance: updatedBalance.availableBalance
    });

    res.status(201).json({
      success: true,
      message: 'পেমেন্ট রিকোয়েস্ট সফলভাবে তৈরি হয়েছে! অ্যাডমিন ভেরিফাই করার পর ব্যালেন্স এভেইলেবল হবে।',
      payment: {
        id: newPayment._id,
        amount: newPayment.amount,
        transactionId: newPayment.transactionId,
        status: newPayment.status
      },
      balance: {
        availableBalance: updatedBalance.availableBalance,
        pendingBalance: updatedBalance.pendingBalance,
        totalAdded: updatedBalance.totalAdded,
        totalSpent: updatedBalance.totalSpent
      }
    });

  } catch (error) {
    console.error('❌ Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'পেমেন্ট তৈরি করতে সমস্যা হয়েছে! পরে আবার চেষ্টা করুন।'
    });
  }
});

// ✅ Get user balance
router.get('/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userBalance = await UserBalance.findOne({ userId: userId });

    if (!userBalance) {
      return res.json({
        success: true,
        balance: {
          availableBalance: 0,
          pendingBalance: 0,
          totalAdded: 0,
          totalSpent: 0
        }
      });
    }

    res.json({
      success: true,
      balance: {
        availableBalance: userBalance.availableBalance,
        pendingBalance: userBalance.pendingBalance,
        totalAdded: userBalance.totalAdded,
        totalSpent: userBalance.totalSpent
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user balance:', error);
    res.status(500).json({
      success: false,
      message: 'ব্যালেন্স লোড করতে সমস্যা হয়েছে!'
    });
  }
});

// ✅ Get user's payment history
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await Payment.find({ userId: userId })
      .sort({ createdAt: -1 })
      .select('amount transactionId status createdAt');

    res.json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error('❌ Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: 'পেমেন্ট হিস্টরি লোড করতে সমস্যা হয়েছে!'
    });
  }
});

// ✅ Get all pending payments (for admin)
router.get('/admin/pending', async (req, res) => {
  try {
    const pendingPayments = await Payment.find({ status: 'pending' })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      payments: pendingPayments
    });

  } catch (error) {
    console.error('❌ Error fetching pending payments:', error);
    res.status(500).json({
      success: false,
      message: 'পেন্ডিং পেমেন্ট লোড করতে সমস্যা হয়েছে!'
    });
  }
});

export default router;