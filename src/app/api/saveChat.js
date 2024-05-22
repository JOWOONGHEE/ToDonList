import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      if (!req.body.chatData) {
        throw new Error("chatData is undefined");
      }
    
      const client = await MongoClient.connect(process.env.MONGODB_URI);
      const db = client.db('Chat');
      const collection = db.collection("chats");
    
      await collection.insertMany(req.body.chatData);
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