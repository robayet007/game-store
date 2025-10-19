// Simple API Key authentication for admin
export const authenticateAdmin = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // In production, use environment variable
  const validApiKey = process.env.ADMIN_API_KEY || 'metagameshop-admin-2024';
  
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  
  next();
};

// CORS middleware
export const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
};