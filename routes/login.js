const express = require("express");
const router = express.Router();
const { loginUser, logoutUser } = require("../controllers/loginController");

// 로그인 라우트
router.post("/login", loginUser);

// 로그아웃 라우트
router.post("/logout", logoutUser)

module.exports = router;