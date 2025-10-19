import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
category: { type: String, required: true },
title: { type: String, required: true },
price: { type: Number, required: true },
description: { type: String },
imageUrl: { type: String }, // path or url to image
}, { timestamps: true });


const Product = mongoose.model("Product", productSchema);
export default Product;