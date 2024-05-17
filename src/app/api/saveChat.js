import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      if (!req.body.chatData) {
        throw new Error("chatData is undefined");
      }

      const client = await MongoClient.connect(process.env.MONGODB_URI);
      const db = client.db();
      const collection = db.collection("chats");

      // insertMany를 사용하여 여러 문서를 삽입
      await collection.insertMany(req.body.chatData);

      client.close();
      res.status(200).json({ message: '채팅이 성공적으로 저장되었습니다.' });
    } catch (error) {
      console.error("Error saving chat:", error);
      res.status(500).json({ message: '채팅 저장에 실패하였습니다.' });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}