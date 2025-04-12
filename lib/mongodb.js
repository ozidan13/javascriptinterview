import { MongoClient } from 'mongodb';

// Check MongoDB URI
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const uri = process.env.MONGODB_URI.trim();
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve connection between hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
    console.log('New MongoDB client connection created in development');
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new connection for each instance
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
  console.log('New MongoDB client connection created in production');
}

// Export the client promise
export default clientPromise; 