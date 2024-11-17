const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // CORS 설정
app.use(fileUpload()); // 파일 업로드 미들웨어 추가
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // 업로드 폴더 정적 제공

// 라우트 연결
const productRoutes = require("./routes/product");
app.use("/api/products", productRoutes);

// 서버 실행
app.listen(3000, () => {
  console.log("3000번 포트에서 서버 실행 중");
});
