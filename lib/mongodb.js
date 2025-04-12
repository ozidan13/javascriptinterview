import { MongoClient } from 'mongodb';

// Check for MongoDB URI
if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local or Vercel environment variables')
}

const uri = process.env.MONGODB_URI.trim();
const options = {
  maxPoolSize: 10, // Limit connection pool for serverless
  serverSelectionTimeoutMS: 10000, // Increased timeout for serverless
  socketTimeoutMS: 45000, // Increased socket timeout
  connectTimeoutMS: 10000, // Connection timeout
};

console.log(`MongoDB client attempting to connect with URI: ${uri.replace(/:[^:]*@/, ':****@')}`);

// Function to connect with retry
const connectWithRetry = async (uri, options, retries = 3, backoff = 1000) => {
  const client = new MongoClient(uri, options);
  
  try {
    console.log(`MongoDB connection attempt ${4 - retries}...`);
    await client.connect();
    console.log(`MongoDB client connected successfully`);
    return client;
  } catch (error) {
    console.error(`MongoDB connection error (attempt ${4 - retries}):`, error.message);
    
    if (retries <= 1) {
      console.error(`MongoDB connection failed after multiple attempts`);
      throw error;
    }
    
    console.log(`Retrying connection in ${backoff}ms...`);
    await new Promise(resolve => setTimeout(resolve, backoff));
    return connectWithRetry(uri, options, retries - 1, backoff * 2);
  }
};

let client;
let clientPromise;

// Create a global MongoDB connection cache
if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global;
  
  if (!globalWithMongo._mongoClientPromise) {
    console.log('Creating new MongoDB client in development mode');
    globalWithMongo._mongoClientPromise = connectWithRetry(uri, options)
      .then(client => {
        console.log('MongoDB client connection cached for development');
        return client;
      })
      .catch(err => {
        console.error('Failed to connect to MongoDB in development:', err);
        throw err;
      });
  } else {
    console.log('Using existing MongoDB client in development mode');
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  console.log('Creating new MongoDB client in production mode');
  try {
    clientPromise = connectWithRetry(uri, options)
      .then(client => {
        console.log('MongoDB client initialized in production');
        return client;
      });
  } catch (error) {
    console.error('Error initializing MongoDB client in production:', error);
    throw error;
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 