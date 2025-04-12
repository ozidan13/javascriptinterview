'use client';

import { Question, useAppContext } from '../context/AppContext'; // Adjust if needed

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const { openQuestionDetails, toggleBookmark, bookmarkedQuestions, getQuestionTopic } = useAppContext();

  const isBookmarked = bookmarkedQuestions.includes(question.id);

  return (
    <div key={question.id} className="question-card">
      <div className="question-header">
        <span className="question-id">#{question.id}</span>
        <button
          className={`bookmark-icon ${isBookmarked ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when clicking bookmark
            toggleBookmark(question.id);
          }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <i className={`${isBookmarked ? 'fas' : 'far'} fa-bookmark`}></i>
        </button>
      </div>
      <h3 className="question-title">{question.question}</h3>
      <div className="question-tags">
        <span className="question-tag">{getQuestionTopic(question)}</span>
      </div>
      <button
        className="view-btn"
        onClick={() => openQuestionDetails(question)}
      >
        View Answer
      </button>
      {/* Optional: Keep the small indicator if desired */}
      {isBookmarked && (
        <i className="fas fa-bookmark bookmark-indicator"></i>
      )}
    </div>
  );
} 