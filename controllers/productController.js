const mongoose = require("mongoose");
const Product = require("../models/Products");

exports.getProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;

    // ID 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
