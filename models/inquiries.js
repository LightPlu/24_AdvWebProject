const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // 회원 ID 참조
  inquiries: [
    {
      title: { type: String, required: true },
      message: { type: String, required: true },
      date: { type: Date, default: Date.now },
      answer: { type: String, default: "" }, // 답변 필드
    },
  ],
});

module.exports = mongoose.model("Inquiry", inquirySchema);
