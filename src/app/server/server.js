
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const chatMessage = require('../api/chatMessage'); // 모델 임포트

const app = express();
app.use(express.json());
app.use(cors());
// 또는 특정 출처만 허용
app.use(cors({
  origin: 'http://localhost:3000' // 클라이언트 주소
}));
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env.local') });
const MONGODB_URI = process.env.MONGODB_URI; // 환경 변수에서 MongoDB URI 가져오기
// MongoDB 연결
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB에 연결되었습니다...'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

const db = mongoose.connection.useDb("forum");

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

app.post('/api/saveChat', (req, res) => {
  // 채팅 저장 로직
  res.status(200).send('Chat saved');
});

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    // 입력 데이터 검증
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password too short' });
    }

    // 회원가입 로직 (데이터베이스 저장 등)
    const result = await db.collection('user_cred').insertOne({ email, password });
    if (result.insertedCount === 0) {
      throw new Error('Signup failed');
    }

    res.status(201).json({ message: 'Signup successful', userId: result.insertedId });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`서버가 ${PORT}포트에서 실행 중입니다...`));
