import axios from 'axios';

async function testTelegram() {
  const botToken = '7827198994:AAEVflExfe-cUkD75iCeHw8YJ8qqOZz2fDc';
  const chatId = '5177792670';
  
  console.log('🔔 Testing Telegram Connection...');
  console.log('Bot Token:', botToken);
  console.log('Chat ID:', chatId);
  
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: '🔔 *Manual Test Message*\n\nThis is a direct test from your server!',
        parse_mode: 'Markdown'
      },
      {
        timeout: 10000
      }
    );
    
    console.log('✅ SUCCESS! Telegram test passed!');
    console.log('Response:', response.data);
    return true;
    
  } catch (error) {
    console.error('❌ Telegram test FAILED:');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error Data:', error.response.data);
      
      if (error.response.data.description) {
        console.log('Error Description:', error.response.data.description);
      }
    } else if (error.request) {
      console.log('No response received. Check internet connection.');
    } else {
      console.log('Error:', error.message);
    }
    
    return false;
  }
}

testTelegram();