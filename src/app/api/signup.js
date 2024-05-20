
import connectDB from "@/lib/mongodb";
const { MongoClient } = require('mongodb');

import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: '이메일과 비밀번호는 필수입니다.' });
      }
      const hash = await bcrypt.hash(password, 10);
      const db  = await client.db('forum');
      const result = await db.collection('user_cred').insertOne({ email, password: hash });
      console.log(`새로운 사용자가 추가되었습니다: ${result.insertedId}`);
      res.status(201).json('성공');
    } catch (error) {
      res.status(500).json({ error: '서버 에러 발생' });
    }
  } else {
    res.status(405).json({ error: '허용되지 않은 메소드입니다.' });
  }
};

export { handler as GET, handler as POST }