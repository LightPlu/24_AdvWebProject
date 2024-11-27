const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const dbConnect = require("./config/dbConnect");
const http = require("http"); // HTTP 서버 생성
const { Server } = require("socket.io"); // Socket.IO 서버
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

const app = express();
const server = http.createServer(app); // HTTP 서버로 Express 앱 감싸기
const io = new Server(server); // Socket.IO 서버 초기화

dbConnect();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // CORS 설정
app.use(fileUpload()); // 파일 업로드 미들웨어 추가
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // 업로드 폴더 정적 제공
app.use(express.static(path.join(__dirname))); // 정적 파일 폴더 설정
app.use(express.static(path.join(__dirname, "public")));

// 라우트 연결
const productRoutes = require("./routes/product");
app.use("/api/Products", productRoutes);
const signupRoutes = require("./routes/signup");
app.use("/api/members", signupRoutes);
const loginRoutes = require("./routes/login");
app.use("/api", loginRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("인증 토큰이 없습니다."));
  }

  try {
    const decoded = jwt.verify(token, secretKey); // 토큰 검증
    socket.user = decoded; // 검증된 사용자 정보 저장
    next();
  } catch (error) {
    console.error("토큰 검증 실패:", error.message);
    return next(new Error("토큰이 유효하지 않습니다."));
  }
});

// Socket.IO 연결 설정
io.on("connection", (socket) => {
  console.log("클라이언트 연결됨:", socket.id);

  // 특정 상품 방 참여
  socket.on("joinRoom", (productId) => {
    socket.join(productId);
    console.log(`클라이언트 ${socket.id}가 상품 ${productId} 방에 참여`);
  });

  // 입찰 처리
  socket.on("placeBid", async ({ productId, bidAmount, userId }) => {
    console.log(`입찰 요청: 상품 ${productId}, 금액 ${bidAmount}, 사용자 ${userId}`);

    // MongoDB에서 상품을 가져오고 입찰 금액을 업데이트하는 로직 작성
    try {
      const Product = require("./models/Products"); // Product 모델
      const product = await Product.findById(productId);

      if (!product) {
        socket.emit("error", { message: "상품을 찾을 수 없습니다." });
        return;
      }

      // 경매 종료 시간 확인
      if (new Date() > product.endTime) {
        socket.emit("error", { message: "경매가 종료되었습니다." });
        return;
      }

      // 입찰 금액 검증
      if (bidAmount <= product.currentPrice) {
        socket.emit("error", { message: "입찰 금액은 현재 가격보다 높아야 합니다." });
        return;
      }

      // 입찰 정보 업데이트
      product.currentPrice = bidAmount;
      product.bids.push({ userId, bidAmount, bidTime: new Date() });
      await product.save();

      // 해당 상품 방의 모든 클라이언트에게 가격 업데이트 브로드캐스트
      io.to(productId).emit("priceUpdate", {
        productId,
        currentPrice: product.currentPrice,
        highestBidder: userId,
      });

      console.log(`입찰 성공: 상품 ${productId}, 금액 ${bidAmount}`);
    } catch (error) {
      console.error("입찰 처리 중 오류:", error);
      socket.emit("error", { message: "서버 오류가 발생했습니다." });
    }
  });

  // 클라이언트 연결 해제
  socket.on("disconnect", () => {
    console.log("클라이언트 연결 해제:", socket.id);
  });
});

// 서버 실행
server.listen(3000, () => {
  console.log("3000번 포트에서 서버 실행 중");
});
