require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});
const bcrypt = require('bcrypt');
const sendVerification = require('../api/sendVerification');
const verifyPassword = require('../api/verifyPassword');
const verifyCodeHandler = require('../api/verifyCode');

const chatMessage = require('../api/chatMessage'); // 모델 임포트
const generateHandler = require('../api/generate');
const saveChatHandler = require('../api/saveChat');
const signupHandler = require('../api/signup');
const getChatsHandler = require('../api/getChats');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));


// generate.js를 /api/generate 경로에 연결
app.use('/api/generate', generateHandler);
app.use('/api/getChats', getChatsHandler);

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env.local') });
const MONGODB_URI = process.env.MONGODB_URI; // 환경 변수에서 MongoDB URI 가져오기

// MongoDB 연결
const mongoConnect = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB에 성공적으로 연결되었습니다.');
    console.log("연결 상태: ", mongoose.connection.readyState);  // 연결 후 상태 확인

  })
  .catch(err => {
    console.error('MongoDB 연결 실패:', err);
  });
};
mongoConnect();

const db = mongoose.connection.useDb('forum');
let connections = []; // 연결된 클라이언트를 관리하는 배열

app.post('/api/saveChat', saveChatHandler);
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

app.get('/getChats', async (req, res) => {
  try {
      // 채팅 기록을 데이터베이스에서 조회
      const chats = await Chat.find({});
      res.status(200).json(chats);
  } catch (error) {
      res.status(500).json({ message: '채팅 기록을 가져오는데 실패했습니다', error: error });
  }
});

app.post('/api/sendVerification', sendVerification);
app.post('/api/verifyPassword', verifyPassword);
app.get('/api/verifyPassword', verifyPassword);
app.post('/api/verifyCode', verifyCodeHandler);

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    // 입력 데이터 검증
    // if (!email.includes('@')) {
    //   return res.status(400).json({ error: 'Invalid email format' });
    // }
    // if (password.length < 6) {
    //   return res.status(400).json({ error: 'Password too short' });
    // }
    
    const hash = await bcrypt.hash(password, 10);
    // 회원가입 로직 (데이터베이스 저장 등)
    const result = await db.collection('user_cred').insertOne({ email, password: hash });
    
    if (result.insertedCount === 0) {
      throw new Error('Signup failed');
    }

    res.status(201).json({ message: 'Signup successful', userId: result.insertedId });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 입력 데이터 검증
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 데이터베이스에서 사용자 찾기
    const user = await db.collection('user_cred').findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // 비밀번호 검증
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 로그인 성공
    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`서버가 ${PORT}포트에서 실행 중입니다...`));
