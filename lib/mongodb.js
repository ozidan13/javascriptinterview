import { MongoClient } from 'mongodb';

// Check for MongoDB URI
if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local or Vercel environment variables')
}

const uri = process.env.MONGODB_URI.trim();
const options = {
  maxPoolSize: 10, // Limit connection pool for serverless
  serverSelectionTimeoutMS: 5000, // Quick timeout for serverless functions
  socketTimeoutMS: 30000, // Longer socket timeout
};

let client;
let clientPromise;

// Create a global MongoDB connection cache
if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global;
  
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .catch(err => {
        console.error('Failed to connect to MongoDB in development:', err);
        throw err;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  try {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
    console.log('MongoDB client initialized in production');
  } catch (error) {
    console.error('Error initializing MongoDB client in production:', error);
    throw error;
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 