// Load environment variables
require('dotenv').config();

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

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

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

const sampleQuestions = [
  {
    id: 1,
    question: "What is JavaScript?",
    answer: "JavaScript is a programming language that enables interactive web pages.",
    topic: "Basics"
  },
  {
    id: 2,
    question: "What is a closure in JavaScript?",
    answer: "A closure is a function that has access to its outer function's scope, even after the outer function has returned.",
    topic: "Advanced"
  },
  {
    id: 3,
    question: "Explain event delegation",
    answer: "Event delegation is a technique of attaching an event listener to a parent element instead of individual child elements.",
    topic: "DOM"
  }
];

async function seedDatabase() {
  console.log('Attempting to connect to MongoDB...');
  
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('javascriptinterview');
    const collection = db.collection('questions');
    
    // Check if collection already has data
    const count = await collection.countDocuments();
    console.log(`Collection has ${count} documents`);
    
    if (count === 0) {
      // Insert sample data if collection is empty
      const result = await collection.insertMany(sampleQuestions);
      console.log(`${result.insertedCount} documents inserted`);
    } else {
      console.log('Collection already has data, skipping seed');
    }
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seeding function
seedDatabase(); 