const express = require("express");
const router = express.Router();
const path = require("path");
const bcrypt = require("bcrypt");
const Member = require("../models/members"); // Product 모델 가져오기

router.post("../public/signup", async (req, res) => {
    const { membername, email, mobile_number, password, place } = req.body;
  
    try {
      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // 새로운 사용자 생성
      const newMember = new Member({
        membername,
        email,
        mobile_number,
        password: hashedPassword,
        place,
      });
  
      // 데이터베이스에 저장
      const savedMember = await newMember.save();
  
      res.status(201).json({ message: "회원가입 성공", member: savedMember });
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
      res.status(500).json({ message: "회원가입 실패", error });
    }
  });

module.exports = router;
