const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Member = require("../models/members"); // Member 모델 가져오기

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

module.exports = router;
