const schedule = require("node-schedule");
const Product = require("../models/Products"); // 상품 모델 불러오기

// 경매 종료 스케줄링 함수
async function scheduleAuctionEnd(productId, endTime) {
  schedule.scheduleJob(endTime, async () => {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        console.error("상품을 찾을 수 없습니다.");
        return;
      }

      const highestBid = product.bids.sort((a, b) => b.bidAmount - a.bidAmount)[0];
      if (highestBid) {
        console.log(`경매 종료! 최종 입찰자: ${highestBid.userId}, 금액: ${highestBid.bidAmount}`);
        // 최종 입찰자에게 알림 전송 등 추가 작업
      } else {
        console.log("입찰이 없는 상품입니다.");
      }

      // 경매 상태 업데이트
      product.status = "completed";
      await product.save();
    } catch (error) {
      console.error("경매 종료 처리 중 오류:", error);
    }
  });
}

module.exports = {
  scheduleAuctionEnd,
};
