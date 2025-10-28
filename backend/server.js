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
import orderHistoryRoutes from "./routes/orderHistoryRoutes.js"; // ✅ NEW

// ✅ Comment out or remove the undefined routes temporarily
// import telegramAdminRoutes from './routes/telegramAdminRoutes.js';
// import secureBotRoutes from './routes/secureBotRoutes.js';

dotenv.config();

console.log("🔧 Environment Variables Check:");
console.log("MongoDB URI:", process.env.MONGO_URI ? "✅ Loaded" : "❌ Missing");
console.log("Telegram Bot Token:", process.env.TELEGRAM_BOT_TOKEN ? "✅ Loaded" : "❌ Missing");
console.log("Telegram Chat ID:", process.env.TELEGRAM_CHAT_ID ? "✅ Loaded" : "❌ Missing");

const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(cors({
    origin:"http://localhost:5173",
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
app.use('/api/orders', orderHistoryRoutes); // ✅ NEW

// ✅ Comment out the undefined routes temporarily
// app.use('/api/telegram', telegramAdminRoutes);
// app.use('/api/secure-bot', secureBotRoutes);

// healthcheck
app.get('/', (req, res) => res.send('API is running'));

// connect db and start
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🎯 Server running on port ${PORT}`);
        console.log(`📱 API URL: http://localhost:${PORT}`);
        console.log(`💰 Payment API: http://localhost:${PORT}/api/payments`);
        console.log(`👑 Admin API: http://localhost:${PORT}/api/admin`);
        console.log(`🛒 Purchase API: http://localhost:${PORT}/api/purchases`);
        console.log(`📊 Order History API: http://localhost:${PORT}/api/orders`); // ✅ NEW
        console.log(`🤖 Telegram: ${process.env.TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Not Configured'}`);
    });
});