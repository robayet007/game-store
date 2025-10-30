import axios from 'axios';
import UserBalance from '../models/UserBalance.js';

class TelegramService {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '7827198994:AAEVflExfe-cUkD75iCeHw8YJ8qqOZz2fDc';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '5177792670';
  }

  async sendPurchaseNotification(purchaseData, previousBalance) {
    try {
      console.log('📱 Checking product for Telegram notification...');
      
      // Case-insensitive check for "Free Fire" in product title
      const productTitle = purchaseData.productName || '';
      const isFreeFireProduct = this.isFreeFireProduct(productTitle);
      
      if (!isFreeFireProduct) {
        console.log('⏭️ Skipping Telegram notification - Not a Free Fire product');
        return false;
      }

      console.log('✅ Free Fire product detected, sending notification...');
      
      // Calculate new balance
      const newBalance = previousBalance - purchaseData.totalAmount;
      
      const message = this.formatPurchaseMessage(purchaseData, previousBalance, newBalance);
      
      const response = await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML'
        },
        {
          timeout: 10000
        }
      );

      console.log('✅ Free Fire purchase notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Telegram notification failed:');
      console.error('Error:', error.response?.data || error.message);
      return false;
    }
  }

  // Case-insensitive Free Fire product detection
  isFreeFireProduct(productTitle) {
    if (!productTitle) return false;
    
    const normalizedTitle = productTitle.toLowerCase().trim();
    
    // Check multiple possible patterns
    return (
      normalizedTitle.substring(0, 9) === 'free fire' ||
      normalizedTitle.includes('free fire') ||
      normalizedTitle.startsWith('freefire') ||
      normalizedTitle.includes('freefire')
    );
  }

  formatPurchaseMessage(purchaseData, previousBalance, newBalance) {
    const { orderId, userEmail, productName, quantity, totalAmount, playerUID, gameUsername, category } = purchaseData;

    return `
🎮 <b>🛒 FREE FIRE PURCHASE CONFIRMED</b> 🎮

👤 <b>Customer:</b> ${userEmail}
🆔 <b>Order ID:</b> <code>${orderId}</code>

📦 <b>Order Details:</b>
────────────────
🎮 <b>Product:</b> ${productName}
🔢 <b>Quantity:</b> ${quantity}
💰 <b>Total Paid:</b> ৳ ${totalAmount}

${playerUID || gameUsername ? `🎯 <b>Game Information:</b>\n${playerUID ? `🆔 <b>Game UID:</b> ${playerUID}\n` : ''}${gameUsername ? `👤 <b>In-game Name:</b> ${gameUsername}` : ''}` : ''}

💳 <b>Balance Transaction:</b>
────────────────
💰 <b>Before Purchase:</b> ৳ ${previousBalance}
➖ <b>Purchase Deduction:</b> ৳ ${totalAmount}
💎 <b>Current Balance:</b> <b>৳ ${newBalance}</b>

✅ <b>Status:</b> Completed
⏰ <b>Time:</b> ${new Date().toLocaleString()}

🚀 <i>Free Fire • Auto-processed • Instant delivery</i>
    `.trim();
  }

  async testConnection() {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          chat_id: this.chatId,
          text: '🔔 <b>Free Fire Filter Test</b>\n\nOnly Free Fire products will be notified! ✅\n\nCase-insensitive check active.',
          parse_mode: 'HTML'
        }
      );
      
      console.log('✅ Free Fire filter test successful');
      return true;
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      return false;
    }
  }
}

export default new TelegramService();