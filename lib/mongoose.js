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

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds when connecting to the server
      socketTimeoutMS: 8000, // Close sockets after 8 seconds of inactivity
      connectTimeoutMS: 5000, // Timeout after 5 seconds when initial connection fails
      maxPoolSize: 10, // Maintain up to 10 socket connections
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        cached.promise = null; // Reset the promise on error
        throw err; // Re-throw to be caught by the caller
      });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    console.error('Failed to connect to MongoDB:', e.message);
    throw e; // Re-throw after logging
  }
}

export default dbConnect; 