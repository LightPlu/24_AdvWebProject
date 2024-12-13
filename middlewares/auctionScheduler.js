const schedule = require("node-schedule");
const Product = require("../models/Products"); // 상품 모델 불러오기
const Member = require("../models/members"); // 회원 모델 불러오기

// 경매 종료 처리 함수
async function processAuctionEnd(productId) {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      console.log(`상품 ID ${productId}를 찾을 수 없습니다.`);
      return;
    }

    // 입찰 내역에서 가장 높은 입찰가 확인
    if (product.bids && product.bids.length > 0) {
      const highestBid = product.bids.reduce((max, bid) => {
        return bid.bidAmount > max.bidAmount ? bid : max;
      });

      // 낙찰자 ID 업데이트
      product.winnerId = highestBid.userId;

      // Member 컬렉션에서 낙찰자의 email 가져오기
      const winner = await Member.findById(highestBid.userId);
      const winnerEmail = winner ? winner.email : "없음";

      product.winnerEmail = winnerEmail;

      // 상품 상태를 "end"로 변경
      product.status = "end";

      await product.save();

      console.log(`상품 ID ${productId}의 낙찰자가 ${highestBid.userId}로 설정되었습니다.`);
    } else {
      const winnerEmail = "없음";

      product.winnerEmail = winnerEmail;

      // 상품 상태를 "end"로 변경
      product.status = "end";

      await product.save();

      console.log(`상품 ID ${productId}에 입찰 기록이 없습니다.`);
    }
  } catch (error) {
    console.error(`경매 종료 처리 중 오류 발생:`, error);
  }
}

// 경매 종료 스케줄러 설정
async function scheduleAuctionEndings() {
  const products = await Product.find({ endTime: { $gte: new Date() } });

  products.forEach((product) => {
    const endTime = new Date(product.endTime);

    // 스케줄러 등록
    schedule.scheduleJob(endTime, () => {
      processAuctionEnd(product._id);
    });

    console.log(`상품 ID ${product._id}의 종료 시간이 스케줄러에 등록되었습니다: ${endTime}`);
  });
}

async function addProductToSchedule(savedProduct) {
  console.log(savedProduct);
  const endTime = new Date(savedProduct.endTime);

  schedule.scheduleJob(endTime, () => {
    processAuctionEnd(savedProduct._id);
  });

  console.log(`새 상품 ID ${savedProduct._id}가 스케줄러에 등록되었습니다: ${endTime}`);
}

module.exports = { scheduleAuctionEndings, addProductToSchedule};
