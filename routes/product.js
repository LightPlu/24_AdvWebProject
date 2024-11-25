const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const checkLogin = require("../middlewares/checkLogin");
const Product = require("../models/Products"); // Product 모델 가져오기
const cookieParser = require("cookie-parser");

router.use(cookieParser());

// 1. 상품 등록 (POST /api/products/add)
router
  .route("/add")
  .post(checkLogin, async (req, res) => {
  try {
    const { name, startPrice, description, category, status, endTime } =
      req.body;

    // 필수 필드 확인
    if (!name || !startPrice || !category || !status || !endTime) {
      return res.status(400).json({ message: "모든 필드를 입력해야 합니다." });
    }

    let imagePath = ""; // 이미지 경로 초기화

    // 파일 업로드 처리
    if (req.files && req.files.productImage) {
      const image = req.files.productImage;
      const uploadDir = path.join(__dirname, "../uploads");

      // 업로드 폴더가 없으면 생성
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const timestamp = Date.now(); // 한 번만 호출
      const fileName = `${timestamp}-${image.name}`; // 고유 파일명 생성
      const filePath = path.join(uploadDir, fileName); // 실제 저장 경로

      // 파일 저장
      await image.mv(filePath);
      imagePath = `/uploads/${fileName}`;
    }

    // 새로운 상품 생성
    const newProduct = new Product({
      name,
      image: imagePath, // 저장된 이미지 경로
      startPrice,
      description,
      category,
      status,
      endTime,
    });

    // MongoDB에 저장
    const savedProduct = await newProduct.save();
    res.status(201).json({
      message: "상품이 성공적으로 등록되었습니다.",
      product: savedProduct,
    });
  } catch (err) {
    res.status(500).json({
      message: "상품 등록 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

router.route("/add").get(checkLogin, async (req, res) => {
   // 로그인 상태 검증 후 처리
   if (req.user) {
    res.status(200).json({ message: "상품 등록 페이지 접근 허용" });
  } else {
    res.status(401).json({ message: "로그인이 필요합니다." });
  }
});


// 2. 모든 상품 조회 (GET /api/products)
router.get("/", async (req, res) => {
  const { category, search } = req.query;

  try {
    const query = {};
    // 카테고리가 있을 경우
    if (category) {
      query.category = category;
    }
    // 검색어가 있을 경우
    if (search) {
      query.name = { $regex: search, $options: "i" }; // 상품 이름에서 검색
    }
    const products = await Product.find(query); // MongoDB에서 검색
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      message: "상품 목록을 가져오는 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.status(200).json({
      message: "상품이 성공적으로 삭제되었습니다.",
      product: deletedProduct,
    });
  } catch (err) {
    res.status(500).json({
      message: "상품 삭제 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

module.exports = router;
