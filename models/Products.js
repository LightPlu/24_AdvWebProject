const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registeredMemberId: { type: String, required: true },
  image: { type: String }, // 이미지 경로 또는 URL
  startPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true }, // 현재 경매 가격 필드 추가
  description: { type: String },
  category: { type: String, required: true },
  status: { type: String, enum: ["new", "used"], required: true },
  endTime: { type: Date, required: true },
  likes: { type: Number, default: 0 }, // 찜 수 필드 추가
  likedBy: [{ type: String }], // 찜한 사용자 ID 리스트
  bids: [
    {
      userId: { type: String, required: true },
      bidAmount: { type: Number, required: true },
      bidTime: { type: Date, default: Date.now },
    },
  ], // 입찰 기록 저장
});

module.exports = mongoose.model("Product", ProductSchema);
