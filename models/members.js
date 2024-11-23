const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  postcode: {
    type: String,
    maxlength: 20, // 우편번호는 짧으므로 길이를 제한
    required: true, // 필수 항목으로 지정
  },
  basicAddress: {
    type: String,
    maxlength: 255, // 기본 주소의 최대 길이 제한
    required: true, // 필수 항목으로 지정
  },
  detailAddress: {
    type: String,
    maxlength: 255, // 나머지 주소의 최대 길이 제한
    required: false, // 필수 항목 아님
  },
});

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
    address: {
      type: addressSchema, // 주소 하위 스키마
      required: true, // 필수 항목으로 지정
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
