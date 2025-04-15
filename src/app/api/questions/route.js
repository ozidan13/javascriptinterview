import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import Question from '../../../../models/Question';

export async function GET(request) {
  try {
    // Connect to the database first
    const mongoose = await dbConnect();
    if (!mongoose || !mongoose.connection.readyState) {
      console.error("MongoDB connection failed");
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }
    
    // Parse query parameters with defaults
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;
    const shouldFetchCount = page === 1 || searchParams.get('count') === 'true';
    
    try {
      // Execute queries separately with explicit error handling
      const query = {
        // Safe query - only check if fields exist
        question: { $exists: true },
        answer: { $exists: true }
      };
      
      // Fetch questions with timeout
      const questionsPromise = Promise.race([
        Question.find(query)
          .select('id question answer topic difficulty category')
          .sort({ id: 1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Questions query timed out')), 5000)
        )
      ]);
      
      // Fetch count with timeout if needed
      const countPromise = shouldFetchCount 
        ? Promise.race([
            Question.countDocuments(query).exec(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Count query timed out')), 3000)
            )
          ])
        : Promise.resolve(0);
      
      // Execute queries
      const [questions, totalQuestions] = await Promise.all([
        questionsPromise.catch(err => {
          console.error("Error fetching questions:", err);
          return [];
        }),
        countPromise.catch(err => {
          console.error("Error fetching count:", err);
          return 0;
        })
      ]);
      
      // Filter out any invalid items
      const validQuestions = Array.isArray(questions) 
        ? questions.filter(q => q && q.id && q.question)
        : [];
      
      // Return success response
      return NextResponse.json({
        questions: validQuestions,
        totalQuestions: shouldFetchCount ? totalQuestions : null,
        currentPage: page,
        totalPages: shouldFetchCount && totalQuestions ? Math.ceil(totalQuestions / limit) : null,
        limit,
      });
      
    } catch (queryError) {
      console.error("Error during query execution:", queryError);
      return NextResponse.json(
        { error: 'Query execution failed', details: queryError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    // Top-level error handling (connection issues, etc.)
    console.error('Unhandled API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Server error', 
        message: 'Failed to process the request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 