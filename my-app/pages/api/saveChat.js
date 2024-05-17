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
      res.status(200).json({ message: 'Chat saved successfully' });
    } catch (error) {
      console.error("Error saving chat:", error);
      res.status(500).json({ message: 'Failed to save chat' });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}