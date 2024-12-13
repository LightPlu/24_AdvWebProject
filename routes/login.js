const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // 비밀번호 암호화를 위한 bcrypt
const cookieParser = require("cookie-parser");
const { loginUser, logoutUser } = require("../controllers/loginController");
const checkLogin = require("../middlewares/checkLogin");
const Member = require("../models/members");

router.use(cookieParser());

// 로그인 라우트
router.post("/login", loginUser);

// 로그아웃 라우트
router.post("/logout", logoutUser);

// 마이페이지 라우트
router.route("/mypage").get(checkLogin, async (req, res) => {
    // 로그인 상태 검증 후 처리
    if (req.user) {
     res.status(200).json({ message: "마이 페이지 접근 허용" });
   } else {
     res.status(401).json({ message: "로그인이 필요합니다." });
   }
 });

 // 아이디(이메일) 찾기 라우터
router.post("/find-id", async (req, res) => {
  const { name, phone } = req.body;

  try {
    // 입력된 이름과 전화번호로 회원 검색
    const member = await Member.findOne({ membername: name, mobile_number: phone });
    console.log(member);

    if (!member) {
      return res.status(404).json({ message: "회원 정보를 찾을 수 없습니다." });
    }

    // 이메일 반환
    res.status(200).json({ email: member.email });
  } catch (error) {
    console.error("아이디 찾기 오류:", error);
    res.status(500).json({ message: "아이디 찾기 중 오류가 발생했습니다." });
  }
});

// 비밀번호 변경 엔드포인트
router.post("/change-password", async (req, res) => {
  const { email, phone, newPassword } = req.body;
  console.log(req.body);
  console.log(email);
  console.log(phone);
  console.log(newPassword);

  try {
    // 이메일과 전화번호로 회원 검색
    const member = await Member.findOne({ email: email, mobile_number: phone });

    if (!member) {
      return res.status(404).json({ message: "회원 정보를 찾을 수 없습니다." });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 비밀번호 업데이트
    member.password = hashedPassword;
    await member.save();

    res.status(200).json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (error) {
    console.error("비밀번호 변경 오류:", error);
    res.status(500).json({ message: "비밀번호 변경 중 오류가 발생했습니다." });
  }
});

module.exports = router;