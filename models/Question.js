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

// Only compile the model once
export default mongoose.models.Question || mongoose.model('Question', QuestionSchema); 