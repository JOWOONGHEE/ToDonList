require('dotenv').config();

const { MongoClient } = require('mongodb');
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const handler = async (req, res) => {
  
  if (req.method === "POST") {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db("forum");
    console.log(db.databaseName);
    try {
      const { email, password, verificationCode } = req.body;

      if (verificationCode) {
        // 인증번호 확인 로직
        const user = await db.collection("user_cred").findOne({ email, verificationCode });
        if (!user) {
          return res.status(400).json({ error: '유효하지 않은 인증번호입니다.' });
        }

        await db.collection("user_cred").updateOne({ email }, { $set: { verified: true }, $unset: { verificationCode: "" } });
        return res.status(200).json('이메일 인증이 완료되었습니다.');
      } else {
        // 회원가입 로직
        if (!email || !password) {
          return res.status(400).json({ error: '이메일과 비밀번호는 필수입니다.' });
        }

        const hash = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 인증번호 생성
        const result = await db.collection("user_cred").updateOne(
          { email },
          { $set: { verificationCode, verified: false } },
          { upsert: true }
        );
        // 이메일 전송 설정
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          port:465,
          secure:'true',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_KEY
          }
        });

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: email,
          subject: '이메일 인증',
          text: `다음 인증번호를 입력하여 이메일을 인증하세요: ${verificationCode}`
        };

        console.log('메일 옵션:', mailOptions);
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('이메일 전송 실패:', error);
            return res.status(500).json({ error: '이메일 전송 실패' });
          } else {
            console.log('이메일 전송 성공:', info.response);
            res.status(201).json('인증번호가 이메일로 전송되었습니다.');
          }
        });
      }
    } catch (error) {
      console.error('서버 오류:', error);
      res.status(500).json({ error: '서버 에러 발생' });
    } finally {
      client.close();
    }
  } else {
    res.status(405).json({ error: '허용되지 않은 메소드입니다.' });
  }
};


module.exports = handler;


