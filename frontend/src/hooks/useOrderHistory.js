import { useState, useEffect } from 'react';

// ✅ BASE_URL change করুন - Vercel proxy use করুন
const BASE_URL = ""; // Empty string for relative paths
const API_BASE_URL = "/api"; // Direct API path for Vercel proxy

export const useOrderHistory = (userId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});

  // Fetch order history
  const fetchOrderHistory = async (page = 1, limit = 10) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_BASE_URL}/orders/user/${userId}?page=${page}&limit=${limit}`  // ✅ Vercel proxy use করা হয়েছে
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching order history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order statistics
  const fetchOrderStats = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/user/${userId}/stats`  // ✅ Vercel proxy use করা হয়েছে
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch order stats');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching order stats:', err);
    }
  };

  // Refresh both orders and stats
  const refreshOrderHistory = () => {
    fetchOrderHistory();
    fetchOrderStats();
  };

  useEffect(() => {
    if (userId) {
      refreshOrderHistory();
    }
  }, [userId]);

  return {
    orders,
    loading,
    error,
    pagination,
    stats,
    fetchOrderHistory,
    refreshOrderHistory
  };
};