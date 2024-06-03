require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function verifyPassword(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: '허용되지 않은 메소드입니다.' });
    }

    const { email, verificationCode, password } = req.body;
    if (!email || !verificationCode || !password) {
        return res.status(400).json({ error: '이메일, 인증번호, 비밀번호 모두 필요합니다.' });
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db("forum");
    const user = await db.collection("user_cred").findOne({ email, verificationCode });

    if (!user) {
        client.close();
        return res.status(400).json({ error: '유효하지 않은 인증번호입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("user_cred").updateOne(
        { email },
        { $set: { password: hashedPassword, verified: true }, $unset: { verificationCode: "" } }
    );

    res.status(200).json('회원가입이 완료되었습니다.');
    client.close();
}

module.exports = verifyPassword;