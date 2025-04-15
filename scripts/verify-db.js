// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

async function verifyConnection() {
  const MONGODB_URI_TEMPLATE = process.env.MONGODB_URI;
  const MONGODB_USER = process.env.MONGODB_USER;
  const MONGODB_PASS = process.env.MONGODB_PASS;
  
  if (!MONGODB_URI_TEMPLATE) {
    console.error('ERROR: MONGODB_URI template environment variable is not set');
    process.exit(1);
  }
  if (!MONGODB_USER) {
    console.error('ERROR: MONGODB_USER environment variable is not set');
    process.exit(1);
  }
  if (!MONGODB_PASS) {
    console.error('ERROR: MONGODB_PASS environment variable is not set');
    process.exit(1);
  }

  // Construct the final URI
  const MONGODB_URI = MONGODB_URI_TEMPLATE
    .replace('${MONGODB_USER}', MONGODB_USER)
    .replace('${MONGODB_PASS}', MONGODB_PASS);

  console.log('Attempting to connect to MongoDB...');
  
  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    
    console.log(`SUCCESS: Connected to MongoDB (${mongoose.connection.readyState})`);
    console.log(`Database name: ${connection.connection.db.databaseName}`);
    
    // Check if questions collection exists and has documents
    const collections = await connection.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`Available collections: ${collectionNames.join(', ')}`);
    
    if (collectionNames.includes('questions')) {
      const count = await connection.connection.db.collection('questions').countDocuments();
      console.log(`Questions collection contains ${count} documents`);
      
      if (count === 0) {
        console.warn('WARNING: Questions collection is empty. Consider running seed script.');
      }
    } else {
      console.warn('WARNING: Questions collection does not exist. Consider running seed script.');
    }
    
  } catch (error) {
    console.error('ERROR: Failed to connect to MongoDB:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.error('This may be due to network issues or incorrect connection string.');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Connection closed');
  }
}

// Run the verification
verifyConnection(); 