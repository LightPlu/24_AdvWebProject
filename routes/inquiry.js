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

// 답변되지 않은 문의 조회 API (관리자용)
router.get("/unansweredInquiries", async (req, res) => {
  try {
    // answer 필드가 비어 있는 문의만 조회
    const unansweredInquiries = await Inquiry.find({
      "inquiries.answer": { $eq: "" }, // inquiries 배열 안의 answer가 빈 문자열인 것만 필터링
    }).sort({ "inquiries.date": -1 }); // 최신순 정렬

    console.log(unansweredInquiries);

    if (!unansweredInquiries || unansweredInquiries.length === 0) {
      return res.status(200).json([]); // 답변되지 않은 문의가 없을 경우 빈 배열 반환
    }

    res.status(200).json(unansweredInquiries);
  } catch (error) {
    console.error("답변되지 않은 문의 조회 오류 (관리자):", error);
    res
      .status(500)
      .json({ message: "답변되지 않은 문의 조회 중 오류 발생", error: error.message });
  }
});

// 문의 답변 저장 API
router.post("/inquiries/:id/answer", async (req, res) => {
  const { id } = req.params; // 배열 내 문의 ID
  const { answer } = req.body;

  try {
    // 배열 내부의 특정 문의 항목을 찾아 업데이트
    const inquiry = await Inquiry.findOneAndUpdate(
      { "inquiries._id": id }, // inquiries 배열에서 해당 ID를 검색
      { $set: { "inquiries.$.answer": answer } }, // 배열의 해당 항목의 answer를 업데이트
      { new: true } // 업데이트된 문서를 반환
    );

    if (!inquiry) {
      return res.status(404).json({ message: "문의 내용을 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "답변이 성공적으로 저장되었습니다.", inquiry });
  } catch (error) {
    console.error("답변 저장 중 오류:", error);
    res.status(500).json({
      message: "답변 저장 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
