import Product from "../models/Product.js";
import fs from "fs";

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { category, title, price, description } = req.body;
    
    // Validate required fields
    if (!category || !title || !price || !description) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const product = new Product({ 
      category, 
      title, 
      price, 
      description, 
      image  // ✅ Change imageUrl to image
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    
    let filter = {};
    if (category) {
      filter.category = category;
    }
    filter.status = 'active';

    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// ✅ ADD THIS - Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const products = await Product.find({ 
      category, 
      status: 'active' 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      category,
      products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ 
      success: false,
      message: "Product not found" 
    });
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { category, title, price, description } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ 
      success: false,
      message: "Product not found" 
    });

    // Remove old image if new uploaded
    if (req.file && product.image) {
      const oldPath = `.${product.image}`;
      fs.unlink(oldPath, (err) => {
        if (err) console.warn("Old image remove error:", err);
      });
      product.image = `/uploads/${req.file.filename}`;
    }

    product.category = category ?? product.category;
    product.title = title ?? product.title;
    product.price = price ?? product.price;
    product.description = description ?? product.description;

    await product.save();
    
    res.json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ 
      success: false,
      message: "Product not found" 
    });

    // delete image file if exists
    if (product.image) {
      const imagePath = `.${product.image}`;
      fs.unlink(imagePath, (err) => {
        if (err) console.warn("Image remove error:", err);
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: "Product deleted successfully" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};