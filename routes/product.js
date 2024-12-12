const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const checkLogin = require("../middlewares/checkLogin");
const Product = require("../models/Products"); // Product 모델 가져오기
const cookieParser = require("cookie-parser");
const productController = require("../controllers/productController");
const scheduleAuctionEnd = require("../middlewares/auctionScheduler");


router.use(cookieParser());

// 1. 상품 등록 (POST /api/products/add)
router.route("/add").post(checkLogin, async (req, res) => {
  try {
    const { name, startPrice, description, category, status, endTime, memberId } =
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
      registeredMemberId: memberId,
      image: imagePath, // 저장된 이미지 경로
      startPrice,
      currentPrice: startPrice,
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


router.get("/", async (req, res) => {
  const { category, search, minPrice, maxPrice, priceRange } = req.query;

  const query = {};

  // 카테고리 필터
  if (category) {
    query.category = category;
  }

  // 검색어 필터
  if (search) {
    query.name = { $regex: search, $options: "i" }; // 대소문자 무시
  }

  // 가격 필터
  if (priceRange) {
    const ranges = Array.isArray(priceRange) ? priceRange : [priceRange];
    const priceConditions = ranges.map((range) => {
      const [min, max] = range.split("-").map(Number);
      return { currentPrice: { $gte: min, $lte: max } };
    });

    query.$or = priceConditions; // 여러 가격 범위를 OR 조건으로 추가
  }

  // 직접 입력된 가격 필터 처리
  if (minPrice && maxPrice) {
    query.currentPrice = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
  }

  try {
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "상품 데이터를 가져오는 데 실패했습니다." });
  }
});


// 찜한 상품 목록 조회 API
router.get("/liked", async (req, res) => {
  const userId = req.query.userId; // 사용자 ID를 쿼리에서 받음
  try {
    const likedProducts = await Product.find({ likedBy: userId }); // likedBy 필드에 사용자 ID가 포함된 상품만 검색
    res.status(200).json(likedProducts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "찜한 상품 데이터를 가져오는 중 오류가 발생했습니다." });
  }
});

// 찜한 상품 목록 조회 API
router.get("/registered", async (req, res) => {
  const userId = req.query.userId; // 사용자 ID를 쿼리에서 받음
  try {
    const registeredProducts = await Product.find({ registeredMemberId: userId }); // likedBy 필드에 사용자 ID가 포함된 상품만 검색
    res.status(200).json(registeredProducts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "등록중인 경매 상품 데이터를 가져오는 중 오류가 발생했습니다." });
  }
});

// 찜 수 기준 상위 5개 상품 API
router.get("/top-likes", async (req, res) => {
  try {
    const currentTime = new Date();
    const topProducts = await Product.find({endTime : { $gt: currentTime}})
      .sort({ likes: -1 }) // 찜 수 내림차순 정렬
      .limit(5); // 상위 5개만 가져오기

    res.status(200).json(topProducts);
  } catch (err) {
    res
      .status(500)
      .json({ error: "상품 데이터를 가져오는 중 오류가 발생했습니다." });
  }
});

// 찜 수 증가 API
router.post("/:id/like", async (req, res) => {
  const userId = req.body.userId; // 요청에서 사용자 ID를 받음
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 이미 찜한 사용자 확인
    if (product.likedBy.includes(userId)) {
      // 이미 찜한 경우: 찜 해제
      product.likes -= 1; // 찜 수 감소
      product.likedBy = product.likedBy.filter((id) => id !== userId); // 사용자 ID 제거
    } else {
      // 찜하지 않은 경우: 찜 추가
      product.likes += 1; // 찜 수 증가
      product.likedBy.push(userId); // 사용자 ID 추가
    }
    await product.save(); // 데이터베이스에 저장

    res.json({ likes: product.likes }); // 변경된 찜 수 반환
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", productController.getProductDetails);

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
