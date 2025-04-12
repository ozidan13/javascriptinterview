import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import Question from '../../../../models/Question';

export async function GET() {
  console.log('API route /api/questions called');
  
  try {
    // Connect to the database
    console.log('Attempting to connect to MongoDB...');
    await dbConnect();
    console.log('Successfully connected to MongoDB');
    
    // Verify Question model is available
    if (!Question) {
      console.error('Question model is not defined');
      return NextResponse.json(
        { error: 'Database model not available' },
        { status: 500 }
      );
    }
    
    // Fetch all questions from the database with proper error handling
    console.log('Fetching questions from database...');
    const questions = await Question.find({}).select('-__v -createdAt -updatedAt').lean();
    
    if (!questions) {
      console.log('No questions found in database');
      return NextResponse.json([], { status: 200 });
    }
    
    console.log(`Retrieved ${questions.length} questions successfully`);
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error in /api/questions route:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific MongoDB/Mongoose errors
    let errorMessage = 'Failed to fetch questions from database';
    let statusCode = 500;
    
    if (error.name === 'MongooseServerSelectionError') {
      errorMessage = 'Unable to connect to MongoDB server';
      console.error('MongoDB connection failed: Server selection error');
    } else if (error.name === 'MongooseError') {
      errorMessage = 'MongoDB operation failed';
      console.error('Mongoose error:', error.message);
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Data validation failed';
      statusCode = 400;
      console.error('Validation error:', error.message);
    }
    
    // More detailed error response
    if (process.env.NODE_ENV === 'development') {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
      
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
} 