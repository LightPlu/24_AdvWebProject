const mongoose = require("mongoose");

// 회원 스키마 정의
const memberSchema = new mongoose.Schema(
  {
    membername: {
      type: String,
      required: true, // 필수 항목
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true, // 고유 값
      match: [/.+\@.+\..+/, "유효하지 않은 이메일 형식입니다."], // 이메일 유효성 검사
    },
    mobile_number: {
      type: String,
      maxlength: 15,
    },
    password: {
      type: String,
      required: true,
    },
    place: {
      type: String,
      maxlength: 255,
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt 및 updatedAt 자동 생성
  }
);

// 회원 모델 생성
const Member = mongoose.model("Member", memberSchema);

module.exports = Member;
