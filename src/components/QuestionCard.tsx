'use client';

import { Question, useAppContext } from '../context/AppContext'; // Adjust if needed

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const { openQuestionDetails, toggleBookmark, bookmarkedQuestions, getQuestionTopic } = useAppContext();

  const isBookmarked = bookmarkedQuestions.includes(question.id);
  const topic = getQuestionTopic(question);
  
  // Get icon based on topic
  const getTopicIcon = (topic: string): string => {
    const iconMap: {[key: string]: string} = {
      'Basics': 'fa-code',
      'Functions': 'fa-function',
      'Objects': 'fa-cube',
      'Arrays': 'fa-layer-group',
      'Scope': 'fa-box',
      'Closures': 'fa-box',
      'Classes': 'fa-sitemap',
      'Promises': 'fa-clock',
      'Advanced': 'fa-rocket',
      'DOM': 'fa-file-code',
      'Events': 'fa-bolt',
    };
    
    return iconMap[topic] || 'fa-code';
  };

  return (
    <div className="question-card" onClick={() => openQuestionDetails(question)}>
      <div className="question-header">
        <div className="question-meta">
          <span className="question-id">#{question.id}</span>
          <span className="question-topic">
            <i className={`fas ${getTopicIcon(topic)}`}></i>
            {topic}
          </span>
        </div>
        <button
          className={`bookmark-icon ${isBookmarked ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when clicking bookmark
            toggleBookmark(question.id);
          }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <i className={`${isBookmarked ? 'fas' : 'far'} fa-bookmark`}></i>
          <span className="tooltip">{isBookmarked ? 'Remove bookmark' : 'Add bookmark'}</span>
        </button>
      </div>
      <h3 className="question-title">{question.question}</h3>
      <div className="card-footer">
        <div className="difficulty-indicator">
          <span className={`difficulty ${topic.toLowerCase().includes('advanced') ? 'hard' : topic.toLowerCase().includes('basics') ? 'easy' : 'medium'}`}>
            {topic.toLowerCase().includes('advanced') ? 'Advanced' : topic.toLowerCase().includes('basics') ? 'Basic' : 'Intermediate'}
          </span>
        </div>
        <button
          className="view-btn"
          onClick={(e) => {
            e.stopPropagation();
            openQuestionDetails(question);
          }}
        >
          <i className="fas fa-external-link-alt"></i>
          View Answer
        </button>
      </div>
    </div>
  );
} 