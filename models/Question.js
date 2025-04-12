import mongoose from 'mongoose';

// Define the schema with the same structure as the JSON data
const QuestionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
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
    type: String
  }
}, { timestamps: true });

// Handle model compilation with error catching
let Question;
try {
  // Only compile the model once
  Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
  console.log('Question model compiled successfully');
} catch (error) {
  console.error('Error compiling Question model:', error);
  throw error;
}

export default Question; 