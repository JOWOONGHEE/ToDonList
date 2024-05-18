import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // 환경 변수에서 MongoDB URI를 가져옵니다.
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI 환경 변수를 설정해주세요.');
}

if (process.env.NODE_ENV === 'development') {
  // 개발 환경에서는 항상 새로운 MongoClient 인스턴스를 생성합니다.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 프로덕션 환경에서는 캐싱된 클라이언트를 재사용합니다.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;