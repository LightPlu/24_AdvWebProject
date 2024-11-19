const asyncHandler = require("express-async-handler");
const Member = require("../models/members.js");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");


const getLogin = (req, res) => {
    res.render("home");
};

const loginUser = asyncHandler(async(req, res) => {
    const { membername, password } = req.body;
    const member = await User.findOne({membername});
    if(!member){
        return res.json({message:' 일치하는 사용자가 없습니다.'});
    }
    const isMatch = await bcrypt.compare(password, member.password);
    if(!isMatch){
        return res.json({message: "비밀번호가 맞지 않습니다."});
    }

    const token = jwt.sign({id: member._id}, jwtSecret);
    res.cookie("token", token, {httpOnly: true});
    res.redirect("/contacts");
});

const getRegister = (req, res) => {
    res.render("register");
}

const registerUser = asyncHandler( async(req, res) => {
    const { username, password, password2} = req.body;
    if(password === password2){
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({username, password: hashedPassword});
        res.json({message:"Register successful", user});
    }else{
        res.send("Register Failed");
    }
})


module.exports = {getLogin, loginUser, getRegister, registerUser};