// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const { DB_NAME, ensureDbNameInUri } = require('../lib/db-config');

async function verifyConnection() {
  const MONGODB_URI_TEMPLATE = process.env.MONGODB_URI;
  const MONGODB_USER = process.env.MONGODB_USER;
  const MONGODB_PASS = process.env.MONGODB_PASS;
  const MONGODB_DIRECT_URI = process.env.MONGODB_DIRECT_URI;
  
  console.log('MongoDB Environment Check:');
  console.log('- MONGODB_URI template available:', !!MONGODB_URI_TEMPLATE);
  console.log('- MONGODB_USER available:', !!MONGODB_USER);
  console.log('- MONGODB_PASS available:', !!MONGODB_PASS);
  console.log('- MONGODB_DIRECT_URI available:', !!MONGODB_DIRECT_URI);
  console.log('- Using database name:', DB_NAME);

  // First try direct URI
  let MONGODB_URI = MONGODB_DIRECT_URI;
  
  // If no direct URI available, build from template
  if (!MONGODB_URI && MONGODB_URI_TEMPLATE && MONGODB_USER && MONGODB_PASS) {
    console.log('Building URI from template...');
    MONGODB_URI = MONGODB_URI_TEMPLATE
      .replace('{{MONGODB_USER}}', MONGODB_USER)
      .replace('{{MONGODB_PASS}}', MONGODB_PASS);
  }
  
  // Ensure database name is included
  MONGODB_URI = ensureDbNameInUri(MONGODB_URI);
  
  if (!MONGODB_URI) {
    console.error('ERROR: Could not construct MongoDB URI');
    process.exit(1);
  }

  // Print masked URI for debugging
  const maskedUri = MONGODB_URI.replace(MONGODB_PASS || '', '********');
  console.log('Using connection string:', maskedUri);

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