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
      const { userEmail, chatHistory, collection } = req.body;
      if (!userEmail || !chatHistory || !collection) {
        return res.status(400).json({ message: 'userEmail, chatHistory, and collection are required' });
      }

      client = await connectToDatabase(process.env.MONGODB_URI);
      const db = client.db('forum');
      const selectedCollection = db.collection(collection);

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
