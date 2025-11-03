// Checkout.jsx - With Base URL
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Minus, Plus, Wallet } from 'lucide-react';
import styles from './Checkout.module.css';

// ✅ BASE_URL change করুন - Vercel proxy use করুন
const BASE_URL = ""; // Empty string for relative paths

const Checkout = ({ user }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [formData, setFormData] = useState({
    playerUID: '',
    username: '',
    whatsapp: '',
    email: ''
  });
  const [quantity, setQuantity] = useState(1);
  const [userBalance, setUserBalance] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // User authentication check
  useEffect(() => {
    if (!user || !user.email) {
      alert('Please login first!');
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Fetch user balance from API using email
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (!user?.email) return;
      
      try {
        setBalanceLoading(true);
        const response = await fetch(`/api/admin/users`);  // ✅ Vercel proxy use করুন
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.users) {
            // Find current user by email
            const currentUser = data.users.find(u => u.email === user.email);
            
            if (currentUser) {
              setUserBalance(currentUser.availableBalance || 0);
              // Auto-fill email in form
              setFormData(prev => ({
                ...prev,
                email: user.email
              }));
            } else {
              console.warn('User not found in database');
              setUserBalance(0);
            }
          }
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user balance:', error);
        alert('Error loading your balance. Please try again.');
        setUserBalance(0);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchUserBalance();
  }, [user]);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      
      // Method 1: From location state
      if (location.state?.product) {
        setSelectedItem(location.state.product);
        setLoading(false);
        return;
      }

      // Method 2: From URL parameter and API call
      if (id) {
        try {
          const response = await fetch(`/api/products/${id}`);  // ✅ Vercel proxy use করুন
          if (response.ok) {
            const productData = await response.json();
            setSelectedItem(productData);
          } else {
            throw new Error('Product not found');
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          alert('Product not found! Redirecting to shop...');
          navigate('/shop');
        }
      } else {
        alert('No product selected! Redirecting to shop...');
        navigate('/shop');
      }
      
      setLoading(false);
    };

    if (user?.email) {
      fetchProductData();
    }
  }, [id, location.state, navigate, user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuantityChange = (type) => {
    if (type === 'increment') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const calculateTotal = () => {
    if (!selectedItem) return 0;
    return selectedItem.price * quantity;
  };

  const handlePurchaseClick = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.whatsapp) {
      alert('Please enter your WhatsApp number');
      return;
    }

    if (selectedItem.category === 'game-topup' && (!formData.playerUID || !formData.username)) {
      alert('Please enter your game UID and username');
      return;
    }

    // Show confirmation popup
    setShowConfirmation(true);
    setConfirmationText('');
  };

  const handleConfirmPurchase = async () => {
    if (confirmationText.toLowerCase() !== 'yes') {
      alert('Please type "yes" to confirm your purchase');
      return;
    }

    setPurchaseLoading(true);
    const totalAmount = calculateTotal();

    try {
      const purchaseData = {
        userEmail: user.email,
        productName: selectedItem.title,
        productId: selectedItem._id || id,
        quantity: quantity,
        unitPrice: selectedItem.price,
        totalAmount: totalAmount,
        playerUID: formData.playerUID,
        gameUsername: formData.username,
        whatsappNumber: formData.whatsapp,
        category: selectedItem.category,
        paymentMethod: 'meta_balance'
      };

      console.log('🛒 Sending purchase request:', purchaseData);

      const response = await fetch(`/api/purchases`, {  // ✅ Vercel proxy use করুন
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setUserBalance(result.newBalance);
        setShowConfirmation(false);
        setConfirmationText('');
        
        alert(`🎉 Purchase Completed Successfully!

📦 Order Details:
────────────────
🆔 Order ID: ${result.orderId}
🎮 Product: ${selectedItem.title}
🔢 Quantity: ${quantity}
💰 Total Paid: ৳ ${totalAmount}
📞 Contact: ${formData.whatsapp}
💳 New Balance: ৳ ${result.newBalance}

Thank you for your purchase! 🎮`);

        navigate('/profile/dashboard');
      } else {
        throw new Error(result.message || 'Failed to process purchase');
      }

    } catch (error) {
      console.error('❌ Error completing purchase:', error);
      
      if (error.message.includes('Insufficient balance')) {
        alert('❌ Insufficient Meta Balance! Please add more balance to your account.');
      } else if (error.message.includes('User balance not found')) {
        alert('❌ User account not found! Please contact support.');
      } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        alert('❌ Network error! Please check your internet connection and try again.');
      } else {
        alert(`❌ Error: ${error.message}`);
      }
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleCancelPurchase = () => {
    setShowConfirmation(false);
    setConfirmationText('');
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return 'https://via.placeholder.com/300x200/667eea/ffffff?text=Product+Image';
    if (imgPath.startsWith('http')) return imgPath;
    if (imgPath.startsWith('/uploads/')) return `/api${imgPath}`;  // ✅ Vercel proxy use করুন
    return 'https://via.placeholder.com/300x200/667eea/ffffff?text=Product+Image';
  };

  const getCategoryConfig = (category) => {
    switch(category) {
      case 'subscription':
        return {
          formTitle: 'Subscription Information',
          buttonText: 'Subscribe Now',
          showGameFields: false,
          showEmail: true,
          description: 'Subscribe to premium service'
        };
      case 'game-topup':
        return {
          formTitle: 'Game Top-up Information', 
          buttonText: 'Purchase Now',
          showGameFields: true,
          showEmail: false,
          description: 'Game currency top-up'
        };
      case 'special-offers':
        return {
          formTitle: 'Special Offer Purchase',
          buttonText: 'Get This Deal',
          showGameFields: false,
          showEmail: true,
          description: 'Special limited time offer'
        };
      default:
        return {
          formTitle: 'Purchase Information',
          buttonText: 'Buy Now',
          showGameFields: false,
          showEmail: true,
          description: 'Product purchase'
        };
    }
  };

  // ... rest of the code remains the same
  // (কোড একই আছে, শুধু BASE_URL related changes করা হয়েছে)
};

export default Checkout;