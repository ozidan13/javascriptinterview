'use client';

import { useAppContext } from '../context/AppContext'; // Adjust path

export default function PopularCard() {
  const { getPopularQuestions, openQuestionDetails } = useAppContext();
  const popularQuestions = getPopularQuestions();

  return (
    <div className="card popular-card">
      <h3>Popular Questions</h3>
      <ul className="popular-list">
        {popularQuestions.length > 0 ? (
          popularQuestions.map(question => (
            <li key={`popular-${question.id}`}>
              {/* Use button or link for semantics */}
              <button
                className="link-button" // Style as needed
                onClick={() => openQuestionDetails(question)}
              >
                {question.question}
              </button>
            </li>
          ))
         ) : (
          <li className="empty-list">Loading popular questions...</li> // Show loading or empty state
         )}
      </ul>
    </div>
  );
} 