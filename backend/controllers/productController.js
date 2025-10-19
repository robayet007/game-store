import Product from "../models/Product.js";
import fs from "fs";

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { category, title, price, description } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; // path to serve statically
    }

    const product = new Product({ category, title, price, description, imageUrl });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { category, title, price, description } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Remove old image if new uploaded
    if (req.file && product.imageUrl) {
      const oldPath = `.${product.imageUrl}`;
      fs.unlink(oldPath, (err) => {
        if (err) console.warn("Old image remove error:", err);
      });
      product.imageUrl = `/uploads/${req.file.filename}`;
    }

    product.category = category ?? product.category;
    product.title = title ?? product.title;
    product.price = price ?? product.price;
    product.description = description ?? product.description;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // delete image file if exists
    if (product.imageUrl) {
      const imagePath = `.${product.imageUrl}`;
      fs.unlink(imagePath, (err) => {
        if (err) console.warn("Image remove error:", err);
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
