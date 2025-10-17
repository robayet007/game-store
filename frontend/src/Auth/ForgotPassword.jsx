import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/profile/login');
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {/* Header */}
        <div className="forgot-password-header">
          <button onClick={handleBackToLogin} className="back-button">
            <ArrowLeft size={20} />
          </button>
          <div className="auth-logo">
            <img src="/store-logo.png" alt="Meta Game Shop" />
          </div>
          <h2 className="forgot-password-title">RESET YOUR PASSWORD</h2>
          <p className="forgot-password-subtitle">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <div className="success-icon">
              <CheckCircle size={32} />
            </div>
            <h3>Check Your Email!</h3>
            <p>We've sent a password reset link to your email address.</p>
            <button onClick={handleBackToLogin} className="back-to-login-btn">
              Return to Sign In
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="error-message">
            <div className="error-icon">
              <XCircle size={20} />
            </div>
            {error}
          </div>
        )}

        {/* Form - Only show if not success */}
        {!success && (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <div className="input-with-icon">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="reset-btn"
              disabled={loading || !email}
            >
              {loading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
          </form>
        )}

        {/* Help Text */}
        {!success && (
          <div className="help-text">
            <p>Remember your password? <span onClick={handleBackToLogin}>Back to Sign In</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;