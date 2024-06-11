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
      const { userEmail, page = 1, limit = 10, listCollections = false } = req.query;
      if (!userEmail) {
        return res.status(400).json({ message: 'userEmail is required' });
      }

      client = await connectToDatabase(process.env.MONGODB_URI);
      const db = client.db('forum');

      if (listCollections) {
        // 모든 컬렉션 목록을 가져오는 로직
        const collections = await db.listCollections().toArray();
        const userCollections = collections
          .filter(col => col.name.startsWith(`chat_`) && col.name.includes(userEmail))
          .map(col => col.name);
        res.status(200).json({ collections: userCollections });
      } else {
        const collection = db.collection("chats");
        const skip = (page - 1) * limit;
        const totalChats = await collection.countDocuments({ userEmail });
        const totalPages = Math.ceil(totalChats / limit);
        const chats = await collection.find({ userEmail })
                                      .sort({ createdAt: 1 })
                                      .skip(parseInt(skip))
                                      .limit(parseInt(limit))
                                      .toArray();
        res.status(200).json({ chats, totalPages });
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
      res.status(500).json({ message: 'Failed to retrieve data' });
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
