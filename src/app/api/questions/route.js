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

    // Fetch a page of questions and the total count
    const questions = await Question.find({})
      .select('-__v -createdAt -updatedAt')
      .skip(skip)
      .limit(limit)
      .lean();
      
    const totalQuestions = await Question.countDocuments({});
    
    return NextResponse.json({
      questions,
      totalQuestions,
      currentPage: page,
      totalPages: Math.ceil(totalQuestions / limit),
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
} 