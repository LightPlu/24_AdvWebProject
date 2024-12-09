const express = require("express");
const router = express.Router();
const Inquiry = require("../models/inquiries");

// 문의 내용 저장 API
router.post("/inquiry/:userId", async (req, res) => {
  const { userId } = req.params; // 클라이언트에서 전달받은 userId
  const { title, message } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ message: "userId가 제공되지 않았습니다." });
    }

    if (!title || !message) {
      return res.status(400).json({ message: "모든 필드를 입력해주세요." });
    }

    // 기존 문서 확인
    let inquiry = await Inquiry.findOne({ userId });

    if (!inquiry) {
      // 문서가 없으면 새로 생성
      inquiry = new Inquiry({
        userId,
        inquiries: [],
      });
    }

    // 새 문의사항 추가
    inquiry.inquiries.push({ title,message });
    await inquiry.save();

    res.status(201).json({ message: "문의가 성공적으로 제출되었습니다!" });
  } catch (error) {
    console.error("문의 저장 오류:", error);
    res.status(500).json({ message: "문의 저장 중 오류 발생", error: error.message });
  }
});



// 문의 내역 조회 API
router.get("/inquiries/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // 클라이언트에서 전달받은 userId

    if (!userId) {
      return res.status(400).json({ message: "userId가 제공되지 않았습니다." });
    }

    // 특정 userId에 해당하는 문의 내역 가져오기
    const inquiries = await Inquiry.find({ userId }).sort({ date: -1 }); // 최신순 정렬

    if (!inquiries || inquiries.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(inquiries);
  } catch (error) {
    console.error("문의 내역 조회 오류:", error);
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
