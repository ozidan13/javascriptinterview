import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// Path to the JSON data file
const dataFilePath = path.join(process.cwd(), 'public', 'datajs.json');

let allQuestions = [];
let lastModifiedTime = 0;

async function loadQuestionsData() {
  try {
    const stats = await fs.stat(dataFilePath);
    // Reload data only if the file has changed
    if (stats.mtimeMs > lastModifiedTime) {
      console.log('Data file changed, reloading...');
      const jsonData = await fs.readFile(dataFilePath, 'utf8');
      allQuestions = JSON.parse(jsonData);
      lastModifiedTime = stats.mtimeMs;
      // Basic validation
      if (!Array.isArray(allQuestions)) {
        console.error('Invalid JSON data format: Expected an array.');
        allQuestions = [];
      }
    } else {
      console.log('Using cached questions data.');
    }
  } catch (error) {
    console.error('Error loading or parsing questions data:', error);
    allQuestions = []; // Ensure we return an empty array on error
    throw new Error('Failed to load questions data');
  }
}

export async function GET(request) {
  try {
    // Load or get cached questions data
    await loadQuestionsData();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;
    const shouldFetchCount = page === 1 || searchParams.get('count') === 'true';

    // Basic validation on the loaded data
    if (!Array.isArray(allQuestions)) {
      console.error('Questions data is not an array after loading.');
      return NextResponse.json({ error: 'Invalid data source' }, { status: 500 });
    }

    // Paginate the data
    const paginatedQuestions = allQuestions.slice(skip, skip + limit);
    const totalQuestions = allQuestions.length;
    
    // Filter out any invalid items (basic check)
    const validQuestions = paginatedQuestions.filter(q => q && q.id && q.question);

    return NextResponse.json({
      questions: validQuestions,
      totalQuestions: shouldFetchCount ? totalQuestions : null,
      currentPage: page,
      totalPages: shouldFetchCount ? Math.ceil(totalQuestions / limit) : null,
      limit,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Server error', 
        message: error.message || 'Failed to process the request' 
      },
      { status: 500 }
    );
  }
} 