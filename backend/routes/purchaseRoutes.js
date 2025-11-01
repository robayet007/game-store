import express from "express";
import Purchase from "../models/Purchase.js";
import UserBalance from "../models/UserBalance.js";
import telegramService from "../services/telegramService.js";

const router = express.Router();

// Create new purchase
router.post("/", async (req, res) => {
  try {
    const {
      userEmail,
      productName,
      productId,
      quantity,
      unitPrice,
      totalAmount,
      playerUID,
      gameUsername,
      whatsappNumber,
      category,
      paymentMethod,
    } = req.body;

    console.log("🛒 Processing purchase for:", userEmail);

    // ✅ VALIDATION: Check if userEmail is provided
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required"
      });
    }

    // Generate unique order ID
    const orderId = "ORD-" + Date.now();

    // ✅ FIX: Use getOrCreate method from your model
    let userBalance = await UserBalance.findOne({ email: userEmail });
    
    if (!userBalance) {
      console.log("💰 Creating new balance record for user:", userEmail);
      
      // ✅ FIX: Create with proper userId and email
      userBalance = new UserBalance({
        userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userEmail, // ✅ Required field
        displayName: userEmail.split('@')[0], // Default display name
        availableBalance: 1000, // ✅ Default balance
        pendingBalance: 0,
        totalAdded: 1000,
        totalSpent: 0
      });
      
      await userBalance.save();
      console.log("✅ New user balance created for:", userEmail);
    }

    // ✅ FIX 1: SAVE PREVIOUS BALANCE BEFORE ANY UPDATE
    const previousBalance = parseFloat(userBalance.availableBalance);
    console.log("💰 Previous Balance:", previousBalance);

    // Check user balance
    if (previousBalance < totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ৳${previousBalance}, Required: ৳${totalAmount}`,
      });
    }

    // Create purchase record
    const purchase = new Purchase({
      orderId,
      userEmail,
      userId: userBalance.userId,
      productName,
      productId,
      quantity,
      unitPrice,
      totalAmount,
      playerUID: playerUID || "",
      gameUsername: gameUsername || "",
      whatsappNumber,
      category,
      paymentMethod: paymentMethod || "meta_balance",
      status: "completed",
      purchaseDate: new Date(),
    });

    await purchase.save();

    // ✅ FIX 2: CALCULATE NEW BALANCE CORRECTLY
    const purchaseAmount = parseFloat(totalAmount);
    const newBalance = previousBalance - purchaseAmount;
    
    // Update user balance with correct calculation
    userBalance.availableBalance = newBalance;
    userBalance.totalSpent = parseFloat(userBalance.totalSpent || 0) + purchaseAmount;
    
    // ✅ Use the pre-save middleware to update timestamp
    await userBalance.save();

    console.log("✅ Purchase completed:", {
      orderId: purchase.orderId,
      previousBalance: previousBalance,
      purchaseAmount: purchaseAmount,
      newBalance: newBalance,
    });

    // ✅ FIX 3: PASS PREVIOUS BALANCE TO TELEGRAM SERVICE
    telegramService
      .sendPurchaseNotification({
        orderId: purchase.orderId,
        userEmail: purchase.userEmail,
        productName: purchase.productName,
        quantity: purchase.quantity,
        totalAmount: purchase.totalAmount,
        playerUID: purchase.playerUID,
        gameUsername: purchase.gameUsername,
        category: purchase.category,
      }, previousBalance)
      .then((success) => {
        if (success) {
          console.log("📱 Telegram notification with accurate balance delivered");
        } else {
          console.warn("⚠️ Telegram notification failed, but purchase completed");
        }
      });

    res.status(201).json({
      success: true,
      message: "Purchase completed successfully",
      orderId: purchase.orderId,
      purchase: purchase,
      previousBalance: previousBalance,
      newBalance: newBalance,
      telegramNotification: true,
    });
  } catch (error) {
    console.error("❌ Error creating purchase:", error);
    
    // ✅ Better error handling
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation error: " + errorMessages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
});

// ✅ Test endpoint with sample data
router.post("/test-purchase", async (req, res) => {
  try {
    const testData = {
      userEmail: "test@example.com",
      productName: "Free Fire Diamonds",
      productId: "ff_diamond_100",
      quantity: 1,
      unitPrice: 100,
      totalAmount: 100,
      playerUID: "1234567890",
      gameUsername: "TestPlayer",
      whatsappNumber: "+8801000000000",
      category: "diamonds",
      paymentMethod: "meta_balance"
    };

    console.log("🧪 Testing purchase with:", testData.userEmail);

    // Find or create user balance
    let userBalance = await UserBalance.findOne({ email: testData.userEmail });
    
    if (!userBalance) {
      userBalance = new UserBalance({
        userId: `test_user_${Date.now()}`,
        email: testData.userEmail,
        displayName: "Test User",
        availableBalance: 1000,
        pendingBalance: 0,
        totalAdded: 1000,
        totalSpent: 0
      });
      await userBalance.save();
    }

    const previousBalance = userBalance.availableBalance;
    
    // Create test purchase
    const purchase = new Purchase({
      orderId: "TEST-" + Date.now(),
      userEmail: testData.userEmail,
      userId: userBalance.userId,
      productName: testData.productName,
      productId: testData.productId,
      quantity: testData.quantity,
      unitPrice: testData.unitPrice,
      totalAmount: testData.totalAmount,
      playerUID: testData.playerUID,
      gameUsername: testData.gameUsername,
      whatsappNumber: testData.whatsappNumber,
      category: testData.category,
      paymentMethod: testData.paymentMethod,
      status: "completed",
      purchaseDate: new Date(),
    });

    await purchase.save();

    // Update balance
    userBalance.availableBalance = previousBalance - testData.totalAmount;
    userBalance.totalSpent += testData.totalAmount;
    await userBalance.save();

    // Send Telegram notification
    const telegramSuccess = await telegramService.sendPurchaseNotification(
      {
        orderId: purchase.orderId,
        userEmail: purchase.userEmail,
        productName: purchase.productName,
        quantity: purchase.quantity,
        totalAmount: purchase.totalAmount,
        playerUID: purchase.playerUID,
        gameUsername: purchase.gameUsername,
        category: purchase.category,
      },
      previousBalance
    );

    res.json({
      success: true,
      message: "Test purchase completed successfully",
      orderId: purchase.orderId,
      previousBalance: previousBalance,
      newBalance: userBalance.availableBalance,
      telegramNotification: telegramSuccess,
      testData: testData
    });

  } catch (error) {
    console.error("❌ Test purchase error:", error);
    res.status(500).json({
      success: false,
      message: "Test purchase failed: " + error.message,
    });
  }
});

// ✅ FIXED: Test Telegram connection - GET method
router.get("/test-telegram", async (req, res) => {
  try {
    console.log("🔔 Testing Telegram connection...");

    const success = await telegramService.testConnection();

    if (success) {
      res.json({
        success: true,
        message: "✅ Telegram test message sent successfully! Check your Telegram.",
        telegramWorking: true,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "❌ Telegram test failed. Check your bot token and chat ID.",
        telegramWorking: false,
      });
    }
  } catch (error) {
    console.error("❌ Telegram test error:", error);
    res.status(500).json({
      success: false,
      message: "Telegram test error: " + error.message,
    });
  }
});

// Get all purchases
router.get("/", async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      purchases: purchases,
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get purchases by user email
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const purchases = await Purchase.find({ userEmail: email }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      purchases: purchases,
    });
  } catch (error) {
    console.error("Error fetching user purchases:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;