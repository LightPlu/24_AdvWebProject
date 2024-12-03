const mongoose = require("mongoose");
require('dotenv').config();
const Product = require("../models/Products");
const scheduleAuctionEnd = require("../middlewares/auctionScheduler");

// 기존 스케줄 복구 함수
async function restoreAuctionSchedules() {
    try {
      const activeAuctions = await Product.find({ status: "active", endTime: { $gt: new Date() } });
      activeAuctions.forEach((product) => {
        scheduleAuctionEnd(product._id, product.endTime);
      });
      console.log("경매 스케줄 복구 완료.");
    } catch (error) {
      console.error("경매 스케줄 복구 중 오류:", error);
    }
  }

const dbConnect = async () => {
    try {
        const connect = await mongoose.connect(process.env.DB_CONNECT);
        console.log("DB connected");
        restoreAuctionSchedules();
    } catch (err) {
        console.log(err);
    }
};

module.exports = dbConnect;
