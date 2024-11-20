const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const dbConnect = require("./config/dbConnect");

const app = express();

dbConnect();

// MongoDB 연결
mongoose
  .connect("mongodb+srv://lange50300:dlsans1378**@cluster0.bmpv5.mongodb.net/")
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // CORS 설정
app.use(fileUpload()); // 파일 업로드 미들웨어 추가
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // 업로드 폴더 정적 제공
app.use(express.static(path.join(__dirname))); // 정적 파일 폴더 설정

// 라우트 연결
const productRoutes = require("./routes/product");
app.use("/api/products", productRoutes);
const signupRoutes = require("./routes/signup");
app.use("/api/members", signupRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 서버 실행
app.listen(3000, () => {
  console.log("3000번 포트에서 서버 실행 중");
});
