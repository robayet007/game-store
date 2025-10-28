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

    // Generate unique order ID
    const orderId = "ORD-" + Date.now();

    // Find user balance by email
    const userBalance = await UserBalance.findOne({ email: userEmail });
    if (!userBalance) {
      return res.status(404).json({
        success: false,
        message: "User balance not found",
      });
    }

    // ✅ FIX 1: SAVE PREVIOUS BALANCE BEFORE ANY UPDATE
    const previousBalance = parseFloat(userBalance.availableBalance);
    console.log("💰 Previous Balance:", previousBalance);

    // Check user balance
    if (previousBalance < totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
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
      }, previousBalance) // ✅ PREVIOUS BALANCE PASSED HERE
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
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
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