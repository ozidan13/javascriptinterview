import mongoose from 'mongoose';

// Define the schema with the same structure as the JSON data
const QuestionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true // Add index for faster sorting/queries
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    index: true // Add index for potential filtering by topic
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    index: true // Add index for filtering by difficulty
  },
  category: {
    type: String,
    index: true // Add index for filtering by category
  }
}, { 
  timestamps: true,
  autoIndex: process.env.NODE_ENV !== 'production' // Only auto-index in development
});

// Create compound indexes for common query patterns
QuestionSchema.index({ difficulty: 1, category: 1 });

// Only compile the model once
export default mongoose.models.Question || mongoose.model('Question', QuestionSchema); 