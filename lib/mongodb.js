import { MongoClient } from 'mongodb';

const MONGODB_URI_TEMPLATE = process.env.MONGODB_URI;
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASS = process.env.MONGODB_PASS;

if (!MONGODB_URI_TEMPLATE) {
  throw new Error('Please add your MongoDB URI template to .env.local')
}
if (!MONGODB_USER) {
  throw new Error('Please add your MONGODB_USER to .env.local')
}
if (!MONGODB_PASS) {
  throw new Error('Please add your MONGODB_PASS to .env.local')
}

const uri = MONGODB_URI_TEMPLATE
  .replace('${MONGODB_USER}', MONGODB_USER)
  .replace('${MONGODB_PASS}', MONGODB_PASS);

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