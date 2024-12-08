const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  answer: { type: String, default: "" }, // 답변 필드 추가
});

module.exports = mongoose.model("Inquiry", inquirySchema);
