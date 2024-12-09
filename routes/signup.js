const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const Member = require("../models/members"); // Member 모델 가져오기
const jwt = require("jsonwebtoken");

router.use(cookieParser());

// 1. 회원 등록 (POST /api/members/add)
router.post("/add", async (req, res) => {
  try {
    const {
      membername,
      email,
      mobile_number,
      password,
      confirm_password,
      sample6_postcode,
      sample6_address,
      sample6_detailAddress,
    } = req.body;

    // 필수 필드 확인
    if (
      !membername ||
      !email ||
      !mobile_number ||
      !password ||
      !confirm_password ||
      !sample6_postcode ||
      !sample6_address ||
      !sample6_detailAddress
    ) {
      return res.status(400).json({ message: "모든 필드를 입력해야 합니다." });
    }

    // 비밀번호와 비밀번호 확인 비교
    if (password !== confirm_password) {
      return res
        .status(400)
        .json({ message: "비밀번호와 비밀번호 확인이 일치하지 않습니다." });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10); // 10은 saltRounds (암호화 강도)

    // 새로운 회원 생성
    const newMember = new Member({
      membername,
      email,
      mobile_number,
      password: hashedPassword,
      sample6_postcode,
      sample6_address,
      sample6_detailAddress,
    });

    // MongoDB에 저장
    const savedMember = await newMember.save();

    res.status(201).json({
      message: "회원이 성공적으로 등록되었습니다.",
      member: savedMember,
    });
  } catch (err) {
    res.status(500).json({
      message: "회원 등록 중 오류.",
      error: err.message,
    });
  }
});

// 회원 정보 조회 API
router.get("/info", async (req, res) => {
  const userId = req.query.userId; // 사용자 ID를 쿼리에서 받음

  try {
    // Member 모델에서 사용자 ID로 회원 정보 조회
    const member = await Member.findById(userId).select("-password"); // 비밀번호 제외

    if (!member) {
      return res.status(404).json({ message: "회원 정보를 찾을 수 없습니다." });
    }

    res.status(200).json({member});
  } catch (error) {
    console.error("회원 정보 조회 오류:", error);
    res.status(500).json({
      message: "회원 정보를 가져오는 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

router.put("/update", async (req, res) => {
  const { userId, mobile_number, sample6_postcode, sample6_address, sample6_detailAddress } = req.body;

  try {
    // 업데이트할 필드 구성
    const updateFields = {};
    if (mobile_number) updateFields.mobile_number = mobile_number;
    if (sample6_postcode) updateFields.sample6_postcode = sample6_postcode;
    if (sample6_address) updateFields.sample6_address = sample6_address;
    if (sample6_detailAddress) updateFields.sample6_detailAddress = sample6_detailAddress;

    const updatedMember = await Member.findByIdAndUpdate(userId, updateFields, { new: true });

    if (!updatedMember) {
      return res.status(404).json({ message: "회원 정보를 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "회원 정보가 성공적으로 수정되었습니다.", member: updatedMember });
  } catch (error) {
    console.error("회원 정보 수정 중 오류:", error);
    res.status(500).json({ message: "회원 정보 수정 중 오류가 발생했습니다.", error: error.message });
  }
});

module.exports = router;
