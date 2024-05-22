require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const chatMessage = require('../api/chatMessage'); // 모델 임포트
const generateHandler = require('../api/generate');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
// generate.js를 /api/generate 경로에 연결
app.use('/api/generate', generateHandler);

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env.local') });
const MONGODB_URI = process.env.MONGODB_URI; // 환경 변수에서 MongoDB URI 가져오기
// MongoDB 연결
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB에 연결되었습니다...'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

const db = mongoose.connection;
let connections = []; // 연결된 클라이언트를 관리하는 배열

// 챗 내용을 저장하는 라우트
app.post('/api/messages', async (req, res) => {
  try {
    const { role, content } = req.body;
    if (!role || !content) {
      return res.status(400).json({ error: 'Role and content are required.' });
    }

    const newMessage = new ChatMessage({ role, content });
    await newMessage.save();
    res.status(201).send(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// 채팅 생성 및 스트리밍 응답을 처리하는 라우트
app.post('/api/generate', async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const endpoint  = req.query.endpoint;
  if (endpoint === 'chat') {
    try {
      const { message } = req.body;
      // 채팅 처리 로직 구현
      console.log('Received message:', message);
      res.status(200).send({ success: true, message: '응답 메시지' });
    } catch (error) {
      res.status(500).send({ message: '채팅 처리 중 오류 발생', error });
    }
  } else if (endpoint === 'reset') {
    // 채팅 리셋 로직 구현
    res.status(200).send({ success: true });
  } else if (endpoint === 'stream') {
    res.status(200).send({ success: true });
  } else {
    res.status(404).send("Not Found");
}
});

app.get('/api/generate', (req, res) => {
  const { endpoint } = req.query;
  if (endpoint === 'stream') {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    
    connections.push(res); // 새 클라이언트 연결 추가
    req.on('close', () => {
      connections = connections.filter(conn => conn !== res); // 연결이 종료될 때 배열에서 제거
    });
    // 스트림 데이터를 보내는 로직
    setInterval(() => {
      res.write(`data: ${JSON.stringify({ message: "Hello from server!" })}\n\n`);
    }, 1000);
    // 스트리밍 로직 구현
    res.status(200).send({ success: true, message: '스트리밍 시작됨' });
  } else {
    res.status(404).send({ error: 'Invalid endpoint' });
  }
  
});

app.post('/api/messages', async (req, res) => {
  try {
    const { role, content } = req.body;
    const newMessage = new chatMessage({ role, content });
    await newMessage.save();
    connections.forEach(conn => {
      conn.write(`data: ${JSON.stringify({ role, content })}\n\n`);
    });
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
