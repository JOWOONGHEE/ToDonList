const { MongoClient } = require('mongodb');
const Chat = require('../models/Chat');

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { chatHistory } = req.body;
      if (!req.body.chatHistory) {
        throw new Error("chatHistory is undefined");
      }
      const chat = new Chat({
        chatHistory: req.body.chatHistory
      });
      const client = await MongoClient.connect(process.env.MONGODB_URI);
      const db = client.db('Chat');
      const collection = db.collection("chats");

      const result = await collection.insertOne({ chatHistory, createdAt: new Date() });
      console.log("Insert result:", result);
      console.log("채팅 저장 완료");
      client.close();
      res.status(200).json({ message: '채팅이 성공적으로 저장되었습니다.' });
    } catch (error) {
      console.error("Error saving chat:", error);
      if (error.message === "chatData is undefined") {
        res.status(400).json({ message: 'chatData가 정의되지 않았습니다.' });
      } else {
        res.status(500).json({ message: '채팅 저장에 실패하였습니다.' });
      }
    }
  } else {
    console.log("채팅 저장 실패");
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

module.exports = handler;

