import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Clock, CheckCircle, X } from 'lucide-react';
import { auth } from '../../../firebaseConfig';
import './AddFund.css';

const AddFund = ({ 
  currentBalance, 
  pendingBalance, 
  userBkashNumber, 
  onAddPendingBalance,
  onBalanceUpdate
}) => {
  const [addAmount, setAddAmount] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);

  // Math challenge state
  const [showMathChallenge, setShowMathChallenge] = useState(false);
  const [mathQuestion, setMathQuestion] = useState('');
  const [mathAnswer, setMathAnswer] = useState('');
  const [userMathAnswer, setUserMathAnswer] = useState('');

  // Quick amount buttons
  const quickAmounts = [1000, 2000, 3000, 5000, 10000];

  // Get current user from Firebase
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log('🔥 Firebase User in AddFund:', currentUser.email);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Generate random math question
  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const question = `${num1} + ${num2} = ?`;
    const answer = (num1 + num2).toString();
    
    setMathQuestion(question);
    setMathAnswer(answer);
    setUserMathAnswer('');
    return { question, answer };
  };

  // Validate phone number
  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) return false;
    const phoneRegex = /^(?:\+88|01)?(?:\d{11}|\d{13})$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  // ✅ FIXED: Use Vercel proxy for all environments
  const getApiBaseUrl = () => {
    return '/api'; // ✅ Vercel proxy use korbe
  };

  // Handle balance add request
  const handleAddBalance = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      setPaymentError('দয়া করে প্রথমে লগইন করুন!');
      return;
    }

    const amount = parseFloat(addAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setPaymentError('দয়া করে সঠিক অ্যামাউন্ট লিখুন!');
      return;
    }

    if (amount < 10) { // Minimum amount 10 taka
      setPaymentError('ন্যূনতম ১০ টাকা যোগ করতে হবে!');
      return;
    }

    if (!senderNumber.trim()) {
      setPaymentError('দয়া করে আপনার bKash নম্বর দিন!');
      return;
    }

    // Validate phone number
    if (!validatePhoneNumber(senderNumber)) {
      setPaymentError('bKash নম্বর সঠিক নয়! 11 ডিজিটের নম্বর দিন (যেমন: 01712345678)');
      return;
    }

    // Generate math challenge
    generateMathQuestion();
    setShowMathChallenge(true);
  };

  // ✅ FIXED: Handle math challenge submission with Vercel proxy
  const handleMathChallengeSubmit = async () => {
    if (!userMathAnswer.trim()) {
      setPaymentError('দয়া করে গাণিতিক প্রশ্নের উত্তর দিন!');
      return;
    }

    if (userMathAnswer !== mathAnswer) {
      setPaymentError(`গাণিতিক প্রশ্নের উত্তর ভুল হয়েছে! সঠিক উত্তর: ${mathAnswer}`);
      setUserMathAnswer('');
      return;
    }

    setPaymentLoading(true);
    setPaymentError('');
    setSuccessMessage('');

    try {
      const amount = parseFloat(addAmount);
      const API_BASE_URL = getApiBaseUrl();
      
      // Prepare payment data with user info (TRX ID removed)
      const paymentData = {
        amount: amount,
        senderNumber: senderNumber.trim(),
        userBkashNumber: userBkashNumber || '01766325020',
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber
        },
        mathQuestion: mathQuestion,
        mathAnswer: mathAnswer,
        userMathAnswer: userMathAnswer,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      console.log('💰 Payment Request Details:', paymentData);
      console.log('🌐 API URL:', `${API_BASE_URL}/payments/create`);

      // ✅ FIXED: Use Vercel proxy API call
      const response = await fetch(`${API_BASE_URL}/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      // ✅ Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Backend Response:', result);

      if (!result.success) {
        throw new Error(result.message || 'পেমেন্ট সাবমিট করতে সমস্যা হয়েছে');
      }

      // ✅ Parent component-কে inform করো payment successful হয়েছে
      if (onAddPendingBalance) {
        onAddPendingBalance(paymentData);
      }

      // ✅ Balance update করো
      if (onBalanceUpdate) {
        onBalanceUpdate({
          pendingBalance: (pendingBalance || 0) + amount
        });
      }

      // Success message
      setSuccessMessage(`৳ ${amount.toLocaleString()} পেন্ডিং ব্যালেন্সে যোগ হয়েছে! অ্যাডমিন ভেরিফাই করার পর এভেইলেবল হবে।`);
      
      // Reset form
      setAddAmount('');
      setSenderNumber('');
      setUserMathAnswer('');
      setShowMathChallenge(false);
      
    } catch (error) {
      console.error('❌ Payment error:', error);
      
      // ✅ Better error messages based on error type
      if (error.message.includes('Failed to fetch')) {
        setPaymentError('বেকেন্ড সার্ভারে কানেক্ট হতে পারছি না। দয়া করে আবার চেষ্টা করুন।');
      } else if (error.message.includes('Server error')) {
        setPaymentError('সার্ভারে সমস্যা হচ্ছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
      } else {
        setPaymentError(error.message || 'পেমেন্ট সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle quick amount selection
  const handleQuickAmount = (amount) => {
    setAddAmount(amount.toString());
    setPaymentError('');
    setSuccessMessage('');
  };

  // ✅ যদি user না থাকে, loading show করবে
  if (!user) {
    return (
      <div className="add-fund-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-fund-container">
      {/* User Info Display */}
      {user && (
        <div className="user-info-card">
          <div className="user-info">
            <strong>ইউজার:</strong> {user.email}
            {user.displayName && <span> | {user.displayName}</span>}
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="balance-cards">
        {/* Available Balance Card */}
        <div className="balance-card available">
          <div className="balance-header">
            <DollarSign size={24} className="balance-icon" />
            <div className="balance-info">
              <h4>এভেইলেবল ব্যালেন্স</h4>
              <div className="balance-amount">৳ {currentBalance?.toFixed(2) || '0.00'}</div>
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
              <div className="balance-amount">৳ {pendingBalance?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
          <p className="balance-note">
            অ্যাডমিন ভেরিফাই করার পর এভেইলেবল হবে
          </p>
        </div>
      </div>

      {/* Math Challenge Modal */}
      {showMathChallenge && (
        <div className="math-challenge-modal">
          <div className="math-challenge-content">
            <h3>সিকিউরিটি ভেরিফিকেশন</h3>
            <p>নিচের গাণিতিক প্রশ্নের উত্তর দিন:</p>
            
            <div className="math-question">
              <strong>{mathQuestion}</strong>
            </div>
            
            <div className="form-group">
              <input
                type="text"
                placeholder="উত্তর লিখুন (সংখ্যা)"
                value={userMathAnswer}
                onChange={(e) => setUserMathAnswer(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={paymentLoading}
                className="math-input"
              />
            </div>

            <div className="math-challenge-buttons">
              <button
                onClick={handleMathChallengeSubmit}
                disabled={paymentLoading || !userMathAnswer}
                className="submit-challenge-btn"
              >
                {paymentLoading ? (
                  <>
                    <div className="spinner"></div>
                    প্রসেসিং...
                  </>
                ) : (
                  'ভেরিফাই করুন'
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowMathChallenge(false);
                  setUserMathAnswer('');
                }}
                className="cancel-challenge-btn"
                disabled={paymentLoading}
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

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
              min="10"
              step="100"
              required
              disabled={paymentLoading}
              className="amount-input"
            />
            <small>ন্যূনতম ১০ টাকা যোগ করতে হবে</small>
          </div>

          <div className="form-group">
            <label>আপনার bKash নম্বর</label>
            <input 
              type="tel" 
              placeholder="আপনার bKash নম্বর (যেমন: 017xxxxxx)"
              value={senderNumber}
              onChange={(e) => {
                setSenderNumber(e.target.value);
                setPaymentError('');
                setSuccessMessage('');
              }}
              required
              disabled={paymentLoading}
              className="phone-input"
              style={{
                borderColor: senderNumber && !validatePhoneNumber(senderNumber) ? '#dc3545' : '#d1d5db',
                color: senderNumber && !validatePhoneNumber(senderNumber) ? '#dc3545' : '#1a1a1a'
              }}
            />
            <small>
              {senderNumber && !validatePhoneNumber(senderNumber) 
                ? '⚠️ bKash নম্বর সঠিক নয় (11 ডিজিটের নম্বর দিন)' 
                : 'আপনার bKash নম্বর যেখান থেকে টাকা পাঠাবেন'}
            </small>
          </div>
          
          <button 
            type="submit" 
            className="add-balance-btn"
            disabled={paymentLoading || !addAmount || !senderNumber || parseFloat(addAmount) < 10 || !validatePhoneNumber(senderNumber)}
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
        <div className="payment-instructions">
          <h5>পেমেন্ট নির্দেশনা:</h5>
          <ol>
            <li>উপরে অ্যামাউন্ট সিলেক্ট করুন</li>
            <li><strong>bKash App এ গিয়ে 01766325020 নম্বরে মানি সেন্ড করুন</strong></li>
            <li>আপনার bKash নম্বর দিন</li>
            <li>গাণিতিক প্রশ্নের উত্তর দিন (যেমন: 8 + 8 = 16)</li>
            <li>ভেরিফাই করুন - অ্যামাউন্ট পেন্ডিং ব্যালেন্সে যোগ হবে</li>
            <li>অ্যাডমিন চেক করার পর ব্যালেন্স এভেইলেবল হবে</li>
          </ol>
          
          <div className="important-note">
            <strong>মনে রাখবেন:</strong> টাকা পাঠানোর পর শুধু আপনার bKash নম্বর এবং অ্যামাউন্ট দিন। অ্যাডমিন ম্যানুয়ালি চেক করে ব্যালেন্স এড করবেন।
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFund;