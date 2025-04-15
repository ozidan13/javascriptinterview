// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { DB_NAME, ensureDbNameInUri } = require('../lib/db-config');

// Load questions data from JSON file
async function loadQuestionsData() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'datajs.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error loading JSON data:', error);
    process.exit(1);
  }
}

async function seedDatabase() {
  // Get MongoDB connection variables
  const MONGODB_URI_TEMPLATE = process.env.MONGODB_URI;
  const MONGODB_USER = process.env.MONGODB_USER;
  const MONGODB_PASS = process.env.MONGODB_PASS;
  const MONGODB_DIRECT_URI = process.env.MONGODB_DIRECT_URI;
  
  console.log('MongoDB Environment Check:');
  console.log('- Target database name:', DB_NAME);

  // First try direct URI
  let uri = MONGODB_DIRECT_URI;
  
  // If no direct URI available, build from template
  if (!uri && MONGODB_URI_TEMPLATE && MONGODB_USER && MONGODB_PASS) {
    uri = MONGODB_URI_TEMPLATE
      .replace('{{MONGODB_USER}}', MONGODB_USER)
      .replace('{{MONGODB_PASS}}', MONGODB_PASS);
  }
  
  // Ensure database name is included
  uri = ensureDbNameInUri(uri);
  
  if (!uri) {
    console.error('Failed to construct MongoDB URI. Please check environment variables.');
    process.exit(1);
  }
  
  // Print masked URI for debugging
  const maskedUri = uri.replace(MONGODB_PASS || '', '********');
  console.log('Using connection string:', maskedUri);
    
  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB successfully');

    const db = client.db();
    const questionsCollection = db.collection('questions');

    // Check if data already exists
    const count = await questionsCollection.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} questions. Clearing collection...`);
      await questionsCollection.deleteMany({});
    }

    // Load and insert questions
    const questions = await loadQuestionsData();
    console.log(`Loaded ${questions.length} questions from JSON file`);

    // Insert questions into MongoDB
    const result = await questionsCollection.insertMany(questions);
    console.log(`Successfully inserted ${result.insertedCount} questions`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the seeding function
seedDatabase(); 