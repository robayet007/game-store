import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, XCircle, Gamepad2, Shield } from 'lucide-react';
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
        setError('🚫 No gaming account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        setError('🎯 Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('⏰ Too many attempts. Please try again later.');
      } else {
        setError('💥 Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/profile/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="forgot-password-container">
      {/* Animated Background */}
      <div className="game-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div className="forgot-password-card">
        {/* Header */}
        <div className="forgot-password-header">
          <div className="header-top">
            <button onClick={handleGoHome} className="home-btn">
              <Gamepad2 size={20} />
              Back to Game
            </button>
            <button onClick={handleBackToLogin} className="back-button">
              <ArrowLeft size={18} />
              Back to Login
            </button>
          </div>
          
          <div className="game-logo">
            <div className="logo-icon">
              <Shield className="shield-icon" />
              <Gamepad2 className="gamepad-icon" />
            </div>
            <h1 className="game-title">META GAME SHOP</h1>
          </div>

          <div className="mission-briefing">
            <h2 className="forgot-password-title">PASSWORD RECOVERY MISSION</h2>
            <p className="forgot-password-subtitle">
              Enter your commander email to receive a security reset transmission
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-mission">
            <div className="success-animation">
              <CheckCircle size={48} className="success-icon" />
              <div className="pulse-effect"></div>
            </div>
            <h3>MISSION ACCOMPLISHED!</h3>
            <p>Security transmission sent to your command center email</p>
            <div className="mission-stats">
              <div className="stat">
                <span className="stat-value">✓</span>
                <span className="stat-label">Encrypted</span>
              </div>
              <div className="stat">
                <span className="stat-value">⚡</span>
                <span className="stat-label">Instant</span>
              </div>
              <div className="stat">
                <span className="stat-value">🔒</span>
                <span className="stat-label">Secure</span>
              </div>
            </div>
            <button onClick={handleBackToLogin} className="continue-mission-btn">
              RETURN TO BASE
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="error-alert">
            <div className="alert-icon">
              <XCircle size={24} />
            </div>
            <div className="alert-content">
              <h4>MISSION FAILED</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Form - Only show if not success */}
        {!success && (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="input-field">
              <div className="field-header">
                <Mail size={18} className="field-icon" />
                <label>COMMANDER EMAIL</label>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter_your_email@command.com"
                className="game-input"
                required
                disabled={loading}
              />
              <div className="input-glow"></div>
            </div>

            <button 
              type="submit" 
              className={`mission-btn ${loading ? 'loading' : ''}`}
              disabled={loading || !email}
            >
              <span className="btn-content">
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    INITIATING TRANSMISSION...
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    SEND RECOVERY CODE
                  </>
                )}
              </span>
              <div className="btn-glow"></div>
            </button>
          </form>
        )}

        {/* Help Section */}
        {!success && (
          <div className="help-section">
            <div className="security-tip">
              <Shield size={16} />
              <span>Secure transmission protocol activated</span>
            </div>
            <div className="support-link">
              Need backup? <span onClick={handleBackToLogin}>Return to base camp</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;