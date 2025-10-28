import axios from 'axios';

const getTelegramId = async () => {
  const botToken = '7827198994:AAEVflExfe-cUkD75iCeHw8YJ8qqOZz2fDc';
  
  try {
    console.log('🔍 Checking for Telegram messages...');
    
    const response = await axios.get(
      `https://api.telegram.org/bot${botToken}/getUpdates`
    );
    
    console.log('📱 Telegram Bot Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.result && response.data.result.length > 0) {
      const latestUpdate = response.data.result[response.data.result.length - 1];
      const chatId = latestUpdate.message?.chat?.id;
      const userName = latestUpdate.message?.chat?.first_name;
      
      console.log('\n🎉 SUCCESS! Found your Telegram ID:');
      console.log('====================================');
      console.log('✅ Your Telegram User ID:', chatId);
      console.log('👤 Your Name:', userName);
      console.log('====================================');
      
      console.log('\n📝 Add this to your .env file:');
      console.log(`TELEGRAM_CHAT_ID=${chatId}`);
      
      return chatId;
    } else {
      console.log('\n❌ No messages found in bot.');
      console.log('\n📋 Please follow these steps:');
      console.log('1. 👉 Go to: https://t.me/metaGameShopBot');
      console.log('2. 💬 Send "/start" or any message to the bot');
      console.log('3. 🔄 Run this script again: node getTelegramId.js');
      console.log('4. ✅ Then you will get your User ID');
    }
  } catch (error) {
    console.error('❌ Error getting Telegram ID:');
    console.error('Error details:', error.response?.data || error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('🌐 Please check your internet connection');
    }
  }
};

// Run the function
getTelegramId();