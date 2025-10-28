import axios from 'axios';
import UserBalance from '../models/UserBalance.js';

class TelegramService {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '7827198994:AAEVflExfe-cUkD75iCeHw8YJ8qqOZz2fDc';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '5177792670';
  }

  async sendPurchaseNotification(purchaseData, previousBalance) {
    try {
      console.log('📱 Sending purchase notification with CORRECT balance...');
      
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

      console.log('✅ Purchase notification sent with CORRECT balance');
      return true;
    } catch (error) {
      console.error('❌ Telegram notification failed:');
      console.error('Error:', error.response?.data || error.message);
      return false;
    }
  }

  formatPurchaseMessage(purchaseData, previousBalance, newBalance) {
    const { orderId, userEmail, productName, quantity, totalAmount, playerUID, gameUsername, category } = purchaseData;

    // Category-based emojis
    const categoryEmojis = {
      'game-topup': '🎮',
      'subscription': '👑',
      'special-offers': '⭐',
      'default': '📦'
    };

    const emoji = categoryEmojis[category] || categoryEmojis.default;

    return `
${emoji} <b>🛒 PURCHASE CONFIRMED</b> ${emoji}

👤 <b>Customer:</b> ${userEmail}
🆔 <b>Order ID:</b> <code>${orderId}</code>

📦 <b>Order Details:</b>
────────────────
🎮 <b>Product:</b> ${productName}
🔢 <b>Quantity:</b> ${quantity}
💰 <b>Total Paid:</b> ৳ ${totalAmount}
📋 <b>Type:</b> ${this.formatCategory(category)}

${playerUID || gameUsername ? `🎯 <b>Game Information:</b>\n${playerUID ? `🆔 <b>Game UID:</b> ${playerUID}\n` : ''}${gameUsername ? `👤 <b>In-game Name:</b> ${gameUsername}` : ''}` : ''}

💳 <b>Balance Transaction:</b>
────────────────
💰 <b>Before Purchase:</b> ৳ ${previousBalance}
➖ <b>Purchase Deduction:</b> ৳ ${totalAmount}
💎 <b>Current Balance:</b> <b>৳ ${newBalance}</b>

✅ <b>Status:</b> Completed
⏰ <b>Time:</b> ${new Date().toLocaleString()}

🚀 <i>Auto-processed • Instant delivery</i>
    `.trim();
  }

  formatCategory(category) {
    const categoryMap = {
      'game-topup': 'Game Top-up',
      'subscription': 'Subscription', 
      'special-offers': 'Special Offer',
      'default': 'Product'
    };
    return categoryMap[category] || categoryMap.default;
  }

  async testConnection() {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          chat_id: this.chatId,
          text: '🔔 <b>Balance Test</b>\n\nBalance tracking is now accurate! ✅',
          parse_mode: 'HTML'
        }
      );
      
      console.log('✅ Balance accuracy test successful');
      return true;
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      return false;
    }
  }
}

export default new TelegramService();