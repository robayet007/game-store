import React, { useState } from 'react';
import { DollarSign, Plus, Clock, CheckCircle } from 'lucide-react';
import './AddFund.css';

const AddFund = ({ currentBalance, onBalanceUpdate }) => {
  const [addAmount, setAddAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  // Pending balance state
  const [pendingBalance, setPendingBalance] = useState(0);
  // Success message state
  const [successMessage, setSuccessMessage] = useState('');

  // Quick amount buttons
  const quickAmounts = [1000, 2000, 3000, 5000, 10000];

  // Handle balance add request
  const handleAddBalance = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(addAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setPaymentError('দয়া করে সঠিক অ্যামাউন্ট লিখুন!');
      return;
    }

    if (amount < 1000) {
      setPaymentError('ন্যূনতম ১০০০ টাকা যোগ করতে হবে!');
      return;
    }

    setPaymentLoading(true);
    setPaymentError('');
    setSuccessMessage('');

    try {
      // Generate transaction ID
      const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Add to pending balance immediately
      setPendingBalance(prev => prev + amount);
      
      // Send to backend - তোমার backend API call এখানে হবে
      await sendToBackend(amount, transactionId);
      
      // Success message show করবে
      setSuccessMessage(`৳ ${amount} পেন্ডিং ব্যালেন্সে যোগ হয়েছে! কিছুক্ষণের মধ্যে কনফার্ম হবে।`);
      
      // Reset form
      setAddAmount('');
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('পেমেন্ট শুরু করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      // Remove from pending balance if failed
      setPendingBalance(prev => prev - amount);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Backend এ data send করার function
  const sendToBackend = async (amount, transactionId) => {
    // এখানে তোমার actual backend API call হবে
    // নিচেরটা example:
    
    const paymentData = {
      amount: amount,
      transactionId: transactionId,
      userId: 'current-user-id', // তোমার user ID
      paymentMethod: 'bkash',
      status: 'pending'
    };

    // Example fetch call - তোমার API endpoint দিয়ে replace করবে
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      throw new Error('Backend error');
    }

    return await response.json();
  };

  // Handle quick amount selection
  const handleQuickAmount = (amount) => {
    setAddAmount(amount.toString());
    setPaymentError('');
    setSuccessMessage('');
  };

  return (
    <div className="add-fund-container">
      {/* Balance Cards */}
      <div className="balance-cards">
        {/* Available Balance Card */}
        <div className="balance-card available">
          <div className="balance-header">
            <DollarSign size={24} className="balance-icon" />
            <div className="balance-info">
              <h4>এভেইলেবল ব্যালেন্স</h4>
              <div className="balance-amount">৳ {currentBalance.toFixed(2)}</div>
            </div>
          </div>
          <p className="balance-note">
            এই ব্যালেন্স দিয়ে এখনই অর্ডার করতে পারবেন
          </p>
        </div>

        {/* Pending Balance Card */}
        <div className="balance-card pending">
          <div className="balance-header">
            <Clock size={24} className="balance-icon" />
            <div className="balance-info">
              <h4>পেন্ডিং ব্যালেন্স</h4>
              <div className="balance-amount">৳ {pendingBalance.toFixed(2)}</div>
            </div>
          </div>
          <p className="balance-note">
            কিছুক্ষণের মধ্যে কনফার্ম হয়ে এভেইলেবল হবে
          </p>
        </div>
      </div>

      {/* Add Balance Form */}
      <div className="add-balance-section">
        <h4>bKash এর মাধ্যমে ব্যালেন্স যোগ করুন</h4>
        
        {paymentError && (
          <div className="payment-error">
            <X size={18} />
            {paymentError}
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            <CheckCircle size={18} />
            {successMessage}
          </div>
        )}

        {/* Quick Amount Buttons */}
        <div className="quick-amount-section">
          <h5>দ্রুত নির্বাচন করুন:</h5>
          <div className="quick-amount-buttons">
            {quickAmounts.map(amount => (
              <button
                key={amount}
                type="button"
                className={`quick-amount-btn ${addAmount === amount.toString() ? 'selected' : ''}`}
                onClick={() => handleQuickAmount(amount)}
                disabled={paymentLoading}
              >
                ৳ {amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Form */}
        <form onSubmit={handleAddBalance} className="add-balance-form">
          <div className="form-group">
            <label>কাস্টম অ্যামাউন্ট</label>
            <input 
              type="number" 
              placeholder="কত টাকা যোগ করতে চান?"
              value={addAmount}
              onChange={(e) => {
                setAddAmount(e.target.value);
                setPaymentError('');
                setSuccessMessage('');
              }}
              min="1000"
              step="100"
              required
              disabled={paymentLoading}
            />
            <small>ন্যূনতম ১০০০ টাকা যোগ করতে হবে</small>
          </div>
          
          <button 
            type="submit" 
            className="add-balance-btn"
            disabled={paymentLoading || !addAmount || parseFloat(addAmount) < 1000}
          >
            {paymentLoading ? (
              <>
                <div className="spinner"></div>
                প্রসেসিং...
              </>
            ) : (
              <>
                <Plus size={18} />
                ৳ {addAmount || '0'} যোগ করুন
              </>
            )}
          </button>
        </form>

        {/* Payment Instructions */}
        <div className="payment-instructions-simple">
          <h5>পেমেন্ট নির্দেশনা:</h5>
          <ol>
            <li>উপরে অ্যামাউন্ট সিলেক্ট করে "যোগ করুন" বাটনে ক্লিক করুন</li>
            <li>অটোমেটিকভাবে পেন্ডিং ব্যালেন্সে যোগ হবে</li>
            <li>bKash: <strong>01XXXXXXXXX</strong> নম্বরে মানি সেন্ড করুন</li>
            <li>রেফারেন্স হিসেবে আপনার ইউজার আইডি দিন</li>
            <li>কিছুক্ষণের মধ্যে ব্যালেন্স কনফার্ম হবে</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AddFund;