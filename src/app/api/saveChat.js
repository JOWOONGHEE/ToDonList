const { MongoClient } = require('mongodb');

async function connectToDatabase(uri) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  return client;
}

const handler = async (req, res) => {
  if (req.method === 'POST') {
    let client;
    try {
      const { userEmail, chatHistory } = req.body;
      console.log("Received data:", { userEmail, chatHistory });
      if (!userEmail || !chatHistory) {
        return res.status(400).json({ message: 'userEmail and chatHistory are required' });
      }

      client = await connectToDatabase(process.env.MONGODB_URI);
      const db = client.db('forum');
      const selectedCollection = db.collection("chats");  // 'chats' 컬렉션을 직접 지정

      await selectedCollection.insertOne({
        userEmail,
        chatHistory,
        createdAt: new Date()
      });

      res.status(200).json({ message: 'Chat saved successfully' });
    } catch (error) {
      console.error("Error saving chat:", error);
      res.status(500).json({ message: 'Failed to save chat' });
    } finally {
      if (client) {
        client.close();
      }
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

module.exports = handler;