import { MongoClient } from 'mongodb';
import { DB_NAME, ensureDbNameInUri } from './db-config';

const MONGODB_URI_TEMPLATE = process.env.MONGODB_URI;
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASS = process.env.MONGODB_PASS;
const MONGODB_DIRECT_URI = process.env.MONGODB_DIRECT_URI;

// Log availability of environment variables
console.log('[mongodb.js] Config Check:');
console.log('- Using database name:', DB_NAME);

// First try direct URI
let uri = MONGODB_DIRECT_URI;

// If no direct URI, build from template
if (!uri && MONGODB_URI_TEMPLATE && MONGODB_USER && MONGODB_PASS) {
  uri = MONGODB_URI_TEMPLATE
    .replace('{{MONGODB_USER}}', MONGODB_USER)
    .replace('{{MONGODB_PASS}}', MONGODB_PASS);
}

// Ensure the database name is included
uri = ensureDbNameInUri(uri);

if (!uri) {
  throw new Error('Failed to construct MongoDB URI. Please check environment variables.')
}

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  maxPoolSize: 10, // Limit connection pool for serverless
  serverSelectionTimeoutMS: 5000, // Quick timeout for serverless functions
  socketTimeoutMS: 30000, // Longer socket timeout
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 