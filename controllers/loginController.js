const asyncHandler = require("express-async-handler");
const Member = require("../models/members.js");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

const getLogin = (req, res) => {
    res.render("login"); // 템플릿 파일명에 맞게 수정
};

const checkLogin = asyncHandler(async (req, res, next) => {
    const { membername, password } = req.body;

    // 사용자 확인
    const member = await Member.findOne({ membername });
    if (!member) {
        return res.status(404).json({ message: "일치하는 사용자가 없습니다." });
    }

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
        return res.status(401).json({ message: "비밀번호가 맞지 않습니다." });
    }

    // JWT 생성 및 쿠키에 저장
    const token = jwt.sign({ id: member._id }, jwtSecret, { expiresIn: "1h" });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.redirect("/contacts"); // 리다이렉트 경로 확인

    next();
});

const getRegister = (req, res) => {
    res.render("register");
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, password, password2 } = req.body;

    // 입력값 유효성 검사
    if (!username || !password || !password2) {
        return res.status(400).json({ message: "모든 필드를 입력해야 합니다." });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "비밀번호는 최소 6자 이상이어야 합니다." });
    }
    if (password !== password2) {
        return res.status(400).json({ message: "비밀번호와 확인 비밀번호가 일치하지 않습니다." });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await Member.create({ username, password: hashedPassword });
    res.status(201).json({ message: "회원가입 성공", user });
});

module.exports = { getLogin, checkLogin, getRegister, registerUser };
