import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import Question from '../../../../models/Question';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch all questions from the database
    const questions = await Question.find({}).select('-__v -createdAt -updatedAt').lean();
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
} 