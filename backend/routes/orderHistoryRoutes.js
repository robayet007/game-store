import express from "express";
import Purchase from "../models/Purchase.js";

const router = express.Router();

// Get user's order history
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get orders with pagination
    const orders = await Purchase.find({ userId })
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('orderId productName quantity unitPrice totalAmount playerUID gameUsername category purchaseDate status');

    // Get total count for pagination
    const totalOrders = await Purchase.countDocuments({ userId });
    const totalPages = Math.ceil(totalOrders / limitNum);

    res.json({
      success: true,
      orders: orders,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalOrders: totalOrders,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get order details by order ID
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Purchase.findOne({ orderId })
      .select('orderId productName quantity unitPrice totalAmount playerUID gameUsername category purchaseDate status whatsappNumber userEmail');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get order statistics
router.get("/user/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await Purchase.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      completedOrders: 0,
      pendingOrders: 0
    };

    res.json({
      success: true,
      stats: result
    });

  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

export default router;