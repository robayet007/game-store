import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";


import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";


dotenv.config();

console.log("mongod uri" , process.env.MONGO_URI)
const app = express();
const PORT = process.env.PORT || 5000;


// middlewares
app.use(cors());
app.use(express.json()); // parse JSON bodies


// static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// routes
app.use('/api/products', productRoutes);


// healthcheck
app.get('/', (req, res) => res.send('API is running'));


// connect db and start
connectDB().then(() => {
app.listen(PORT, () => {
console.log(`🎯 Server running on port ${PORT}`);
console.log(`📱 API URL: http://localhost:${PORT}`);
});
});
