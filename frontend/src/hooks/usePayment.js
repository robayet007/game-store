import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebaseConfig';
import { paymentAPI } from '../services/api';

export const usePayment = () => {
  const [user, setUser] = useState(null);
  const [userBalance, setUserBalance] = useState({
    availableBalance: 0,
    pendingBalance: 0,
    totalAdded: 0,
    totalSpent: 0
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Load user balance
  const loadUserBalance = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading user balance...', userId);
      
      const response = await paymentAPI.getUserBalance(userId);
      
      console.log('✅ User balance loaded:', response.data);
      
      if (response.data.success) {
        setUserBalance({
          availableBalance: response.data.balance.availableBalance || 0,
          pendingBalance: response.data.balance.pendingBalance || 0,
          totalAdded: response.data.balance.totalAdded || 0,
          totalSpent: response.data.balance.totalSpent || 0
        });
      } else {
        throw new Error(response.data.message || 'Failed to load balance');
      }
    } catch (err) {
      console.error('❌ Error loading user balance:', err);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Backend server is not running. Please start the backend server on port 5000.');
      } else {
        setError(err.response?.data?.message || err.message || 'Error loading balance from server');
      }
      
      // Fallback to zero balance
      setUserBalance({
        availableBalance: 0,
        pendingBalance: 0,
        totalAdded: 0,
        totalSpent: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Load payment history
  const loadPaymentHistory = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading payment history...', userId);
      
      const response = await paymentAPI.getUserPayments(userId);
      
      console.log('✅ Payment history loaded:', response.data);
      
      if (response.data.success) {
        setPaymentHistory(response.data.payments || []);
        return { success: true, payments: response.data.payments };
      } else {
        throw new Error(response.data.message || 'Failed to load payment history');
      }
    } catch (err) {
      console.error('❌ Error loading payment history:', err);
      setError(err.response?.data?.message || err.message || 'Error loading payment history');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Firebase auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log('🔥 Firebase auth state changed:', currentUser?.email);
      setUser(currentUser);
      if (currentUser) {
        loadUserBalance(currentUser.uid);
        loadPaymentHistory(currentUser.uid);
      } else {
        setLoading(false);
        // Reset states when user logs out
        setUserBalance({
          availableBalance: 0,
          pendingBalance: 0,
          totalAdded: 0,
          totalSpent: 0
        });
        setPaymentHistory([]);
      }
    });

    return () => unsubscribe();
  }, [loadUserBalance, loadPaymentHistory]);

  // ✅ Create payment
  const createPayment = async (paymentData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📤 Creating payment with data...', paymentData);
      
      const response = await paymentAPI.createPayment(paymentData);

      console.log('✅ Payment created response:', response.data);

      if (response.data.success) {
        // Refresh balance and history after successful payment
        if (user?.uid) {
          await loadUserBalance(user.uid);
          await loadPaymentHistory(user.uid);
        }
        return { 
          success: true, 
          payment: response.data.payment,
          message: response.data.message || 'Payment created successfully!' 
        };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Failed to create payment' 
        };
      }
    } catch (err) {
      console.error('❌ Error creating payment:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error creating payment in database';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get payment by ID
  const getPaymentById = async (paymentId) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Getting payment by ID...', paymentId);
      
      const response = await paymentAPI.getPaymentById(paymentId);
      
      console.log('✅ Payment details loaded:', response.data);
      
      if (response.data.success) {
        return {
          success: true,
          payment: response.data.payment
        };
      } else {
        throw new Error(response.data.message || 'Failed to get payment details');
      }
    } catch (err) {
      console.error('❌ Error getting payment:', err);
      setError(err.response?.data?.message || err.message || 'Error getting payment details');
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper functions
  const generateMathChallenge = useCallback(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const question = `${num1} + ${num2} = ?`;
    const answer = (num1 + num2).toString();
    
    return { question, answer };
  }, []);

  const validateTransactionId = useCallback((trxId) => {
    if (!trxId.trim()) return false;
    const trimmedTrx = trxId.trim().toUpperCase();
    const trxRegex = /^[A-Z][A-Z0-9]{5,}$/;
    return trxRegex.test(trimmedTrx);
  }, []);

  const validatePhoneNumber = useCallback((phone) => {
    if (!phone.trim()) return false;
    const phoneRegex = /^(?:\+88|01)?(?:\d{11}|\d{13})$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  }, []);

  // ✅ Quick amounts
  const quickAmounts = [1000, 2000, 3000, 5000, 10000];

  // ✅ Refresh all data
  const refreshAllData = useCallback(() => {
    if (user?.uid) {
      loadUserBalance(user.uid);
      loadPaymentHistory(user.uid);
    }
  }, [user?.uid, loadUserBalance, loadPaymentHistory]);

  return {
    // State
    user,
    userBalance,
    paymentHistory,
    loading,
    error,
    
    // Main functions
    createPayment,
    getPaymentById,
    refreshBalance: () => user?.uid ? loadUserBalance(user.uid) : null,
    refreshPaymentHistory: () => user?.uid ? loadPaymentHistory(user.uid) : null,
    refreshAllData,
    
    // Helper functions
    generateMathChallenge,
    validateTransactionId,
    validatePhoneNumber,
    
    // Constants
    quickAmounts,
    
    // Error handling
    clearError: () => setError(null),
    
    // Status helpers
    hasSufficientBalance: (amount) => userBalance.availableBalance >= amount,
    getTotalBalance: () => userBalance.availableBalance + userBalance.pendingBalance
  };
};