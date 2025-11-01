import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/payment.js";
import adminRoutes from "./routes/admin.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import orderHistoryRoutes from "./routes/orderHistoryRoutes.js";

dotenv.config();

console.log("🔧 Environment Variables Check:");
console.log("MongoDB URI:", process.env.MONGO_URI ? "✅ Loaded" : "❌ Missing");
console.log("Telegram Bot Token:", process.env.TELEGRAM_BOT_TOKEN ? "✅ Loaded" : "❌ Missing");
console.log("Telegram Chat ID:", process.env.TELEGRAM_CHAT_ID ? "✅ Loaded" : "❌ Missing");

const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(cors({
    origin:"*",
    credentials: true
}));
app.use(express.json());

// static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/orders', orderHistoryRoutes);

// healthcheck
app.get('/', (req, res) => res.send('API is running'));

// ✅ Telegram Test Endpoint
app.get('/api/telegram/test', async (req, res) => {
    try {
        // Import telegram service
        const telegramService = (await import('./services/telegramService.js')).default;
        
        // Initialize it
        telegramService.initialize();
        
        // Check configuration
        const isConfigured = !!(telegramService.botToken && telegramService.chatId);
        
        res.json({
            success: true,
            telegram: {
                configured: isConfigured,
                botToken: telegramService.botToken ? '✅ Loaded' : '❌ Missing',
                chatId: telegramService.chatId ? '✅ Loaded' : '❌ Missing',
                tokenLength: telegramService.botToken?.length || 0,
                chatIdValue: telegramService.chatId || 'Not set'
            },
            environment: {
                TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? '✅ Present in .env' : '❌ Missing in .env',
                TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ? '✅ Present in .env' : '❌ Missing in .env'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// ✅ Telegram Send Test Message Endpoint
app.post('/api/telegram/send-test', async (req, res) => {
    try {
        const telegramService = (await import('./services/telegramService.js')).default;
        const result = await telegramService.testConnection();
        
        res.json({
            success: result,
            message: result ? 'Test message sent successfully!' : 'Failed to send test message'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// connect db and start
connectDB().then(async () => {
    app.listen(PORT, async () => {
        console.log(`🎯 Server running on port ${PORT}`);
        console.log(`📱 API URL: http://localhost:${PORT}`);
        console.log(`💰 Payment API: http://localhost:${PORT}/api/payments`);
        console.log(`👑 Admin API: http://localhost:${PORT}/api/admin`);
        console.log(`🛒 Purchase API: http://localhost:${PORT}/api/purchases`);
        console.log(`📊 Order History API: http://localhost:${PORT}/api/orders`);
        
        // ✅ Telegram Configuration Test on Startup
        console.log('\n🧪 ========== TELEGRAM CONFIGURATION TEST ==========');
        try {
            const telegramService = (await import('./services/telegramService.js')).default;
            telegramService.initialize();
            
            console.log('🤖 Bot Token:', telegramService.botToken ? '✅ Loaded' : '❌ Missing');
            console.log('💬 Chat ID:', telegramService.chatId ? '✅ Loaded' : '❌ Missing');
            console.log('📏 Token Length:', telegramService.botToken?.length || 0);
            console.log('🆔 Chat ID Value:', telegramService.chatId || 'Not set');
            
            const isReady = !!(telegramService.botToken && telegramService.chatId);
            console.log('✅ Status:', isReady ? '🟢 READY TO SEND NOTIFICATIONS' : '🔴 NOT CONFIGURED');
            
            if (isReady) {
                console.log('🧪 Test endpoint: http://localhost:' + PORT + '/api/telegram/test');
                console.log('📤 Send test message: POST http://localhost:' + PORT + '/api/telegram/send-test');
            }
        } catch (error) {
            console.log('❌ Error:', error.message);
        }
        console.log('🧪 ==================================================\n');
        
        console.log(`🤖 Telegram: ${process.env.TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Not Configured'}`);
    });
});