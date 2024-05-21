const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const newUser = new User({ email, password });
    await newUser.save();
    res.status(201).send('회원가입 성공');
  } catch (error) {
    res.status(400).send('회원가입 실패');
  }
});
// 모든 사용자 조회
router.get('/', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: '서버 에러' });
    }
  });

module.exports = router;