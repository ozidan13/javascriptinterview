import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function GET() {
  console.log('API route /api/questions called');
  
  try {
    // Connect directly using MongoDB client
    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db('javascriptinterview');
    
    console.log('Connected to MongoDB, querying questions collection...');
    const collection = db.collection('questions');
    
    // Fetch questions with basic projection
    const questions = await collection.find({})
      .project({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 })
      .toArray();
    
    console.log(`Retrieved ${questions.length} questions successfully`);
    
    if (!questions || questions.length === 0) {
      console.log('No questions found in database');
      return NextResponse.json([]);
    }
    
    return NextResponse.json(questions);
    
  } catch (error) {
    console.error('Error in /api/questions route:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return a sanitized error message
    return NextResponse.json(
      { error: 'Failed to fetch questions from database' },
      { status: 500 }
    );
  }
} 