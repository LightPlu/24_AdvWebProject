const asyncHandler = require("express-async-handler");
const Member = require("../models/members.js");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, redirecturl } = req.body;

    console.log("요청 데이터:", req.body);

    const member = await Member.findOne({ email });
    if (!member) {
    return res.status(401).json({ message: "일치하는 사용자가 없습니다." });
    }

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
            return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
        }

    const token = jwt.sign({ id: member._id }, process.env.JWT_SECRET, {expiresIn: "24h"});
    res.cookie("token", token);
    res.redirect(redirecturl || "/");
});

const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("token"); // 쿠키 삭제
    res.status(200).json({ message: "로그아웃 성공" });
});
    
module.exports = {loginUser, logoutUser};