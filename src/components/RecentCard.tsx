'use client';

import { useAppContext } from '../context/AppContext'; // Adjust path

export default function RecentCard() {
  const { getRecentlyViewedQuestions, openQuestionDetails } = useAppContext();
  const recentQuestions = getRecentlyViewedQuestions();

  return (
    <div className="card recent-card">
      <h3>Recently Viewed</h3>
      <ul className="recent-list">
        {recentQuestions.length > 0 ? (
          recentQuestions.map(question => (
            <li key={`recent-${question.id}`}>
              {/* Use button or link for semantics, prevent default if needed */}
              <button
                className="link-button" // Style as needed
                onClick={() => openQuestionDetails(question)}
              >
                {question.question}
              </button>
            </li>
          ))
        ) : (
          <li className="empty-list">No questions viewed yet</li>
        )}
      </ul>
    </div>
  );
} 