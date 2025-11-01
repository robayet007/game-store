import axios from 'axios';

class TelegramService {
  constructor() {
    this.botToken = null;
    this.chatId = null;
    this.initialized = false;
    this.initAttempted = false;
  }

  // ✅ Synchronous initialization
  initialize() {
    if (this.initialized || this.initAttempted) return;
    
    this.initAttempted = true;
    
    // ✅ Direct access to process.env
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    
    console.log('🔍 === TELEGRAM SERVICE INITIALIZATION ===');
    console.log('Token from env:', this.botToken ? `✅ (${this.botToken.length} chars)` : '❌ Missing');
    console.log('Chat ID from env:', this.chatId ? `✅ (${this.chatId})` : '❌ Missing');
    
    if (this.botToken && this.chatId) {
      this.initialized = true;
      console.log('✅ Telegram Service Successfully Initialized');
    } else {
      console.log('❌ Telegram Service Initialization Failed - Missing credentials');
    }
    console.log('==========================================');
  }

  async sendPurchaseNotification(purchaseData, previousBalance) {
    try {
      // ✅ Initialize every time to ensure env vars are loaded
      this.initialize();
      
      console.log('📱 === TELEGRAM DEBUG START ===');
      console.log('🔍 Current Token:', this.botToken ? '✅ Loaded' : '❌ Missing');
      console.log('🔍 Current Chat ID:', this.chatId ? '✅ Loaded' : '❌ Missing');
      console.log('🔍 Product Name:', purchaseData.productName);
      
      // ✅ Check if Telegram is configured
      if (!this.botToken || !this.chatId) {
        console.log('❌ Telegram not configured - skipping notification');
        console.log('📱 === TELEGRAM DEBUG END ===');
        return false;
      }

      // Case-insensitive check for "Free Fire" in product title
      const productTitle = purchaseData.productName || '';
      console.log('🔍 Checking Title:', productTitle);
      
      const isFreeFireProduct = this.isFreeFireProduct(productTitle);
      console.log('🎯 Is Free Fire Product:', isFreeFireProduct);
      
      if (!isFreeFireProduct) {
        console.log('⏭️ SKIPPING - Not a Free Fire product');
        console.log('📱 === TELEGRAM DEBUG END ===');
        return false;
      }

      console.log('✅ FREE FIRE DETECTED - Sending notification...');
      
      // Calculate new balance
      const newBalance = previousBalance - purchaseData.totalAmount;
      
      const message = this.formatPurchaseMessage(purchaseData, previousBalance, newBalance);
      
      console.log('📨 Sending Telegram message...');
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
      console.log('📱 === TELEGRAM DEBUG END ===');
      return true;
    } catch (error) {
      console.error('❌ Telegram notification failed:');
      console.error('Error:', error.response?.data || error.message);
      console.log('📱 === TELEGRAM DEBUG END ===');
      return false;
    }
  }

  // Case-insensitive Free Fire product detection
  isFreeFireProduct(productTitle) {
    if (!productTitle) return false;
    
    const normalizedTitle = productTitle.toLowerCase().trim();
    console.log('🔍 Normalized Title:', normalizedTitle);
    
    // ✅ Improved Free Fire detection - more patterns
    const isFreeFire = (
      normalizedTitle.includes('free fire') ||
      normalizedTitle.includes('freefire') ||
      normalizedTitle.includes('ff') || // FF shorthand
      normalizedTitle.includes('free-fire') ||
      normalizedTitle.startsWith('free fire') ||
      normalizedTitle.startsWith('freefire')
    );
    
    console.log('🎯 Free Fire Match Result:', isFreeFire);
    return isFreeFire;
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
      // ✅ Initialize before testing
      this.initialize();
      
      console.log('🧪 Testing Telegram connection...');
      console.log('🔍 Token available:', !!this.botToken);
      console.log('🔍 Chat ID available:', !!this.chatId);
      
      if (!this.botToken || !this.chatId) {
        console.log('❌ Telegram not configured');
        return false;
      }

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

// ✅ Export instance immediately, but initialize when needed
export default new TelegramService();