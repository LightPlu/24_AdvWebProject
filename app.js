const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const dbConnect = require("./config/dbConnect");

const app = express();

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

// 서버 실행
app.listen(3000, () => {
  console.log("3000번 포트에서 서버 실행 중");
});
