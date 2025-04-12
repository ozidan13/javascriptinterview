import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import Question from '../../../../models/Question';

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();
    
    // Fetch all questions from the database with proper error handling
    const questions = await Question.find({}).select('-__v -createdAt -updatedAt').lean();
    
    if (!questions) {
      console.log('No questions found');
      return NextResponse.json([], { status: 200 });
    }
    
    console.log(`Retrieved ${questions.length} questions successfully`);
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error.message, error.stack);
    
    // More detailed error response
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Failed to fetch questions: ${error.message}`
      : 'Failed to fetch questions from database';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 