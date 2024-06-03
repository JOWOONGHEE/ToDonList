require('dotenv').config();
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

async function sendVerification(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: '허용되지 않은 메소드입니다.' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: '이메일은 필수입니다.' });
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db("forum");
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await db.collection("user_cred").updateOne(
        { email },
        { $set: { verificationCode, verified: false } },
        { upsert: true }
    );

    const transporter = nodemailer.createTransport({
        service: 'gmail',
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

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('이메일 전송 실패:', error);
            return res.status(500).json({ error: '이메일 전송 실패' });
        } else {
            console.log('이메일 전송 성공:', info.response);
            res.status(201).json('인증번호가 이메일로 전송되었습니다.');
        }
    });

    client.close();
}

module.exports = sendVerification;