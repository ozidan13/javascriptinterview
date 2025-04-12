import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import Question from '../../../../models/Question';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Fetch a page of questions
    const questions = await Question.find({})
      .select('-__v -createdAt -updatedAt') // Exclude unnecessary fields
      .sort({ id: 1 }) // Add a sort order if needed, e.g., by ID
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean for performance
      
    // Use estimatedDocumentCount for potentially better performance on large collections
    const totalQuestions = await Question.estimatedDocumentCount();
    
    return NextResponse.json({
      questions,
      totalQuestions,
      currentPage: page,
      totalPages: Math.ceil(totalQuestions / limit),
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    // Ensure detailed error logging for Vercel
    return NextResponse.json(
      { error: 'Failed to fetch questions', details: error.message },
      { status: 500 }
    );
  }
} 