// server/routes/chatRoute.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat'); // 모델 경로 확인

// 모든 채팅 내역 가져오기
router.get('/getChats', async (req, res) => {
  try {
    const chats = await Chat.find({}).sort({ createdAt: -1 }); // 최신 채팅부터 가져오기
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: '서버 에러', error });
  }
});

module.exports = router;