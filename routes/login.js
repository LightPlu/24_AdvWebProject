const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const { loginUser, logoutUser } = require("../controllers/loginController");
const checkLogin = require("../middlewares/checkLogin");

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

module.exports = router;