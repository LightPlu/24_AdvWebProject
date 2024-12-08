const express = require("express");
const router = express.Router();
const Inquiry = require("../models/inquiry");

// 문의 내용 저장 API
router.post("/inquiry", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const inquiry = new Inquiry({ name, email, message });
    await inquiry.save();
    res.status(201).json({ message: "문의가 성공적으로 제출되었습니다!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "문의 저장 중 오류 발생", error: error.message });
  }
});

// 문의 내역 조회 API
router.get("/inquiries", async (req, res) => {
  try {
    // 모든 문의 내역 가져오기
    const inquiries = await Inquiry.find().sort({ date: -1 }); // 최신순 정렬
    res.status(200).json(inquiries);
  } catch (error) {
    res
      .status(500)
      .json({ message: "문의 내역 조회 중 오류 발생", error: error.message });
  }
});

// 문의 답변 저장 API
router.post("/inquiries/:id/answer", async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;

  try {
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ message: "문의 내역을 찾을 수 없습니다." });
    }

    inquiry.answer = answer; // 답변 저장
    await inquiry.save();

    res.status(200).json({ message: "답변이 성공적으로 저장되었습니다." });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "답변 저장 중 오류가 발생했습니다.",
        error: error.message,
      });
  }
});

module.exports = router;
