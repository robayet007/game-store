import React from 'react';
import { Facebook, MessageCircle, Send, HeadphonesIcon } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const paymentLogos = {
    bkash: "https://images.seeklogo.com/logo-png/27/1/bkash-logo-png_seeklogo-273684.png",
    rocket: "https://images.seeklogo.com/logo-png/31/2/dutch-bangla-rocket-logo-png_seeklogo-317692.png",
    nagad: "https://www.tbsnews.net/sites/default/files/styles/amp_metadata_content_image_min_696px_wide/public/images/2020/01/15/nagad_logo_0.jpg",
    visa: "https://www.visa.com.au/dam/VCOM/regional/ve/romania/blogs/hero-image/visa-logo-800x450.jpg",
    mastercard: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/1200px-MasterCard_Logo.svg.png"
  };

  return (
    <footer className="gaming-footer">
      <div className="footer-content">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-brand">
            <h2 className="footer-title">META GAME SHOP</h2>
            <p className="footer-tagline">Level Up Your Gaming Experience</p>
            <div className="support-number">
              <HeadphonesIcon size={16} />
              <span>Support: 01766325020</span>
            </div>
          </div>
          
          <div className="footer-social">
            <h3>Connect With Us</h3>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <div className="social-icon fb">
                  <Facebook size={20} />
                </div>
                <span>Facebook</span>
              </a>
              <a href="https://wa.me/8801766325020" target="_blank" rel="noopener noreferrer" className="social-link">
                <div className="social-icon wa">
                  <MessageCircle size={20} />
                </div>
                <span>WhatsApp</span>
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="social-link">
                <div className="social-icon tg">
                  <Send size={20} />
                </div>
                <span>Telegram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-section">
          <h3>Accepted Payment Methods</h3>
          <div className="payment-methods">
            <div className="payment-method">
              <div className="payment-logo">
                <img src={paymentLogos.bkash} alt="bKash" />
              </div>
            </div>
            <div className="payment-method">
              <div className="payment-logo">
                <img src={paymentLogos.nagad} alt="Nagad" />
              </div>
            </div>
            <div className="payment-method">
              <div className="payment-logo">
                <img src={paymentLogos.rocket} alt="Rocket" />
              </div>
            </div>
            <div className="payment-method">
              <div className="payment-logo">
                <img src={paymentLogos.visa} alt="VISA" />
              </div>
            </div>
            <div className="payment-method">
              <div className="payment-logo">
                <img src={paymentLogos.mastercard} alt="MasterCard" />
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <div className="copyright">
            &copy; {currentYear} <span className="brand-name">Meta Game Shop</span>. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;