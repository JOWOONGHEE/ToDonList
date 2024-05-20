
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: '이메일과 비밀번호는 필수입니다.' });
      }
      const hash = await bcrypt.hash(password, 10);
      let db = (await clientPromise).db('forum');
      await db.collection('user_cred').insertOne({ email, password: hash });
      res.status(200).json('성공');
    } catch (error) {
      res.status(500).json({ error: '서버 에러 발생' });
    }
  } else {
    res.status(405).json({ error: '허용되지 않은 메소드입니다.' });
  }
};