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
  if (req.method === 'GET') {
    let client;
    try {
      client = await connectToDatabase(process.env.MONGODB_URI);
      const db = client.db('forum');
      const collection = db.collection("chats");
      const chats = await collection.find({}).sort({ createdAt: -1 }).limit(1).toArray();
      res.status(200).json({ chats: chats });
    } catch (error) {
      console.error("Error retrieving chats:", error);
      res.status(500).json({ message: 'Failed to retrieve chats' });
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

