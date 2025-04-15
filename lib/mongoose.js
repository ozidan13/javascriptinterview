import mongoose from 'mongoose';

// Try to get the variables
const MONGODB_URI_TEMPLATE = process.env.MONGODB_URI;
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASS = process.env.MONGODB_PASS;
const MONGODB_DIRECT_URI = process.env.MONGODB_DIRECT_URI;

// Log environment variables availability for debugging
console.log('MongoDB Config Check:');
console.log('- MONGODB_URI template available:', !!MONGODB_URI_TEMPLATE);
console.log('- MONGODB_USER available:', !!MONGODB_USER);
console.log('- MONGODB_PASS available:', !!MONGODB_PASS);
console.log('- MONGODB_DIRECT_URI available:', !!MONGODB_DIRECT_URI);

// First check if we have a direct URI (simplest approach)
let MONGODB_URI = MONGODB_DIRECT_URI;

// If we don't have a direct URI, try to construct it from template
if (!MONGODB_URI && MONGODB_URI_TEMPLATE && MONGODB_USER && MONGODB_PASS) {
  console.log('No direct URI available, constructing from template');
  MONGODB_URI = MONGODB_URI_TEMPLATE
    .replace('{{MONGODB_USER}}', MONGODB_USER)
    .replace('{{MONGODB_PASS}}', MONGODB_PASS);
  
  // Print URI for debugging (with password masked)
  const debugUri = MONGODB_URI.replace(MONGODB_PASS, '********');
  console.log('MongoDB URI structure check:', debugUri);
}

if (!MONGODB_URI) {
  throw new Error(
    'Failed to construct MongoDB URI. Please check environment variables.'
  );
}

console.log('Final MONGODB_URI constructed successfully');

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
  // Return existing connection if active
  if (cached.conn) {
    if (mongoose.connection.readyState === 1) {
      console.log('Using existing MongoDB connection');
      return cached.conn;
    } else {
      // Connection exists but is not active
      console.log('Existing connection broken, reconnecting...');
      cached.conn = null;
      cached.promise = null;
    }
  }

  // Check if we need to create a new connection
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000, // Timeout after 8 seconds when connecting to the server
      socketTimeoutMS: 30000, // Close sockets after 30 seconds of inactivity
      connectTimeoutMS: 8000, // Timeout after 8 seconds when initial connection fails
      maxPoolSize: 5, // Reduced pool size for serverless
      retryWrites: true,
      retryReads: true,
      w: 'majority', // Write concern for MongoDB
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log(`MongoDB connected successfully (${mongoose.connection.readyState})`);
        console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
        
        // Handle serverless connection cleanup
        mongoose.connection.on('error', err => {
          console.error('MongoDB connection error:', err);
          cached.conn = null;
          cached.promise = null;
        });
        
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        console.error('Connection error type:', err.name);
        if (err.name === 'MongoServerSelectionError') {
          console.error('Server selection error - check connection string, network, and MongoDB Atlas settings');
        }
        cached.promise = null; // Reset the promise on error
        throw err; // Re-throw to be caught by the caller
      });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    console.error('Failed to connect to MongoDB:', e.message);
    // Reset connection state on error
    cached.conn = null;
    cached.promise = null;
    throw e; // Re-throw after logging
  }
}

export default dbConnect; 