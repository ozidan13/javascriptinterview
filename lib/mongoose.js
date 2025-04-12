import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// MongoDB connection with retry logic
const connectWithRetry = async (uri, options, retries = 3, backoff = 1000) => {
  try {
    console.log(`MongoDB connection attempt ${4 - retries}...`);
    return await mongoose.connect(uri, options);
  } catch (error) {
    console.error(`MongoDB connection error (attempt ${4 - retries}):`, error.message);
    
    if (retries <= 1) {
      console.error('MongoDB connection failed after multiple attempts');
      throw error;
    }

    console.log(`Retrying connection in ${backoff}ms...`);
    await new Promise(resolve => setTimeout(resolve, backoff));
    return connectWithRetry(uri, options, retries - 1, backoff * 2);
  }
};

async function dbConnect() {
  console.log('Mongoose connection function called');
  
  if (cached.conn) {
    console.log('Using existing mongoose connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Increased timeout for serverless
      socketTimeoutMS: 45000, // Increased socket timeout
      connectTimeoutMS: 10000, // Connection timeout
      maxPoolSize: 10, // Limit connection pool for serverless
      // The following options are specified as strings to avoid deprecation warnings
      // They're properly handled by the driver even if passed as strings
    };
    
    console.log('Setting up new mongoose connection');

    // Trim any whitespace from the connection string
    const trimmedUri = MONGODB_URI.trim();
    console.log(`Using MongoDB URI: ${trimmedUri.replace(/:[^:]*@/, ':****@')}`);
    
    // Attach event listeners to the mongoose connection
    mongoose.connection.on('connected', () => console.log('Mongoose connected to DB'));
    mongoose.connection.on('error', err => console.error('Mongoose connection error:', err));
    mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));

    // Connect with retry logic
    cached.promise = connectWithRetry(trimmedUri, opts)
      .then(mongoose => {
        console.log('MongoDB connected successfully');
        return mongoose;
      });
  } else {
    console.log('Using existing connection promise');
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Final mongoose connection error:', error);
    cached.promise = null;
    throw error;
  }
}

// Handle graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose disconnected on app termination');
    process.exit(0);
  });
}

export default dbConnect; 