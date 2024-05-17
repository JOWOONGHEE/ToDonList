
const express = require('express');
const mongoose = require('mongoose');
const chatMessage = require('../api/chatMessage'); // 모델 임포트

const app = express();
app.use(express.json());
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env.local') });
const MONGODB_URI = process.env.MONGODB_URI; // 환경 변수에서 MongoDB URI 가져오기
// MongoDB 연결
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB에 연결되었습니다...'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

// app.get('/', (req, res) => {
//   res.send('홈페이지에 오신 것을 환영합니다!');
// });
// 챗 내용을 저장하는 라우트
app.post('/api/messages', async (req, res) => {
  try {
    const { role, content } = req.body;
    const newMessage = new chatMessage({ role, content });
    await newMessage.save();
    res.status(201).send(newMessage);
  } catch (error) {
    res.status(400).send(error);
  }
});

//로그인 라우트
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // 여기에서 로그인 로직을 구현합니다.
  // 예를 들어, 사용자 이름과 비밀번호가 맞다면:
  if (username === 'test' && password === '1234') {
    res.json({ success: true, token: 'fake-jwt-token', name: 'Test User', email: 'test@example.com' });
  } else {
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`서버가 ${PORT}포트에서 실행 중입니다...`));
