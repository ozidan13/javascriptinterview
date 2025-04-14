import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import Question from '../../../../models/Question';

export async function GET(request) {
  try {
    // Add a timeout to the overall operation
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timed out')), 8000)
    );
    
    // Connect to the database
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Only fetch the count if on first page or if explicitly requested
    const shouldFetchCount = page === 1 || searchParams.get('count') === 'true';
    
    // Run queries in parallel
    const [questions, totalQuestions] = await Promise.race([
      Promise.all([
        // Fetch a page of questions with optimized query
        Question.find({
          // Ensure we only return questions with required fields
          question: { $exists: true, $ne: "" },
          answer: { $exists: true, $ne: "" },
          id: { $exists: true }
        })
          .select('id title difficulty category question answer topic') // Include all needed fields
          .sort({ id: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
          
        // Only count documents if needed
        shouldFetchCount 
          ? Question.countDocuments({
              // Use same criteria as the main query
              question: { $exists: true, $ne: "" },
              answer: { $exists: true, $ne: "" },
              id: { $exists: true }
            })
          : Promise.resolve(0)
      ]),
      timeoutPromise
    ]);
    
    // Validate questions before returning them
    const validatedQuestions = questions.filter(q => 
      q && typeof q.id === 'number' && typeof q.question === 'string' && q.question.trim() !== ''
    );
    
    return NextResponse.json({
      questions: validatedQuestions,
      totalQuestions: shouldFetchCount ? totalQuestions : null,
      currentPage: page,
      totalPages: shouldFetchCount ? Math.ceil(totalQuestions / limit) : null,
      limit,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    
    // Determine appropriate status code
    const status = error.message === 'Database operation timed out' ? 504 : 500;
    
    // Ensure detailed error logging for Vercel
    return NextResponse.json(
      { 
        error: error.message === 'Database operation timed out' 
          ? 'Request timed out while fetching questions' 
          : 'Failed to fetch questions',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status }
    );
  }
} 