require('dotenv').config();
const { MongoClient } = require('mongodb');

async function verifyCode(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: '허용되지 않은 메소드입니다.' });
    }

    const { email, verificationCode } = req.body;
    if (!email || !verificationCode) {
        return res.status(400).json({ error: '이메일과 인증번호 모두 필요합니다.' });
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db("forum");
    const user = await db.collection("user_cred").findOne({ email, verificationCode });

    if (!user) {
        client.close();
        return res.status(400).json({ error: '유효하지 않은 인증번호입니다.' });
    }

    res.status(200).json({ message: '인증번호가 확인되었습니다.' });
    client.close();
}

module.exports = verifyCode;