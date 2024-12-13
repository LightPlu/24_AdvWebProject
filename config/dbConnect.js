const mongoose = require("mongoose");
require('dotenv').config();
const Product = require("../models/Products");
const {scheduleAuctionEndings} = require("../middlewares/auctionScheduler");

const dbConnect = async () => {
  try {
      const connect = await mongoose.connect(process.env.DB_CONNECT);
      console.log("DB connected");

      // 데이터베이스 연결 후 스케줄러 실행
      console.log("경매 스케줄러 초기화 시작");
      await scheduleAuctionEndings(); // 스케줄러 실행
      console.log("경매 스케줄러 초기화 완료");

  } catch (err) {
      console.error("DB 연결 중 오류 발생:", err);
  }
};

module.exports = dbConnect;
