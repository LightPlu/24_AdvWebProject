const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const Product = require("../models/Products"); // Product 모델 가져오기

// 1. 상품 등록 (POST /api/products/add)
router.post("/add", async (req, res) => {
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

      const filePath = path.join(uploadDir, Date.now() + "-" + image.name);

      // 파일 저장
      await image.mv(filePath);
      imagePath = `/uploads/${Date.now()}-${image.name}`;
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

// 2. 모든 상품 조회 (GET /api/products)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
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
