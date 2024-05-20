import { MongoClient } from "mongodb";

async function connectToDatabase(uri) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  return client;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = await connectToDatabase(process.env.MONGODB_URI);
      const db = client.db('Chat');
      const collection = db.collection("chats");

      const chats = await collection.find().toArray();

      client.close();
      res.status(200).json({ chats: chats });
    } catch (error) {
      console.error("Error retrieving chats:", error);
      res.status(500).json({ message: 'Failed to retrieve chats' });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
