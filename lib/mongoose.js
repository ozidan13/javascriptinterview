import mongoose from 'mongoose';

// Check for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Set mongoose options
mongoose.set('strictQuery', false);

// Global connection cache
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Log current MongoDB connection state
  const connectionState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  console.log(`Current mongoose connection state: ${states[connectionState]}`);

  if (cached.conn) {
    console.log('Using existing mongoose connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
    };

    console.log('Creating new mongoose connection');
    
    try {
      cached.promise = mongoose.connect(MONGODB_URI.trim(), options);
      
      // Add event listeners for connection
      mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to MongoDB');
      });
      
      mongoose.connection.on('error', (err) => {
        console.error('Mongoose connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('Mongoose disconnected from MongoDB');
      });
    } catch (error) {
      console.error('Error initializing mongoose connection:', error);
      cached.promise = null;
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Error awaiting mongoose connection promise:', error);
    cached.promise = null;
    throw error;
  }
}

export default dbConnect; 