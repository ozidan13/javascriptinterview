import mongoose from 'mongoose';

const MONGODB_URI_TEMPLATE = process.env.MONGODB_URI; // The template string like mongodb+srv://${MONGODB_USER}:${MONGODB_PASS}@...
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASS = process.env.MONGODB_PASS;

if (!MONGODB_URI_TEMPLATE) {
  throw new Error(
    'Please define the MONGODB_URI template environment variable inside .env.local'
  );
}
if (!MONGODB_USER) {
  throw new Error(
    'Please define the MONGODB_USER environment variable inside .env.local'
  );
}
if (!MONGODB_PASS) {
  throw new Error(
    'Please define the MONGODB_PASS environment variable inside .env.local'
  );
}

// Construct the final URI
const MONGODB_URI = MONGODB_URI_TEMPLATE
  .replace('${MONGODB_USER}', MONGODB_USER)
  .replace('${MONGODB_PASS}', MONGODB_PASS);

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