const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String }, // 이미지 경로 또는 URL
  startPrice: { type: Number, required: true },
  description: { type: String },
  category: { type: String, required: true },
  status: { type: String, enum: ["new", "used"], required: true },
  endTime: { type: Date, required: true },
});

module.exports = mongoose.model("Product", ProductSchema);
